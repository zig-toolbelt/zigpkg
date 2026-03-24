package main

import (
	"context"
	"fmt"
	"net/url"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/spf13/cobra"

	"zigpkg.dev/sync/db"
	gh "zigpkg.dev/sync/github"
)

func main() {
	rootCmd := &cobra.Command{
		Use:   "sync",
		Short: "Zig package sync tool",
		RunE:  runAll,
	}

	rootCmd.AddCommand(&cobra.Command{
		Use:   "all",
		Short: "Sync all packages by topics",
		RunE:  runAll,
	})

	rootCmd.AddCommand(&cobra.Command{
		Use:   "repo <owner/name>",
		Short: "Sync a single repository by full_name",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			q, client, cleanup, err := setupEnv(cmd.Context())
			if err != nil {
				return err
			}
			defer cleanup()
			return syncSingleRepo(cmd.Context(), q, client, args[0])
		},
	})

	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func setupEnv(ctx context.Context) (*db.Queries, *gh.Client, func(), error) {
	dsn := &url.URL{
		Scheme: "postgres",
		User:   url.UserPassword(getenv("DB_USER", "postgres"), getenv("DB_PASSWORD", "")),
		Host:   fmt.Sprintf("%s:%s", getenv("DB_HOST", "127.0.0.1"), getenv("DB_PORT", "5432")),
		Path:   getenv("DB_NAME", "zigpkg"),
	}

	pool, err := pgxpool.New(ctx, dsn.String())
	if err != nil {
		return nil, nil, nil, fmt.Errorf("db connect: %w", err)
	}

	client := gh.NewClient(os.Getenv("GITHUB_TOKEN"))
	q := db.New(pool)

	return q, client, func() { pool.Close() }, nil
}
