package github

import "time"

// GraphQL response structures

type graphqlResponse struct {
	Data   graphqlData    `json:"data"`
	Errors []graphqlError `json:"errors"`
}

type graphqlError struct {
	Message string `json:"message"`
}

type graphqlData struct {
	Search     SearchPage `json:"search"`
	Repository Repo       `json:"repository"`
}

type SearchPage struct {
	RepositoryCount int      `json:"repositoryCount"`
	PageInfo        PageInfo `json:"pageInfo"`
	Nodes           []Repo   `json:"nodes"`
}

type PageInfo struct {
	EndCursor   string `json:"endCursor"`
	HasNextPage bool   `json:"hasNextPage"`
}

type Repo struct {
	DatabaseID    int64   `json:"databaseId"`
	Name          string  `json:"name"`
	NameWithOwner string  `json:"nameWithOwner"`
	Owner         Owner   `json:"owner"`
	Description   *string `json:"description"`
	URL           string  `json:"url"`
	HomepageURL   *string `json:"homepageUrl"`
	StargazerCount int32  `json:"stargazerCount"`
	ForkCount      int32  `json:"forkCount"`
	Issues         struct {
		TotalCount int32 `json:"totalCount"`
	} `json:"issues"`
	LicenseInfo *struct {
		SpdxID *string `json:"spdxId"`
	} `json:"licenseInfo"`
	RepositoryTopics struct {
		Nodes []struct {
			Topic struct {
				Name string `json:"name"`
			} `json:"topic"`
		} `json:"nodes"`
	} `json:"repositoryTopics"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	PushedAt  time.Time `json:"pushedAt"`
	Refs      struct {
		Nodes []struct {
			Name string `json:"name"`
		} `json:"nodes"`
	} `json:"refs"`
}

type Owner struct {
	DatabaseID int64  `json:"databaseId"`
	Login      string `json:"login"`
	AvatarURL  string `json:"avatarUrl"`
}

// Topics returns the list of topic names for a repo.
func (r *Repo) Topics() []string {
	names := make([]string, 0, len(r.RepositoryTopics.Nodes))
	for _, n := range r.RepositoryTopics.Nodes {
		names = append(names, n.Topic.Name)
	}
	return names
}

// LatestTag returns the latest git tag name, or empty string if none.
func (r *Repo) LatestTag() string {
	if len(r.Refs.Nodes) > 0 {
		return r.Refs.Nodes[0].Name
	}
	return ""
}

// License returns the SPDX ID string pointer, or nil.
func (r *Repo) License() *string {
	if r.LicenseInfo != nil {
		return r.LicenseInfo.SpdxID
	}
	return nil
}
