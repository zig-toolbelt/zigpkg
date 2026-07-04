package codeberg

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"golang.org/x/time/rate"

	"zigpkg.dev/sync/httpx"
	"zigpkg.dev/sync/source"
)

// fastClock implements httpx.Clock with instant, deterministic waits so
// rate-limit retries exhaust without real time passing.
type fastClock struct{}

func (fastClock) Now() time.Time { return time.Unix(1_700_000_000, 0).UTC() }

func (fastClock) Int63n(n int64) int64 {
	if n <= 0 {
		return 0
	}
	return n / 2
}

func (fastClock) Sleep(ctx context.Context, _ time.Duration) error {
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
		return nil
	}
}

func newTestSource(t *testing.T, handler http.HandlerFunc) *Source {
	t.Helper()
	srv := httptest.NewServer(handler)
	t.Cleanup(srv.Close)
	return &Source{
		apiBase: srv.URL,
		webBase: srv.URL,
		token:   "test-token",
		http:    &http.Client{Transport: httpx.NewRetryTransport(http.DefaultTransport, fastClock{})},
		limiter: rate.NewLimiter(rate.Inf, 1), // no pacing under test
	}
}

const mockSearchResponse = `{
  "ok": true,
  "data": [
    {
      "id": 555,
      "name": "ziglib",
      "full_name": "carol/ziglib",
      "owner": { "id": 9, "login": "carol", "avatar_url": "https://codeberg.org/avatars/9" },
      "description": "A codeberg zig lib",
      "html_url": "https://codeberg.org/carol/ziglib",
      "website": "https://carol.dev",
      "stars_count": 12,
      "forks_count": 2,
      "open_issues_count": 1,
      "topics": ["zig-package", "zig"],
      "created_at": "2023-05-01T00:00:00Z",
      "updated_at": "2024-09-01T00:00:00Z"
    },
    {
      "id": 556,
      "name": "bare",
      "full_name": "dave/bare",
      "owner": { "id": 10, "login": "dave", "avatar_url": "" },
      "description": "",
      "html_url": "https://codeberg.org/dave/bare",
      "website": "",
      "stars_count": 0,
      "forks_count": 0,
      "open_issues_count": 0,
      "topics": [],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}`

func TestSearchPage(t *testing.T) {
	t.Parallel()

	src := newTestSource(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/repos/search" {
			t.Errorf("path: got %q, want /repos/search", r.URL.Path)
		}
		if got := r.Header.Get("Authorization"); got != "token test-token" {
			t.Errorf("auth header: got %q", got)
		}
		q := r.URL.Query()
		for k, want := range map[string]string{
			"q": "zig-package", "topic": "true", "sort": "updated",
			"order": "desc", "page": "1", "limit": "50",
		} {
			if q.Get(k) != want {
				t.Errorf("query %s: got %q, want %q", k, q.Get(k), want)
			}
		}
		w.Header().Set("X-Total-Count", "120")
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(mockSearchResponse))
	})

	page, err := src.SearchPage(context.Background(), "zig-package", "")
	if err != nil {
		t.Fatalf("SearchPage: %v", err)
	}

	// 1*50 = 50 < 120, so there is a next page numbered 2.
	if !page.HasNext {
		t.Error("expected HasNext=true (50 < 120)")
	}
	if page.NextCursor != "2" {
		t.Errorf("NextCursor: got %q, want 2", page.NextCursor)
	}
	if len(page.Repos) != 2 {
		t.Fatalf("repos: got %d, want 2", len(page.Repos))
	}

	r := page.Repos[0]
	if r.SourceID != 555 {
		t.Errorf("SourceID: got %d, want 555", r.SourceID)
	}
	if r.FullName != "carol/ziglib" {
		t.Errorf("FullName: got %q", r.FullName)
	}
	if r.Owner.SourceID != 9 || r.Owner.Login != "carol" {
		t.Errorf("owner: id=%d login=%q", r.Owner.SourceID, r.Owner.Login)
	}
	if want := src.webBase + "/carol"; r.Owner.HTMLURL != want {
		t.Errorf("Owner.HTMLURL: got %q, want %q", r.Owner.HTMLURL, want)
	}
	if r.Stars != 12 || r.Forks != 2 || r.OpenIssues != 1 {
		t.Errorf("counts: stars=%d forks=%d issues=%d", r.Stars, r.Forks, r.OpenIssues)
	}
	if r.Description == nil || *r.Description != "A codeberg zig lib" {
		t.Errorf("Description: got %v", r.Description)
	}
	if r.Homepage == nil || *r.Homepage != "https://carol.dev" {
		t.Errorf("Homepage: got %v", r.Homepage)
	}
	if r.URL != "https://codeberg.org/carol/ziglib" {
		t.Errorf("URL: got %q", r.URL)
	}
	if len(r.Topics) != 2 || r.Topics[0] != "zig-package" {
		t.Errorf("Topics: got %v", r.Topics)
	}
	if r.License != nil {
		t.Errorf("License should be nil (search omits it), got %v", r.License)
	}
	// pushed_at has no Forgejo equivalent, so updated_at stands in for it.
	if !r.PushedAt.Equal(r.UpdatedAt) || r.PushedAt.Year() != 2024 {
		t.Errorf("PushedAt: got %v (updated %v)", r.PushedAt, r.UpdatedAt)
	}
	// Tags are NOT fetched during search — resolved lazily via LatestTag.
	if r.LatestTag != "" {
		t.Errorf("LatestTag should be empty after search, got %q", r.LatestTag)
	}

	// Second repo — empty strings map to nil pointers.
	r2 := page.Repos[1]
	if r2.Description != nil {
		t.Errorf("empty description should map to nil, got %v", r2.Description)
	}
	if r2.Homepage != nil {
		t.Errorf("empty website should map to nil, got %v", r2.Homepage)
	}
}

func TestSearchPageCursorAndLastPage(t *testing.T) {
	t.Parallel()

	src := newTestSource(t, func(w http.ResponseWriter, r *http.Request) {
		if got := r.URL.Query().Get("page"); got != "3" {
			t.Errorf("page: got %q, want 3", got)
		}
		// total 120, page 3 -> 3*50 = 150 >= 120, so this is the last page.
		w.Header().Set("X-Total-Count", "120")
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"ok":true,"data":[]}`))
	})

	page, err := src.SearchPage(context.Background(), "zig-package", "3")
	if err != nil {
		t.Fatalf("SearchPage: %v", err)
	}
	if page.HasNext {
		t.Error("expected HasNext=false on last page")
	}
	if page.NextCursor != "" {
		t.Errorf("NextCursor should be empty on last page, got %q", page.NextCursor)
	}
}

func TestLatestTag(t *testing.T) {
	t.Parallel()

	src := newTestSource(t, func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/repos/carol/ziglib/tags") {
			t.Errorf("path: got %q", r.URL.Path)
		}
		if got := r.URL.Query().Get("limit"); got != "30" {
			t.Errorf("limit: got %q, want 30", got)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`[{"name":"v1.2.3"},{"name":"v1.2.2"}]`))
	})

	tag, err := src.LatestTag(context.Background(), "carol", "ziglib")
	if err != nil {
		t.Fatalf("LatestTag: %v", err)
	}
	if tag != "v1.2.3" {
		t.Errorf("LatestTag: got %q, want v1.2.3", tag)
	}
}

// TestLatestTagIgnoresNonSemverTags covers the sokol-zig report: a repo whose
// most recently created tag is a manual, non-version marker must not surface
// that marker as the version — the highest semver-shaped tag wins instead.
func TestLatestTagIgnoresNonSemverTags(t *testing.T) {
	t.Parallel()

	src := newTestSource(t, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`[{"name":"bindings-cleanup"},{"name":"v0.5.0"}]`))
	})

	tag, err := src.LatestTag(context.Background(), "carol", "ziglib")
	if err != nil {
		t.Fatalf("LatestTag: %v", err)
	}
	if tag != "v0.5.0" {
		t.Errorf("LatestTag: got %q, want v0.5.0", tag)
	}
}

// TestLatestTagAllNonSemver covers a repo with tags but none shaped like a
// version (e.g. sokol-zig, which only has the "bindings-cleanup" marker) —
// LatestTag must report no version rather than the marker tag.
func TestLatestTagAllNonSemver(t *testing.T) {
	t.Parallel()

	src := newTestSource(t, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`[{"name":"bindings-cleanup"}]`))
	})

	tag, err := src.LatestTag(context.Background(), "carol", "ziglib")
	if err != nil {
		t.Fatalf("LatestTag: %v", err)
	}
	if tag != "" {
		t.Errorf("LatestTag should be empty for non-semver-only tags, got %q", tag)
	}
}

func TestLatestTagNone(t *testing.T) {
	t.Parallel()

	src := newTestSource(t, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`[]`))
	})

	tag, err := src.LatestTag(context.Background(), "carol", "ziglib")
	if err != nil {
		t.Fatalf("LatestTag: %v", err)
	}
	if tag != "" {
		t.Errorf("LatestTag should be empty, got %q", tag)
	}
}

func TestGetRepoFetchesTag(t *testing.T) {
	t.Parallel()

	src := newTestSource(t, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch {
		case r.URL.Path == "/repos/eve/proj":
			_, _ = w.Write([]byte(`{
              "id": 700, "name": "proj", "full_name": "eve/proj",
              "owner": { "id": 11, "login": "eve", "avatar_url": "" },
              "description": "x", "html_url": "https://codeberg.org/eve/proj",
              "website": "", "stars_count": 3, "forks_count": 0,
              "open_issues_count": 0, "topics": ["zig-program"],
              "created_at": "2022-01-01T00:00:00Z", "updated_at": "2024-02-02T00:00:00Z"
            }`))
		case r.URL.Path == "/repos/eve/proj/tags":
			_, _ = w.Write([]byte(`[{"name":"v2.0.0"}]`))
		default:
			t.Errorf("unexpected path %q", r.URL.Path)
			w.WriteHeader(404)
		}
	})

	repo, err := src.GetRepo(context.Background(), "eve", "proj")
	if err != nil {
		t.Fatalf("GetRepo: %v", err)
	}
	if repo.SourceID != 700 {
		t.Errorf("SourceID: got %d, want 700", repo.SourceID)
	}
	if repo.LatestTag != "v2.0.0" {
		t.Errorf("LatestTag: got %q, want v2.0.0", repo.LatestTag)
	}
}

func TestRateLimitTranslated(t *testing.T) {
	t.Parallel()

	var calls int
	src := newTestSource(t, func(w http.ResponseWriter, r *http.Request) {
		calls++
		w.Header().Set("Retry-After", "2")
		w.WriteHeader(http.StatusTooManyRequests)
	})

	_, err := src.SearchPage(context.Background(), "zig-package", "")

	var rle *source.RateLimitError
	if !errors.As(err, &rle) {
		t.Fatalf("expected *source.RateLimitError, got %T: %v", err, err)
	}
	if rle.RetryAfter != 2*time.Second {
		t.Errorf("RetryAfter: got %v, want 2s", rle.RetryAfter)
	}
	if rle.Resource != "codeberg" {
		t.Errorf("Resource: got %q, want codeberg", rle.Resource)
	}
	// The transport retries the full attempt budget before giving up.
	if calls < 2 {
		t.Errorf("expected retries before surfacing rate limit, got %d calls", calls)
	}
}

func TestNonOKStatus(t *testing.T) {
	t.Parallel()

	src := newTestSource(t, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		_, _ = w.Write([]byte(`{"message":"Not Found"}`))
	})

	_, err := src.GetRepo(context.Background(), "ghost", "missing")
	if err == nil {
		t.Fatal("expected error for 404, got nil")
	}
	var rle *source.RateLimitError
	if errors.As(err, &rle) {
		t.Error("404 must not be classified as a rate limit")
	}
	if !strings.Contains(err.Error(), "404") {
		t.Errorf("error should mention status: %v", err)
	}
}

// Compile-time + runtime guarantee that Codeberg advertises the optional
// TagFetcher capability the sync loop relies on for lazy tag resolution.
var _ source.TagFetcher = (*Source)(nil)

func TestImplementsTagFetcher(t *testing.T) {
	t.Parallel()
	if _, ok := NewSource("").(source.TagFetcher); !ok {
		t.Error("codeberg source must implement source.TagFetcher")
	}
}
