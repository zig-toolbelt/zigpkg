// Package codeberg implements source.Source against Codeberg, a Forgejo
// instance exposing a Gitea-compatible REST API. Unlike GitHub's GraphQL
// endpoint (one request returns repo + topics + tag), Forgejo pages results by
// offset and exposes the latest tag only through a separate request — so this
// source implements source.TagFetcher and the sync loop resolves tags lazily,
// only for repositories that survive the incremental cutoff.
package codeberg

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"

	"golang.org/x/time/rate"

	"zigpkg.dev/sync/httpx"
	"zigpkg.dev/sync/semver"
	"zigpkg.dev/sync/source"
)

const (
	defaultAPIBase = "https://codeberg.org/api/v1"
	defaultWebBase = "https://codeberg.org"

	// searchPageSize is the offset-pagination window. Forgejo caps page size
	// (typically 50), so 50 keeps round trips low without risking truncation.
	searchPageSize = 50

	// Codeberg is a shared community instance with no per-token point budget,
	// only a 429/Retry-After backstop. We self-pace well below that: ~5 req/s
	// with a small burst keeps the crawler a good neighbour.
	codebergRPS   = rate.Limit(5)
	codebergBurst = 5

	// maxTagsScanned bounds how many of a repo's tags LatestTag fetches (the
	// endpoint has no "most recent" ordering guarantee, so this is simply the
	// first page). Only tags within this window are considered when picking
	// the highest semver tag (see semver.Highest) — if a repo has more tags
	// than this and its true highest version falls outside the window, it
	// will be missed. Accepted cost/exhaustiveness trade-off, not a bug: a
	// wider window means a larger response body per repo needing tag
	// resolution, and the vast majority of Zig packages have far fewer than
	// this many tags.
	maxTagsScanned = 30
)

// Source is a Codeberg-backed source.Source. It is not safe for concurrent use;
// the sync job drives it sequentially.
type Source struct {
	apiBase string
	webBase string
	token   string
	http    *http.Client
	limiter *rate.Limiter
}

// NewSource returns a Codeberg-backed source.Source. token is the optional
// CODEBERG_TOKEN; when empty, requests are unauthenticated (subject to a
// stricter instance-wide limit).
func NewSource(token string) source.Source {
	return &Source{
		apiBase: defaultAPIBase,
		webBase: defaultWebBase,
		token:   token,
		// No client-level Timeout: a single Do may span several retries with
		// multi-second Retry-After waits. Cancellation rides the request ctx.
		http: &http.Client{
			Transport: httpx.NewRetryTransport(http.DefaultTransport, httpx.RealClock{}),
		},
		limiter: rate.NewLimiter(codebergRPS, codebergBurst),
	}
}

func (s *Source) Name() string { return "codeberg" }

// SearchPage fetches one page of repositories carrying the given topic. The
// cursor is an offset page number (the first page when empty); topics arrive
// inline so no extra request is needed for them, but tags are not included —
// callers resolve those lazily via LatestTag.
func (s *Source) SearchPage(ctx context.Context, topic, cursor string) (*source.Page, error) {
	page := 1
	if cursor != "" {
		if n, err := strconv.Atoi(cursor); err == nil && n > 0 {
			page = n
		}
	}

	q := url.Values{}
	q.Set("q", topic)
	q.Set("topic", "true")
	q.Set("sort", "updated")
	q.Set("order", "desc")
	q.Set("page", strconv.Itoa(page))
	q.Set("limit", strconv.Itoa(searchPageSize))

	var body searchResponse
	header, err := s.do(ctx, "/repos/search?"+q.Encode(), &body)
	if err != nil {
		return nil, err
	}

	repos := make([]source.Repo, len(body.Data))
	for i := range body.Data {
		repos[i] = s.toRepo(&body.Data[i])
	}

	// Total comes from the x-total-count header (Go canonicalises the lookup).
	// Without it we cannot know there is a next page, so fall back to the count
	// in hand, which forecloses paging — a safe under-estimate.
	total := len(body.Data)
	if v := header.Get("X-Total-Count"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			total = n
		}
	}
	hasNext := page*searchPageSize < total
	next := ""
	if hasNext {
		next = strconv.Itoa(page + 1)
	}
	return &source.Page{Repos: repos, NextCursor: next, HasNext: hasNext}, nil
}

// GetRepo fetches a single repository plus its latest tag.
func (s *Source) GetRepo(ctx context.Context, owner, name string) (*source.Repo, error) {
	var r apiRepo
	if _, err := s.do(ctx, "/repos/"+owner+"/"+name, &r); err != nil {
		return nil, err
	}
	repo := s.toRepo(&r)

	tag, err := s.LatestTag(ctx, owner, name)
	if err != nil {
		return nil, err
	}
	repo.LatestTag = tag
	return &repo, nil
}

// LatestTag returns the highest semver-shaped tag name for a repo, or "" if
// it has no tag shaped like a version. It implements source.TagFetcher: the
// sync loop calls it only for repos that pass the incremental cutoff, so the
// extra request is never wasted on repos that are about to be skipped.
func (s *Source) LatestTag(ctx context.Context, owner, name string) (string, error) {
	var tags []apiTag
	path := fmt.Sprintf("/repos/%s/%s/tags?limit=%d", owner, name, maxTagsScanned)
	if _, err := s.do(ctx, path, &tags); err != nil {
		return "", err
	}
	names := make([]string, len(tags))
	for i, t := range tags {
		names[i] = t.Name
	}
	return semver.Highest(names), nil
}

// toRepo maps a Forgejo repo onto the neutral model. Forgejo has no separate
// pushed_at and search omits license, so updated_at stands in for PushedAt and
// License is left nil.
func (s *Source) toRepo(r *apiRepo) source.Repo {
	return source.Repo{
		SourceID: r.ID,
		Name:     r.Name,
		FullName: r.FullName,
		Owner: source.Owner{
			SourceID:  r.Owner.ID,
			Login:     r.Owner.Login,
			AvatarURL: r.Owner.AvatarURL,
			HTMLURL:   s.webBase + "/" + r.Owner.Login,
		},
		Description: emptyToNil(r.Description),
		URL:         r.HTMLURL,
		Homepage:    emptyToNil(r.Website),
		Stars:       r.StarsCount,
		Forks:       r.ForksCount,
		OpenIssues:  r.OpenIssues,
		License:     nil,
		Topics:      r.Topics,
		CreatedAt:   r.CreatedAt,
		UpdatedAt:   r.UpdatedAt,
		PushedAt:    r.UpdatedAt,
	}
}

// do executes one GET against the API. It paces the request through the
// limiter, lets the transport handle HTTP-level retries, decodes a 200 body
// into out (when non-nil), and translates an exhausted rate limit into a typed
// *source.RateLimitError. It returns the response header so callers can read
// pagination metadata such as x-total-count.
func (s *Source) do(ctx context.Context, path string, out any) (http.Header, error) {
	if err := s.limiter.Wait(ctx); err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, s.apiBase+path, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	if s.token != "" {
		req.Header.Set("Authorization", "token "+s.token)
	}

	resp, err := s.http.Do(req)
	if err != nil {
		// May be a *httpx.RateLimitError surfaced by the transport after
		// exhausting retries, a context error, or a network failure.
		return nil, translateErr(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		errBody, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
		return resp.Header, fmt.Errorf("codeberg: %s: status %d: %s", path, resp.StatusCode, errBody)
	}

	if out != nil {
		if err := json.NewDecoder(resp.Body).Decode(out); err != nil {
			return resp.Header, fmt.Errorf("codeberg: %s: decode response: %w", path, err)
		}
	}
	return resp.Header, nil
}

// translateErr maps the transport's rate-limit error onto the neutral
// source.RateLimitError so the sync loop handles every backend uniformly.
func translateErr(err error) error {
	var rle *httpx.RateLimitError
	if errors.As(err, &rle) {
		return &source.RateLimitError{RetryAfter: rle.RetryAfter, Resource: "codeberg"}
	}
	return err
}

// emptyToNil maps Forgejo's empty-string "absent" convention to a nil pointer,
// matching how the neutral model distinguishes unset optional fields.
func emptyToNil(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
