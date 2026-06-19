package main

import (
	"context"
	"fmt"
	"log"
	"net/url"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/spf13/cobra"

	"zigpkg.dev/sync/codeberg"
	"zigpkg.dev/sync/db"
	gh "zigpkg.dev/sync/github"
	"zigpkg.dev/sync/source"
)

func main() {
	_ = godotenv.Load()

	rootCmd := &cobra.Command{
		Use:   "sync",
		Short: "Zig package sync tool",
		RunE: func(cmd *cobra.Command, _ []string) error {
			return runAllCmd(cmd.Context())
		},
	}

	rootCmd.PersistentFlags().BoolVar(&forceSync, "force", false, "skip sync cooldown check")

	rootCmd.AddCommand(&cobra.Command{
		Use:   "all",
		Short: "Sync all packages by topics from every enabled source",
		RunE: func(cmd *cobra.Command, _ []string) error {
			return runAllCmd(cmd.Context())
		},
	})

	var repoSource string
	repoCmd := &cobra.Command{
		Use:   "repo <owner/name>",
		Short: "Sync a single repository by full_name",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			q, sources, cleanup, err := setupEnv(cmd.Context())
			if err != nil {
				return err
			}
			defer cleanup()

			src := pickSource(sources, repoSource)
			if src == nil {
				return fmt.Errorf("source %q is not enabled (check its token)", repoSource)
			}
			return syncSingleRepo(cmd.Context(), q, src, args[0])
		},
	}
	repoCmd.Flags().StringVar(&repoSource, "source", gh.SourceName, "package source to fetch from (github, codeberg)")
	rootCmd.AddCommand(repoCmd)

	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func runAllCmd(ctx context.Context) error {
	q, sources, cleanup, err := setupEnv(ctx)
	if err != nil {
		return err
	}
	defer cleanup()
	return runAll(ctx, q, sources)
}

// pickSource returns the enabled source with the given name, or nil.
func pickSource(sources []source.Source, name string) source.Source {
	for _, s := range sources {
		if s.Name() == name {
			return s
		}
	}
	return nil
}

func setupEnv(ctx context.Context) (*db.Queries, []source.Source, func(), error) {
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

	// GitHub is always enabled (unauthenticated, heavily rate-limited, when
	// GITHUB_TOKEN is unset).
	sources := []source.Source{gh.NewSource(os.Getenv("GITHUB_TOKEN"))}

	// Codeberg is opt-in: it is a shared community instance, so we only crawl it
	// when a token is explicitly provided.
	if token := os.Getenv("CODEBERG_TOKEN"); token != "" {
		sources = append(sources, codeberg.NewSource(token))
	} else {
		log.Println("codeberg disabled (set CODEBERG_TOKEN to enable)")
	}

	q := db.New(pool)
	return q, sources, func() { pool.Close() }, nil
}
