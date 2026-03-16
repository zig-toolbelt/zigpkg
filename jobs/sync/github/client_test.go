package github

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

const mockResponse = `{
  "data": {
    "search": {
      "repositoryCount": 2,
      "pageInfo": {
        "endCursor": "cursor123",
        "hasNextPage": true
      },
      "nodes": [
        {
          "databaseId": 42,
          "name": "zigpkg",
          "nameWithOwner": "alice/zigpkg",
          "owner": { "login": "alice", "avatarUrl": "https://example.com/avatar.png" },
          "description": "A zig package",
          "url": "https://github.com/alice/zigpkg",
          "homepageUrl": "https://zigpkg.dev",
          "stargazerCount": 100,
          "forkCount": 5,
          "issues": { "totalCount": 3 },
          "licenseInfo": { "spdxId": "MIT" },
          "repositoryTopics": {
            "nodes": [
              { "topic": { "name": "zig-package" } },
              { "topic": { "name": "zig" } }
            ]
          },
          "createdAt": "2023-01-01T00:00:00Z",
          "updatedAt": "2024-01-01T00:00:00Z",
          "pushedAt":  "2024-06-01T00:00:00Z",
          "refs": {
            "nodes": [{ "name": "v0.5.0" }]
          }
        },
        {
          "databaseId": 99,
          "name": "no-tag-repo",
          "nameWithOwner": "bob/no-tag-repo",
          "owner": { "login": "bob", "avatarUrl": "" },
          "description": null,
          "url": "https://github.com/bob/no-tag-repo",
          "homepageUrl": null,
          "stargazerCount": 1,
          "forkCount": 0,
          "issues": { "totalCount": 0 },
          "licenseInfo": null,
          "repositoryTopics": { "nodes": [] },
          "createdAt": "2024-01-01T00:00:00Z",
          "updatedAt": "2024-01-01T00:00:00Z",
          "pushedAt":  "2024-01-01T00:00:00Z",
          "refs": { "nodes": [] }
        }
      ]
    }
  }
}`

func TestSearchPage(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			t.Errorf("expected POST, got %s", r.Method)
		}
		if r.Header.Get("Authorization") != "Bearer test-token" {
			t.Errorf("missing auth header: %s", r.Header.Get("Authorization"))
		}

		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			t.Fatalf("decode body: %v", err)
		}
		vars := body["variables"].(map[string]any)
		if vars["query"] != "topic:zig-package sort:stars" {
			t.Errorf("unexpected query: %v", vars["query"])
		}
		if _, hasCursor := vars["after"]; hasCursor {
			t.Error("first page should not have 'after' variable")
		}

		w.Header().Set("X-RateLimit-Remaining", "4999")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(200)
		w.Write([]byte(mockResponse))
	}))
	defer srv.Close()

	origURL := graphqlURL
	graphqlURL = srv.URL
	defer func() { graphqlURL = origURL }()

	client := NewClient("test-token")
	page, err := client.SearchPage("zig-package", "")
	if err != nil {
		t.Fatalf("SearchPage: %v", err)
	}

	// Rate limit tracking
	if client.rateLimitRemaining != 4999 {
		t.Errorf("rateLimitRemaining: got %d", client.rateLimitRemaining)
	}

	// PageInfo
	if !page.PageInfo.HasNextPage {
		t.Error("expected hasNextPage=true")
	}
	if page.PageInfo.EndCursor != "cursor123" {
		t.Errorf("unexpected cursor: %s", page.PageInfo.EndCursor)
	}
	if page.RepositoryCount != 2 {
		t.Errorf("expected repositoryCount=2, got %d", page.RepositoryCount)
	}
	if len(page.Nodes) != 2 {
		t.Fatalf("expected 2 nodes, got %d", len(page.Nodes))
	}

	// First repo — all fields populated
	r := page.Nodes[0]
	if r.DatabaseID != 42 {
		t.Errorf("databaseId: got %d", r.DatabaseID)
	}
	if r.NameWithOwner != "alice/zigpkg" {
		t.Errorf("nameWithOwner: got %s", r.NameWithOwner)
	}
	if r.StargazerCount != 100 {
		t.Errorf("stargazerCount: got %d", r.StargazerCount)
	}
	if r.ForkCount != 5 {
		t.Errorf("forkCount: got %d", r.ForkCount)
	}
	if r.Issues.TotalCount != 3 {
		t.Errorf("issues.totalCount: got %d", r.Issues.TotalCount)
	}
	if lic := r.License(); lic == nil || *lic != "MIT" {
		t.Errorf("license: got %v", r.License())
	}
	if topics := r.Topics(); len(topics) != 2 || topics[0] != "zig-package" || topics[1] != "zig" {
		t.Errorf("topics: got %v", topics)
	}
	if r.LatestTag() != "v0.5.0" {
		t.Errorf("latestTag: got %s", r.LatestTag())
	}
	if r.HomepageURL == nil || *r.HomepageURL != "https://zigpkg.dev" {
		t.Errorf("homepageUrl: got %v", r.HomepageURL)
	}

	// Second repo — nullable fields
	r2 := page.Nodes[1]
	if r2.Description != nil {
		t.Errorf("description should be nil, got %v", r2.Description)
	}
	if r2.License() != nil {
		t.Errorf("license should be nil, got %v", r2.License())
	}
	if r2.LatestTag() != "" {
		t.Errorf("latestTag should be empty, got %s", r2.LatestTag())
	}
	if len(r2.Topics()) != 0 {
		t.Errorf("topics should be empty, got %v", r2.Topics())
	}
}

func TestSearchPageWithCursor(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var body map[string]any
		json.NewDecoder(r.Body).Decode(&body)
		vars := body["variables"].(map[string]any)

		if vars["after"] != "abc123" {
			t.Errorf("expected cursor 'abc123', got %v", vars["after"])
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"data": map[string]any{
				"search": map[string]any{
					"repositoryCount": 0,
					"pageInfo":        map[string]any{"endCursor": "", "hasNextPage": false},
					"nodes":           []any{},
				},
			},
		})
	}))
	defer srv.Close()

	origURL := graphqlURL
	graphqlURL = srv.URL
	defer func() { graphqlURL = origURL }()

	client := NewClient("")
	page, err := client.SearchPage("zig-package", "abc123")
	if err != nil {
		t.Fatalf("SearchPage with cursor: %v", err)
	}
	if page.PageInfo.HasNextPage {
		t.Error("expected hasNextPage=false")
	}
}

func TestSearchPageGraphQLError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(map[string]any{
			"errors": []map[string]any{{"message": "something went wrong"}},
		})
	}))
	defer srv.Close()

	origURL := graphqlURL
	graphqlURL = srv.URL
	defer func() { graphqlURL = origURL }()

	client := NewClient("")
	_, err := client.SearchPage("zig-package", "")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestRateLimitBlocked(t *testing.T) {
	client := NewClient("")
	client.rateLimitRemaining = 0
	client.rateLimitReset = 9999999999 // far future

	_, err := client.SearchPage("zig-package", "")
	if err == nil {
		t.Fatal("expected rate limit error, got nil")
	}
}
