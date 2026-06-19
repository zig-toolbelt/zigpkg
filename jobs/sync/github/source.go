package github

import (
	"context"
	"errors"

	"zigpkg.dev/sync/source"
)

// SourceName is the stable identifier persisted in the `source` column for
// repositories synced from GitHub.
const SourceName = "github"

// sourceAdapter wraps the GitHub GraphQL Client and maps its types onto the
// backend-neutral source.Source contract. The Client and its tests are left
// untouched; all GitHub→source translation lives here.
type sourceAdapter struct {
	client *Client
}

// NewSource returns a GitHub-backed source.Source. token is the GITHUB_TOKEN
// (empty for unauthenticated, heavily rate-limited access).
func NewSource(token string) source.Source {
	return &sourceAdapter{client: NewClient(token)}
}

func (a *sourceAdapter) Name() string { return SourceName }

func (a *sourceAdapter) SearchPage(ctx context.Context, topic, cursor string) (*source.Page, error) {
	page, err := a.client.SearchPage(ctx, topic, cursor)
	if err != nil {
		return nil, translateErr(err)
	}
	repos := make([]source.Repo, len(page.Nodes))
	for i := range page.Nodes {
		repos[i] = toSourceRepo(&page.Nodes[i])
	}
	return &source.Page{
		Repos:      repos,
		NextCursor: page.PageInfo.EndCursor,
		HasNext:    page.PageInfo.HasNextPage,
	}, nil
}

func (a *sourceAdapter) GetRepo(ctx context.Context, owner, name string) (*source.Repo, error) {
	repo, err := a.client.GetRepo(ctx, owner, name)
	if err != nil {
		return nil, translateErr(err)
	}
	r := toSourceRepo(repo)
	return &r, nil
}

// toSourceRepo maps a GitHub repo onto the neutral model. The latest tag and
// topics come back inline with every search result, so GitHub intentionally
// does not implement source.TagFetcher.
func toSourceRepo(r *Repo) source.Repo {
	return source.Repo{
		SourceID: r.DatabaseID,
		Name:     r.Name,
		FullName: r.NameWithOwner,
		Owner: source.Owner{
			SourceID:  r.Owner.DatabaseID,
			Login:     r.Owner.Login,
			AvatarURL: r.Owner.AvatarURL,
			HTMLURL:   "https://github.com/" + r.Owner.Login,
		},
		Description: r.Description,
		URL:         r.URL,
		Homepage:    r.HomepageURL,
		Stars:       r.StargazerCount,
		Forks:       r.ForkCount,
		OpenIssues:  r.Issues.TotalCount,
		License:     r.License(),
		Topics:      r.Topics(),
		CreatedAt:   r.CreatedAt,
		UpdatedAt:   r.UpdatedAt,
		PushedAt:    r.PushedAt,
		LatestTag:   r.LatestTag(),
	}
}

// translateErr maps the GitHub client's typed rate-limit error onto the neutral
// source.RateLimitError so the sync loop can handle every backend uniformly.
func translateErr(err error) error {
	var rle *RateLimitError
	if errors.As(err, &rle) {
		return &source.RateLimitError{RetryAfter: rle.RetryAfter, Resource: rle.Resource}
	}
	return err
}
