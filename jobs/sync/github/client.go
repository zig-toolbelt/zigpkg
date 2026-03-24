package github

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"
)

const repoFields = `
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
    refs(refPrefix: "refs/tags/", orderBy: {field: TAG_COMMIT_DATE, direction: DESC}, first: 1) {
      nodes { name }
    }
`

const repoQuery = `query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {` + repoFields + `}
}`

const searchQuery = `query($query: String!, $after: String) {
  search(query: $query, type: REPOSITORY, first: 25, after: $after) {
    repositoryCount
    pageInfo { endCursor hasNextPage }
    nodes { ... on Repository {` + repoFields + `} }
  }
}`

// Client is a GitHub GraphQL API client.
// It is not safe for concurrent use.
type Client struct {
	baseURL            string
	http               *http.Client
	token              string
	rateLimitRemaining int
	rateLimitReset     int64
}

func NewClient(token string) *Client {
	return &Client{
		baseURL:            "https://api.github.com/graphql",
		http:               &http.Client{Timeout: 30 * time.Second},
		token:              token,
		rateLimitRemaining: 30,
	}
}

func (c *Client) graphql(ctx context.Context, query string, variables map[string]any) (graphqlData, error) {
	if c.rateLimitRemaining == 0 && time.Now().Unix() < c.rateLimitReset {
		return graphqlData{}, fmt.Errorf("rate limited until %s", time.Unix(c.rateLimitReset, 0))
	}

	body, err := json.Marshal(map[string]any{
		"query":     query,
		"variables": variables,
	})
	if err != nil {
		return graphqlData{}, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL, bytes.NewReader(body))
	if err != nil {
		return graphqlData{}, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-GitHub-Api-Version", "2022-11-28")
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return graphqlData{}, err
	}
	defer resp.Body.Close()

	if v := resp.Header.Get("X-RateLimit-Remaining"); v != "" {
		c.rateLimitRemaining, _ = strconv.Atoi(v)
	}
	if v := resp.Header.Get("X-RateLimit-Reset"); v != "" {
		c.rateLimitReset, _ = strconv.ParseInt(v, 10, 64)
	}

	if resp.StatusCode != 200 {
		errBody, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
		return graphqlData{}, fmt.Errorf("github graphql: status %d: %s", resp.StatusCode, errBody)
	}

	var result graphqlResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return graphqlData{}, err
	}
	if len(result.Errors) > 0 {
		return graphqlData{}, fmt.Errorf("github graphql: %s", result.Errors[0].Message)
	}

	return result.Data, nil
}

// SearchPage fetches one page of repositories for the given topic.
// Pass an empty cursor for the first page.
func (c *Client) SearchPage(ctx context.Context, topic, cursor string) (*SearchPage, error) {
	vars := map[string]any{
		"query": "topic:" + topic + " sort:stars",
	}
	if cursor != "" {
		vars["after"] = cursor
	}

	data, err := c.graphql(ctx, searchQuery, vars)
	if err != nil {
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
	data, err := c.graphql(ctx, repoQuery, vars)
	if err != nil {
		return nil, err
	}
	return &data.Repository, nil
}
