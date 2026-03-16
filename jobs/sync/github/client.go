package github

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"
)

var graphqlURL = "https://api.github.com/graphql"

const searchQuery = `
query($query: String!, $after: String) {
  search(query: $query, type: REPOSITORY, first: 100, after: $after) {
    repositoryCount
    pageInfo {
      endCursor
      hasNextPage
    }
    nodes {
      ... on Repository {
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
      }
    }
  }
}
`

type Client struct {
	http               *http.Client
	token              string
	rateLimitRemaining int
	rateLimitReset     int64
}

func NewClient(token string) *Client {
	return &Client{
		http:               &http.Client{Timeout: 30 * time.Second},
		token:              token,
		rateLimitRemaining: 30,
	}
}

func (c *Client) graphql(variables map[string]any, out any) error {
	if c.rateLimitRemaining == 0 && time.Now().Unix() < c.rateLimitReset {
		return fmt.Errorf("rate limited until %s", time.Unix(c.rateLimitReset, 0))
	}

	body, err := json.Marshal(map[string]any{
		"query":     searchQuery,
		"variables": variables,
	})
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", graphqlURL, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-GitHub-Api-Version", "2022-11-28")
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if v := resp.Header.Get("X-RateLimit-Remaining"); v != "" {
		c.rateLimitRemaining, _ = strconv.Atoi(v)
	}
	if v := resp.Header.Get("X-RateLimit-Reset"); v != "" {
		c.rateLimitReset, _ = strconv.ParseInt(v, 10, 64)
	}

	if resp.StatusCode != 200 {
		return fmt.Errorf("github graphql: status %d", resp.StatusCode)
	}

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	var result graphqlResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return err
	}
	if len(result.Errors) > 0 {
		return fmt.Errorf("github graphql: %s", result.Errors[0].Message)
	}

	*out.(*graphqlData) = result.Data
	return nil
}

// SearchPage fetches one page of repositories for the given topic.
// Pass an empty cursor for the first page.
func (c *Client) SearchPage(topic, cursor string) (*SearchPage, error) {
	vars := map[string]any{
		"query": "topic:" + topic + " sort:stars",
	}
	if cursor != "" {
		vars["after"] = cursor
	}

	var data graphqlData
	if err := c.graphql(vars, &data); err != nil {
		return nil, err
	}
	return &data.Search, nil
}
