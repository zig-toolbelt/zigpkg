package github

import (
	"encoding/json"
	"testing"
)

// repoWithTags builds a Repo whose only populated field is refs.nodes, via
// JSON unmarshaling (Repo.Refs is an anonymous struct type, so this is
// simpler and more robust than constructing the literal by hand).
func repoWithTags(t *testing.T, tagNames ...string) Repo {
	t.Helper()

	nodes := make([]map[string]string, len(tagNames))
	for i, name := range tagNames {
		nodes[i] = map[string]string{"name": name}
	}
	payload, err := json.Marshal(map[string]any{
		"refs": map[string]any{"nodes": nodes},
	})
	if err != nil {
		t.Fatalf("marshal fixture: %v", err)
	}

	var r Repo
	if err := json.Unmarshal(payload, &r); err != nil {
		t.Fatalf("unmarshal fixture: %v", err)
	}
	return r
}

// TestRepoLatestTagIgnoresNonSemverTags covers the sokol-zig report directly
// against the GitHub-specific code path: a non-version marker tag alongside a
// real release tag must not win just because it was created more recently.
func TestRepoLatestTagIgnoresNonSemverTags(t *testing.T) {
	t.Parallel()

	r := repoWithTags(t, "bindings-cleanup", "v0.5.0")
	if got := r.LatestTag(); got != "v0.5.0" {
		t.Errorf("LatestTag: got %q, want v0.5.0", got)
	}
}

// TestRepoLatestTagAllNonSemver is the exact sokol-zig scenario: the repo's
// only tag is a manual marker created long ago to mark a breaking change, not
// a version. LatestTag must report no version, never the marker.
func TestRepoLatestTagAllNonSemver(t *testing.T) {
	t.Parallel()

	r := repoWithTags(t, "bindings-cleanup")
	if got := r.LatestTag(); got != "" {
		t.Errorf("LatestTag: got %q, want \"\"", got)
	}
}
