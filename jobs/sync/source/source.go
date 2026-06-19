// Package source defines a backend-neutral model of a code-hosting platform
// (GitHub, Codeberg, …) and the small interface the sync job drives. Each
// concrete backend lives in its own package and exposes a Source that maps the
// backend's API onto these types, so the sync loop never has to know which
// platform a repository came from.
package source

import (
	"context"
	"time"
)

// Owner is the account that owns a repository, normalised across backends.
type Owner struct {
	SourceID  int64  // the backend's numeric account ID (unique only within a source)
	Login     string // the account handle, e.g. "ziglang"
	AvatarURL string
	HTMLURL   string // canonical web page for the account, e.g. https://github.com/ziglang
}

// Repo is a repository normalised across backends. Pointer fields are nil when
// the backend has no value for them; LatestTag is "" when the repo has no tags.
type Repo struct {
	SourceID    int64 // the backend's numeric repo ID (unique only within a source)
	Name        string
	FullName    string // "owner/name"
	Owner       Owner
	Description *string
	URL         string // canonical web page for the repo
	Homepage    *string
	Stars       int32
	Forks       int32
	OpenIssues  int32
	License     *string // SPDX id when known
	Topics      []string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	PushedAt    time.Time // last push; backends without one reuse UpdatedAt
	LatestTag   string
}

// Page is one page of search results plus its continuation token. NextCursor is
// an opaque, source-specific string (a GraphQL cursor for GitHub, a page number
// for Codeberg); the caller stores and replays it verbatim and never inspects
// it. NextCursor is only meaningful when HasNext is true.
type Page struct {
	Repos      []Repo
	NextCursor string
	HasNext    bool
}

// Source is one code-hosting backend. Implementations are not required to be
// safe for concurrent use; the sync job drives each source sequentially.
type Source interface {
	// Name is the stable identifier persisted in the `source` column
	// (e.g. "github", "codeberg"). It keys per-source rows and checkpoints.
	Name() string

	// SearchPage returns one page of repositories carrying the given topic,
	// newest-activity first so the caller can stop paging once it reaches
	// repos untouched since the last sync. Pass "" as cursor for the first
	// page. A rate-limit refusal is reported as *RateLimitError.
	SearchPage(ctx context.Context, topic, cursor string) (*Page, error)

	// GetRepo fetches a single repository by owner and name, fully populated
	// (including its latest tag).
	GetRepo(ctx context.Context, owner, name string) (*Repo, error)
}

// TagFetcher is an optional capability for sources whose search results do not
// already include the latest tag (Codeberg pages tags with a separate request).
// The sync loop type-asserts a Source to TagFetcher and resolves the tag only
// for repos that survive the incremental cutoff, so the extra request is never
// spent on repositories that are about to be skipped. Sources that return the
// tag inline (GitHub) deliberately do not implement this.
type TagFetcher interface {
	// LatestTag returns the most recent tag name for a repo, or "" if it has
	// none. A rate-limit refusal is reported as *RateLimitError.
	LatestTag(ctx context.Context, owner, name string) (string, error)
}

// RateLimitError reports that a backend refused (or would refuse) a request
// because a rate limit was hit. The sync loop detects it with errors.As,
// checkpoints, and resumes on a later run. RetryAfter is the backend's hint for
// how long to wait; Resource names the limit that tripped when known.
type RateLimitError struct {
	RetryAfter time.Duration
	Resource   string
}

func (e *RateLimitError) Error() string {
	if e.Resource != "" {
		return "source: rate limited on " + e.Resource + " (retry after " + e.RetryAfter.String() + ")"
	}
	return "source: rate limited (retry after " + e.RetryAfter.String() + ")"
}
