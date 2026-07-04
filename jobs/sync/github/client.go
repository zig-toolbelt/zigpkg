package github

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// maxTagsScanned bounds how many of a repo's most recently created tags
// GitHub returns per query. Only tags within this window are considered when
// picking the highest semver tag (see semver.Highest) — if a repo has more
// tags than this and its true highest version falls outside the window, it
// will be missed. This is an accepted cost/exhaustiveness trade-off, not a
// bug: a wider window increases this query's GraphQL point cost (lowering
// sync throughput under GitHub's rate limit), and the vast majority of Zig
// packages have far fewer than this many tags.
const maxTagsScanned = 30

var repoFields = fmt.Sprintf(`
    databaseId
    name
    nameWithOwner
    owner { login avatarUrl ... on User { databaseId } ... on Organization { databaseId } }
    description
    url
    homepageUrl
    stargazerCount
    forkCount
    issues(states: OPEN) { totalCount }
    licenseInfo { spdxId }
    repositoryTopics(first: 20) { nodes { topic { name } } }
    createdAt
    updatedAt
    pushedAt
    refs(refPrefix: "refs/tags/", orderBy: {field: TAG_COMMIT_DATE, direction: DESC}, first: %d) {
      nodes { name }
    }
`, maxTagsScanned)

var repoQuery = `query($owner: String!, $name: String!) {
  rateLimit { limit cost remaining resetAt }
  repository(owner: $owner, name: $name) {` + repoFields + `}
}`

var searchQuery = `query($query: String!, $after: String) {
  rateLimit { limit cost remaining resetAt }
  search(query: $query, type: REPOSITORY, first: 25, after: $after) {
    repositoryCount
    pageInfo { endCursor hasNextPage }
    nodes { ... on Repository {` + repoFields + `} }
  }
}`

// Client is a GitHub GraphQL API client. It transparently retries transient
// failures (network errors, 5xx, rate limits) at the transport layer and paces
// outbound requests against the server-reported GraphQL point budget. It is not
// safe for concurrent use.
type Client struct {
	baseURL string
	http    *http.Client
	budget  *budget
}

func NewClient(token string) *Client {
	return &Client{
		baseURL: "https://api.github.com/graphql",
		// No client-level Timeout: a single Do may legitimately span several
		// retries with multi-second Retry-After waits. Cancellation is driven by
		// the request context instead.
		http: &http.Client{
			Transport: newRetryTransport(token, http.DefaultTransport, realClock{}),
		},
		budget: newBudget(),
	}
}

// envelope is the top-level GraphQL response shape: a raw data payload plus any
// errors. data is kept raw so it can be inspected for the rate-limit block and
// then unmarshalled into the caller's target.
type envelope struct {
	Data   json.RawMessage `json:"data"`
	Errors []graphqlError  `json:"errors"`
}

// do executes one GraphQL request and decodes its data into out. It paces the
// request through the adaptive limiter, lets the transport handle HTTP-level
// retries, and translates GitHub's RATE_LIMITED-in-body signal into a typed
// *RateLimitError.
func (c *Client) do(ctx context.Context, query string, variables map[string]any, out any) error {
	if err := c.budget.Wait(ctx); err != nil {
		return err
	}

	reqBody, err := json.Marshal(map[string]any{
		"query":     query,
		"variables": variables,
	})
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL, bytes.NewReader(reqBody))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-GitHub-Api-Version", "2022-11-28")

	resp, err := c.http.Do(req)
	if err != nil {
		// May be a *RateLimitError raised by the transport after exhausting
		// retries, a context error, or an unrecoverable network failure.
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		errBody, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
		return fmt.Errorf("github graphql: status %d: %s", resp.StatusCode, errBody)
	}

	var env envelope
	if err := json.NewDecoder(resp.Body).Decode(&env); err != nil {
		return fmt.Errorf("github graphql: decode response: %w", err)
	}

	for _, e := range env.Errors {
		if e.Type == "RATE_LIMITED" {
			return &RateLimitError{RetryAfter: c.budget.untilReset(), Resource: "graphql"}
		}
	}
	if len(env.Errors) > 0 {
		return fmt.Errorf("github graphql: %s", env.Errors[0].Message)
	}

	// Feed the server-reported budget into the limiter before returning.
	var meta struct {
		RateLimit RateLimit `json:"rateLimit"`
	}
	if json.Unmarshal(env.Data, &meta) == nil {
		c.budget.update(meta.RateLimit)
	}

	if out != nil {
		if err := json.Unmarshal(env.Data, out); err != nil {
			return fmt.Errorf("github graphql: decode data: %w", err)
		}
	}
	return nil
}

// SearchPage fetches one page of repositories for the given topic.
// Pass an empty cursor for the first page.
//
// Results are ordered by recency (sort:updated, newest push first) so the
// caller can stop paging as soon as it reaches repositories untouched since the
// last sync — that is what makes an incremental pass possible.
func (c *Client) SearchPage(ctx context.Context, topic, cursor string) (*SearchPage, error) {
	vars := map[string]any{
		"query": "topic:" + topic + " sort:updated",
	}
	if cursor != "" {
		vars["after"] = cursor
	}

	var data graphqlData
	if err := c.do(ctx, searchQuery, vars, &data); err != nil {
		return nil, err
	}
	return &data.Search, nil
}

// GetRepo fetches a single repository by owner and name.
func (c *Client) GetRepo(ctx context.Context, owner, name string) (*Repo, error) {
	vars := map[string]any{
		"owner": owner,
		"name":  name,
	}

	var data graphqlData
	if err := c.do(ctx, repoQuery, vars, &data); err != nil {
		return nil, err
	}
	return &data.Repository, nil
}
