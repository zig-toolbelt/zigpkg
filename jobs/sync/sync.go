package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/spf13/cobra"

	"zigpkg.dev/sync/db"
	gh "zigpkg.dev/sync/github"
)

const (
	maxResults  = 1000
	pageDelayMs = 100

	PackageTypeLibrary     = "library"
	PackageTypeApplication = "application"
)

var topicToPackageType = map[string]string{
	"zig-package": PackageTypeLibrary,
	"zig-program": PackageTypeApplication,
}

func runAll(cmd *cobra.Command, _ []string) error {
	ctx := cmd.Context()
	q, client, cleanup, err := setupEnv(ctx)
	if err != nil {
		return err
	}
	defer cleanup()

	for topic, pkgType := range topicToPackageType {
		if !shouldSync(ctx, q, topic) {
			log.Printf("[%s] up to date, skipping", topic)
			continue
		}

		log.Printf("[%s] starting sync...", topic)
		total := syncTopic(ctx, q, client, topic, pkgType)

		if err := q.UpsertSyncMetadata(ctx, db.UpsertSyncMetadataParams{
			Topic:      topic,
			TotalCount: pgtype.Int4{Int32: int32(total), Valid: true},
		}); err != nil {
			log.Printf("[%s] sync metadata error: %v", topic, err)
		}
		log.Printf("[%s] done: %d packages synced", topic, total)
	}
	return nil
}

func syncSingleRepo(ctx context.Context, q *db.Queries, client *gh.Client, fullName string) error {
	parts := strings.SplitN(fullName, "/", 2)
	if len(parts) != 2 {
		return fmt.Errorf("invalid repo format %q, expected owner/name", fullName)
	}

	repo, err := client.GetRepo(ctx, parts[0], parts[1])
	if err != nil {
		return fmt.Errorf("fetch repo %s: %w", fullName, err)
	}

	pkgType := determinePackageType(repo.Topics())

	if err := upsertRepo(ctx, q, repo, pkgType); err != nil {
		return err
	}

	log.Printf("synced %s (type=%s)", fullName, pkgType)
	return nil
}

func determinePackageType(topics []string) string {
	for _, t := range topics {
		if pt, ok := topicToPackageType[t]; ok {
			return pt
		}
	}
	return PackageTypeLibrary
}

func upsertRepo(ctx context.Context, q *db.Queries, repo *gh.Repo, pkgType string) error {
	version := repo.LatestTag()
	if version == "" {
		version = "latest"
	}

	topicsJSON, _ := json.Marshal(repo.Topics()) // []string marshal cannot fail

	ownerID, err := q.UpsertUser(ctx, db.UpsertUserParams{
		GithubID:  repo.Owner.DatabaseID,
		Username:  repo.Owner.Login,
		AvatarUrl: pgtype.Text{String: repo.Owner.AvatarURL, Valid: true},
	})
	if err != nil {
		return fmt.Errorf("upsert user %s: %w", repo.Owner.Login, err)
	}

	params := db.UpsertPackageParams{
		GithubID:      repo.DatabaseID,
		Name:          repo.Name,
		FullName:      repo.NameWithOwner,
		OwnerID:       ownerID,
		Description:   nullText(repo.Description),
		Version:       pgtype.Text{String: version, Valid: true},
		Stars:         repo.StargazerCount,
		Forks:         repo.ForkCount,
		OpenIssues:    repo.Issues.TotalCount,
		License:       nullText(repo.License()),
		Homepage:      nullText(repo.HomepageURL),
		RepositoryUrl: repo.URL,
		Topics:        pgtype.Text{String: string(topicsJSON), Valid: true},
		PackageType:   pkgType,
		CreatedAt:     pgtype.Timestamptz{Time: repo.CreatedAt, Valid: !repo.CreatedAt.IsZero()},
		UpdatedAt:     pgtype.Timestamptz{Time: repo.UpdatedAt, Valid: !repo.UpdatedAt.IsZero()},
		PushedAt:      pgtype.Timestamptz{Time: repo.PushedAt, Valid: !repo.PushedAt.IsZero()},
	}

	if err := q.UpsertPackage(ctx, params); err != nil {
		return fmt.Errorf("upsert package %s: %w", repo.NameWithOwner, err)
	}
	return nil
}

func syncTopic(ctx context.Context, q *db.Queries, client *gh.Client, topic, pkgType string) int {
	total := 0
	var cursor string

	for total < maxResults {
		page, err := client.SearchPage(ctx, topic, cursor)
		if err != nil {
			log.Printf("[%s] search error: %v", topic, err)
			break
		}
		if len(page.Nodes) == 0 {
			break
		}
		log.Printf("[%s] fetched %d repos (cursor: %q)", topic, len(page.Nodes), cursor)

		for _, repo := range page.Nodes {
			if err := upsertRepo(ctx, q, &repo, pkgType); err != nil {
				log.Printf("  %v", err)
				continue
			}
			total++
		}

		if !page.PageInfo.HasNextPage {
			break
		}
		cursor = page.PageInfo.EndCursor

		select {
		case <-time.After(pageDelayMs * time.Millisecond):
		case <-ctx.Done():
			return total
		}
	}
	return total
}

func shouldSync(ctx context.Context, q *db.Queries, topic string) bool {
	meta, err := q.GetSyncMetadata(ctx, topic)
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			log.Printf("[%s] sync metadata check error: %v", topic, err)
		}
		return true
	}
	return time.Now().After(meta.NextSyncAt.Time)
}
