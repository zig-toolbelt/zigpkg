package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"zigpkg.dev/sync/db"
	gh "zigpkg.dev/sync/github"
)

const (
	maxResults  = 1000
	pageDelayMs = 100
)

var topics = []string{"zig-package", "zig-program"}

func main() {
	ctx := context.Background()

	dbURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s",
		getenv("DB_USER", "postgres"),
		getenv("DB_PASSWORD", ""),
		getenv("DB_HOST", "127.0.0.1"),
		getenv("DB_PORT", "5432"),
		getenv("DB_NAME", "zigpkg"),
	)
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer pool.Close()

	client := gh.NewClient(os.Getenv("GITHUB_TOKEN"))
	q := db.New(pool)

	for _, topic := range topics {
		if !shouldSync(ctx, q, topic) {
			log.Printf("[%s] up to date, skipping", topic)
			continue
		}

		pkgType := "application"
		if topic == "zig-package" {
			pkgType = "library"
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
}

func syncTopic(ctx context.Context, q *db.Queries, client *gh.Client, topic, pkgType string) int {
	total := 0
	var cursor string

	for total < maxResults {
		page, err := client.SearchPage(topic, cursor)
		if err != nil {
			log.Printf("[%s] search error: %v", topic, err)
			break
		}
		if len(page.Nodes) == 0 {
			break
		}
		log.Printf("[%s] fetched %d repos (cursor: %q)", topic, len(page.Nodes), cursor)

		for _, repo := range page.Nodes {
			version := repo.LatestTag()
			if version == "" {
				version = "latest"
			}

			topicsJSON, _ := json.Marshal(repo.Topics())

			params := db.UpsertPackageParams{
				GithubID:       int32(repo.DatabaseID),
				Name:           repo.Name,
				FullName:       repo.NameWithOwner,
				Owner:          repo.Owner.Login,
				OwnerAvatarUrl: pgtype.Text{String: repo.Owner.AvatarURL, Valid: true},
				Description:    nullText(repo.Description),
				Version:        pgtype.Text{String: version, Valid: true},
				Stars:          repo.StargazerCount,
				Forks:          repo.ForkCount,
				OpenIssues:     repo.Issues.TotalCount,
				License:        nullText(repo.License()),
				Homepage:       nullText(repo.HomepageURL),
				RepositoryUrl:  repo.URL,
				Topics:         pgtype.Text{String: string(topicsJSON), Valid: true},
				PackageType:    pkgType,
				CreatedAt:      parseTime(repo.CreatedAt),
				UpdatedAt:      parseTime(repo.UpdatedAt),
				PushedAt:       parseTime(repo.PushedAt),
			}

			if err := q.UpsertPackage(ctx, params); err != nil {
				log.Printf("  upsert failed %s: %v", repo.NameWithOwner, err)
				continue
			}
			total++
		}

		if !page.PageInfo.HasNextPage {
			break
		}
		cursor = page.PageInfo.EndCursor
		time.Sleep(pageDelayMs * time.Millisecond)
	}
	return total
}

func shouldSync(ctx context.Context, q *db.Queries, topic string) bool {
	meta, err := q.GetSyncMetadata(ctx, topic)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return true
		}
		return true
	}
	return time.Now().After(meta.NextSyncAt.Time)
}

func parseTime(s string) pgtype.Timestamptz {
	t, err := time.Parse(time.RFC3339, s)
	if err != nil {
		return pgtype.Timestamptz{}
	}
	return pgtype.Timestamptz{Time: t, Valid: true}
}

func nullText(s *string) pgtype.Text {
	if s == nil {
		return pgtype.Text{}
	}
	return pgtype.Text{String: *s, Valid: true}
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
