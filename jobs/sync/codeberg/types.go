package codeberg

import "time"

// Forgejo / Gitea REST response shapes. Only the fields the sync job consumes
// are modelled.

// apiRepo is one repository as returned by /repos/search and /repos/{o}/{r}.
// Topics arrive inline on search when topic=true, so no extra request is needed
// for them. There is no separate pushed_at, so updated_at stands in for it, and
// license is not exposed by search, so it is left unset.
type apiRepo struct {
	ID          int64    `json:"id"`
	Name        string   `json:"name"`
	FullName    string   `json:"full_name"`
	Owner       apiOwner `json:"owner"`
	Description string   `json:"description"`
	HTMLURL     string   `json:"html_url"`
	Website     string   `json:"website"`
	StarsCount  int32    `json:"stars_count"`
	ForksCount  int32    `json:"forks_count"`
	OpenIssues  int32    `json:"open_issues_count"`
	Topics      []string `json:"topics"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type apiOwner struct {
	ID    int64  `json:"id"`
	Login string `json:"login"`
	// Forgejo names the avatar field avatar_url, same as GitHub.
	AvatarURL string `json:"avatar_url"`
}

// searchResponse is the envelope /repos/search returns: an ok flag plus the
// repository array. The total count for pagination comes from the
// x-total-count response header, not the body.
type searchResponse struct {
	OK   bool      `json:"ok"`
	Data []apiRepo `json:"data"`
}

// apiTag is one entry from /repos/{o}/{r}/tags. The tags endpoint returns the
// array directly (no envelope).
type apiTag struct {
	Name string `json:"name"`
}
