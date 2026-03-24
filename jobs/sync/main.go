package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/spf13/cobra"

	"zigpkg.dev/sync/db"
	gh "zigpkg.dev/sync/github"
)

const (
	maxResults  = 1000
	pageDelayMs = 100
)

var topics = []string{"zig-package", "zig-program"}

func main() {
	rootCmd := &cobra.Command{
		Use:   "sync",
		Short: "Zig package sync tool",
	}

	rootCmd.AddCommand(allCmd())
	rootCmd.AddCommand(repoCmd())

	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func allCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "all",
		Short: "Sync all packages by topics",
		RunE: func(cmd *cobra.Command, args []string) error {
			ctx, q, client, cleanup := setupEnv()
			defer cleanup()

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
			return nil
		},
	}
}

func repoCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "repo <owner/name>",
		Short: "Sync a single repository by full_name",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			ctx, q, client, cleanup := setupEnv()
			defer cleanup()
			return syncSingleRepo(ctx, q, client, args[0])
		},
	}
}

func setupEnv() (context.Context, *db.Queries, *gh.Client, func()) {
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

	client := gh.NewClient(os.Getenv("GITHUB_TOKEN"))
	q := db.New(pool)

	return ctx, q, client, func() { pool.Close() }
}

func syncSingleRepo(ctx context.Context, q *db.Queries, client *gh.Client, fullName string) error {
	parts := strings.SplitN(fullName, "/", 2)
	if len(parts) != 2 {
		return fmt.Errorf("invalid repo format %q, expected owner/name", fullName)
	}

	repo, err := client.GetRepo(parts[0], parts[1])
	if err != nil {
		return fmt.Errorf("fetch repo %s: %w", fullName, err)
	}

	pkgType := determinePackageType(repo.Topics())
	version := repo.LatestTag()
	if version == "" {
		version = "latest"
	}

	topicsJSON, _ := json.Marshal(repo.Topics())

	ownerID, err := q.UpsertUser(ctx, db.UpsertUserParams{
		GithubID:  int64(repo.Owner.DatabaseID),
		Username:  repo.Owner.Login,
		AvatarUrl: pgtype.Text{String: repo.Owner.AvatarURL, Valid: true},
	})
	if err != nil {
		return fmt.Errorf("upsert user %s: %w", repo.Owner.Login, err)
	}

	params := db.UpsertPackageParams{
		GithubID:      int64(repo.DatabaseID),
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
		CreatedAt:     parseTime(repo.CreatedAt),
		UpdatedAt:     parseTime(repo.UpdatedAt),
		PushedAt:      parseTime(repo.PushedAt),
	}

	if err := q.UpsertPackage(ctx, params); err != nil {
		return fmt.Errorf("upsert package %s: %w", fullName, err)
	}

	log.Printf("synced %s (type=%s)", fullName, pkgType)
	return nil
}

func determinePackageType(topics []string) string {
	for _, t := range topics {
		if t == "zig-package" {
			return "library"
		}
		if t == "zig-program" {
			return "application"
		}
	}
	return "library"
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

			ownerID, err := q.UpsertUser(ctx, db.UpsertUserParams{
				GithubID:  int64(repo.Owner.DatabaseID),
				Username:  repo.Owner.Login,
				AvatarUrl: pgtype.Text{String: repo.Owner.AvatarURL, Valid: true},
			})
			if err != nil {
				log.Printf("  upsert user failed %s: %v", repo.Owner.Login, err)
				continue
			}

			params := db.UpsertPackageParams{
				GithubID:      int64(repo.DatabaseID),
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
				CreatedAt:     parseTime(repo.CreatedAt),
				UpdatedAt:     parseTime(repo.UpdatedAt),
				PushedAt:      parseTime(repo.PushedAt),
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
