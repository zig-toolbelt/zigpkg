package github

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"zigpkg.dev/sync/source"
)

func TestSourceAdapter_SearchPageMapsFields(t *testing.T) {
	t.Parallel()

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(200)
		_, _ = w.Write([]byte(mockSearchResponse))
	}))
	t.Cleanup(srv.Close)

	adapter := &sourceAdapter{client: NewClient("")}
	adapter.client.baseURL = srv.URL

	if adapter.Name() != "github" {
		t.Errorf("Name: got %q, want github", adapter.Name())
	}

	page, err := adapter.SearchPage(context.Background(), "zig-package", "")
	if err != nil {
		t.Fatalf("SearchPage: %v", err)
	}
	if !page.HasNext || page.NextCursor != "cursor123" {
		t.Errorf("pagination: hasNext=%v cursor=%q", page.HasNext, page.NextCursor)
	}
	if len(page.Repos) != 2 {
		t.Fatalf("repos: got %d, want 2", len(page.Repos))
	}

	r := page.Repos[0]
	if r.SourceID != 42 {
		t.Errorf("SourceID: got %d, want 42", r.SourceID)
	}
	if r.FullName != "alice/zigpkg" {
		t.Errorf("FullName: got %q", r.FullName)
	}
	if r.Owner.Login != "alice" {
		t.Errorf("Owner.Login: got %q", r.Owner.Login)
	}
	if r.Owner.HTMLURL != "https://github.com/alice" {
		t.Errorf("Owner.HTMLURL: got %q, want https://github.com/alice", r.Owner.HTMLURL)
	}
	if r.Stars != 100 || r.Forks != 5 || r.OpenIssues != 3 {
		t.Errorf("counts: stars=%d forks=%d issues=%d", r.Stars, r.Forks, r.OpenIssues)
	}
	if r.License == nil || *r.License != "MIT" {
		t.Errorf("License: got %v", r.License)
	}
	if r.LatestTag != "v0.5.0" {
		t.Errorf("LatestTag: got %q", r.LatestTag)
	}
	if len(r.Topics) != 2 || r.Topics[0] != "zig-package" {
		t.Errorf("Topics: got %v", r.Topics)
	}
	if r.PushedAt.Year() != 2024 {
		t.Errorf("PushedAt: got %v", r.PushedAt)
	}

	// Second repo — nullable fields and no tag.
	r2 := page.Repos[1]
	if r2.Description != nil {
		t.Errorf("Description should be nil, got %v", r2.Description)
	}
	if r2.License != nil {
		t.Errorf("License should be nil, got %v", r2.License)
	}
	if r2.LatestTag != "" {
		t.Errorf("LatestTag should be empty, got %q", r2.LatestTag)
	}
}

func TestSourceAdapter_TranslatesRateLimit(t *testing.T) {
	t.Parallel()

	// GitHub reports rate limiting as a RATE_LIMITED error inside a 200 body;
	// the adapter must surface it as a neutral *source.RateLimitError, not the
	// GitHub-specific type.
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(200)
		_, _ = w.Write([]byte(`{"errors":[{"type":"RATE_LIMITED","message":"API rate limit exceeded"}]}`))
	}))
	t.Cleanup(srv.Close)

	adapter := &sourceAdapter{client: NewClient("")}
	adapter.client.baseURL = srv.URL

	_, err := adapter.SearchPage(context.Background(), "zig-package", "")

	var srcRLE *source.RateLimitError
	if !errors.As(err, &srcRLE) {
		t.Fatalf("expected *source.RateLimitError, got %T: %v", err, err)
	}
	if srcRLE.Resource != "graphql" {
		t.Errorf("Resource: got %q, want graphql", srcRLE.Resource)
	}

	// And it must no longer be the GitHub-specific type.
	var ghRLE *RateLimitError
	if errors.As(err, &ghRLE) {
		t.Error("error should have been translated away from *github.RateLimitError")
	}
}

func TestSourceAdapter_GetRepo(t *testing.T) {
	t.Parallel()

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(mockRepoResponse))
	}))
	t.Cleanup(srv.Close)

	adapter := &sourceAdapter{client: NewClient("")}
	adapter.client.baseURL = srv.URL

	repo, err := adapter.GetRepo(context.Background(), "alice", "zigpkg")
	if err != nil {
		t.Fatalf("GetRepo: %v", err)
	}
	if repo.SourceID != 42 || repo.Owner.SourceID != 7 {
		t.Errorf("ids: repo=%d owner=%d", repo.SourceID, repo.Owner.SourceID)
	}
	if repo.LatestTag != "v0.5.0" {
		t.Errorf("LatestTag: got %q", repo.LatestTag)
	}
	if repo.CreatedAt.Year() != 2023 {
		t.Errorf("CreatedAt: got %v", repo.CreatedAt)
	}
}

// GitHub must not advertise the optional TagFetcher capability: its tags arrive
// inline with search, so the sync loop must never spend an extra request.
func TestSourceAdapter_NotTagFetcher(t *testing.T) {
	t.Parallel()
	var s source.Source = NewSource("")
	if _, ok := s.(source.TagFetcher); ok {
		t.Error("github source must not implement source.TagFetcher")
	}
}
