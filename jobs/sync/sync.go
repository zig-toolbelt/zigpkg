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

	"zigpkg.dev/sync/db"
	"zigpkg.dev/sync/source"
)

const (
	maxResults  = 1000
	pageDelayMs = 100

	// incrementalOverlap widens the freshness cutoff backwards from the last
	// completed sync. Results are paged newest-activity-first and the pass stops
	// at the first repo older than the cutoff, so the cutoff must sit far enough
	// in the past to absorb the previous pass's own runtime, clock skew between
	// our DB and the backend, and any slack between the backend's sort key and
	// pushedAt. The only cost of this overlap is re-fetching the handful of
	// repos pushed within the window — cheap insurance against missing an
	// update that landed mid-pass.
	incrementalOverlap = time.Hour

	PackageTypeLibrary     = "library"
	PackageTypeApplication = "application"
)

var forceSync bool

var topicToPackageType = map[string]string{
	"zig-package": PackageTypeLibrary,
	"zig-library": PackageTypeLibrary,
	"zig-program": PackageTypeApplication,
}

// runAll syncs every (source, topic) pairing. Sources are independent: a
// failure on one is logged and the next is attempted, but a cancelled context
// aborts the whole run.
func runAll(ctx context.Context, q *db.Queries, sources []source.Source) error {
	for _, src := range sources {
		for topic, pkgType := range topicToPackageType {
			if !shouldSync(ctx, q, src.Name(), topic) {
				log.Printf("[%s/%s] up to date, skipping", src.Name(), topic)
				continue
			}

			log.Printf("[%s/%s] starting sync...", src.Name(), topic)
			if err := syncTopic(ctx, q, src, topic, pkgType); err != nil {
				if errors.Is(err, context.Canceled) {
					return err
				}
				log.Printf("[%s/%s] sync error: %v", src.Name(), topic, err)
			}
		}
	}
	return nil
}

func syncSingleRepo(ctx context.Context, q *db.Queries, src source.Source, fullName string) error {
	parts := strings.SplitN(fullName, "/", 2)
	if len(parts) != 2 {
		return fmt.Errorf("invalid repo format %q, expected owner/name", fullName)
	}

	repo, err := src.GetRepo(ctx, parts[0], parts[1])
	if err != nil {
		return fmt.Errorf("fetch repo %s: %w", fullName, err)
	}

	pkgType := determinePackageType(repo.Topics)

	if err := upsertRepo(ctx, q, src.Name(), repo, pkgType); err != nil {
		return err
	}

	log.Printf("[%s] synced %s (type=%s)", src.Name(), fullName, pkgType)
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

func upsertRepo(ctx context.Context, q *db.Queries, srcName string, repo *source.Repo, pkgType string) error {
	version := repo.LatestTag
	if version == "" {
		version = "latest"
	}

	topicsJSON, _ := json.Marshal(repo.Topics) // []string marshal cannot fail; stored as jsonb

	ownerID, err := q.UpsertUser(ctx, db.UpsertUserParams{
		Source:    srcName,
		SourceID:  repo.Owner.SourceID,
		Username:  repo.Owner.Login,
		AvatarUrl: pgtype.Text{String: repo.Owner.AvatarURL, Valid: true},
		HtmlUrl:   pgtype.Text{String: repo.Owner.HTMLURL, Valid: repo.Owner.HTMLURL != ""},
	})
	if err != nil {
		return fmt.Errorf("upsert user %s: %w", repo.Owner.Login, err)
	}

	params := db.UpsertPackageParams{
		Source:        srcName,
		SourceID:      repo.SourceID,
		Name:          repo.Name,
		FullName:      repo.FullName,
		OwnerID:       ownerID,
		Description:   nullText(repo.Description),
		Version:       pgtype.Text{String: version, Valid: true},
		Stars:         repo.Stars,
		Forks:         repo.Forks,
		OpenIssues:    repo.OpenIssues,
		License:       nullText(repo.License),
		Homepage:      nullText(repo.Homepage),
		RepositoryUrl: repo.URL,
		Topics:        topicsJSON,
		PackageType:   pkgType,
		CreatedAt:     pgtype.Timestamptz{Time: repo.CreatedAt, Valid: !repo.CreatedAt.IsZero()},
		UpdatedAt:     pgtype.Timestamptz{Time: repo.UpdatedAt, Valid: !repo.UpdatedAt.IsZero()},
		PushedAt:      pgtype.Timestamptz{Time: repo.PushedAt, Valid: !repo.PushedAt.IsZero()},
	}

	if err := q.UpsertPackage(ctx, params); err != nil {
		return fmt.Errorf("upsert package %s: %w", repo.FullName, err)
	}
	return nil
}

// syncTopic walks a (source, topic)'s search results page by page, upserting
// each repo.
//
// It is incremental: search results are ordered newest-activity-first, so once
// the pass reaches a repo not pushed since the previous completed sync (minus
// an overlap margin) it stops — everything beyond is already current. A topic's
// first sync, or any run with --force, has no watermark and fetches the full
// set (up to maxResults).
//
// It is also resumable: progress is checkpointed (cursor + running total) after
// every page so an interrupted pass — whether stopped by a rate limit,
// cancellation, or crash — continues from where it left off on the next run
// instead of restarting from the top. It returns context.Canceled when
// interrupted; a rate-limit pause is a clean stop (nil) that resumes next run.
func syncTopic(ctx context.Context, q *db.Queries, src source.Source, topic, pkgType string) error {
	srcName := src.Name()
	// tagger is non-nil for sources (Codeberg) whose search results omit the
	// latest tag; the tag is resolved per-repo only after the cutoff check.
	tagger, _ := src.(source.TagFetcher)

	cursor, total, lastSync := loadCheckpoint(ctx, q, srcName, topic)
	if cursor != "" {
		log.Printf("[%s/%s] resuming from cursor %q (%d already synced)", srcName, topic, cursor, total)
	}

	// cutoff is the incremental watermark: repos pushed before it are unchanged
	// since the last completed sync and can be skipped. A zero cutoff (first sync
	// or --force) disables the early exit and forces a full pass.
	var cutoff time.Time
	if !forceSync && !lastSync.IsZero() {
		cutoff = lastSync.Add(-incrementalOverlap)
		log.Printf("[%s/%s] incremental sync: only repos pushed after %s", srcName, topic, cutoff.Format(time.RFC3339))
	}

	for total < maxResults {
		page, err := src.SearchPage(ctx, topic, cursor)
		if err != nil {
			switch {
			case isRateLimit(err):
				log.Printf("[%s/%s] rate limited; checkpointed at %d packages, resuming next run", srcName, topic, total)
				saveCheckpoint(ctx, q, srcName, topic, cursor, total)
				return nil
			case errors.Is(err, context.Canceled):
				return err
			default:
				log.Printf("[%s/%s] search error: %v", srcName, topic, err)
				return err
			}
		}
		if len(page.Repos) == 0 {
			break
		}
		log.Printf("[%s/%s] fetched %d repos (cursor: %q)", srcName, topic, len(page.Repos), cursor)

		reachedCutoff := false
		for i := range page.Repos {
			repo := &page.Repos[i]
			// Results are newest-activity-first, so the first repo at or below
			// the cutoff means every remaining repo is also unchanged: stop.
			if !cutoff.IsZero() && !repo.PushedAt.IsZero() && repo.PushedAt.Before(cutoff) {
				reachedCutoff = true
				break
			}

			// Resolve the latest tag lazily, only now that the repo has cleared
			// the cutoff and is actually going to be upserted. A rate limit here
			// is treated exactly like one during search: checkpoint and resume.
			if tagger != nil && repo.LatestTag == "" {
				tag, err := tagger.LatestTag(ctx, repo.Owner.Login, repo.Name)
				if err != nil {
					if isRateLimit(err) {
						log.Printf("[%s/%s] rate limited fetching tag; checkpointed at %d packages, resuming next run", srcName, topic, total)
						saveCheckpoint(ctx, q, srcName, topic, cursor, total)
						return nil
					}
					if errors.Is(err, context.Canceled) {
						return err
					}
					// Non-fatal: upsert without a version rather than skip the repo.
					log.Printf("[%s/%s] tag fetch for %s failed: %v", srcName, topic, repo.FullName, err)
				} else {
					repo.LatestTag = tag
				}
			}

			if err := upsertRepo(ctx, q, srcName, repo, pkgType); err != nil {
				log.Printf("  %v", err)
				continue
			}
			total++
		}
		if reachedCutoff {
			log.Printf("[%s/%s] reached repos unchanged since last sync; %d updated this pass", srcName, topic, total)
			break
		}

		cursor = page.NextCursor
		if !page.HasNext {
			break
		}

		// Durable progress: a crash or kill after this point resumes here.
		saveCheckpoint(ctx, q, srcName, topic, cursor, total)

		select {
		case <-time.After(pageDelayMs * time.Millisecond):
		case <-ctx.Done():
			return ctx.Err()
		}
	}

	// Pass complete: clear the cursor and bump the cooldown.
	if err := q.UpsertSyncMetadata(ctx, db.UpsertSyncMetadataParams{
		Source:     srcName,
		Topic:      topic,
		TotalCount: pgtype.Int4{Int32: int32(total), Valid: true},
	}); err != nil {
		log.Printf("[%s/%s] sync metadata error: %v", srcName, topic, err)
		return err
	}
	log.Printf("[%s/%s] done: %d packages synced", srcName, topic, total)
	return nil
}

// isRateLimit reports whether err is (or wraps) a neutral rate-limit signal.
func isRateLimit(err error) bool {
	var rle *source.RateLimitError
	return errors.As(err, &rle)
}

// loadCheckpoint returns the saved pagination cursor, running total, and the
// incremental watermark for a (source, topic). cursor/total describe an
// interrupted pass (both zero for a fresh start). lastSync is the timestamp of
// the previous completed pass, used as the freshness cutoff; it is the zero time
// when the (source, topic) has never been synced (so the first pass is full). A
// (source, topic) whose only write so far is an in-progress first-sync
// checkpoint carries an 'epoch' last_sync_at, far enough in the past that the
// cutoff never trips and the resumed first pass stays full.
func loadCheckpoint(ctx context.Context, q *db.Queries, srcName, topic string) (cursor string, total int, lastSync time.Time) {
	meta, err := q.GetSyncMetadata(ctx, db.GetSyncMetadataParams{Source: srcName, Topic: topic})
	if err != nil {
		return "", 0, time.Time{}
	}
	if meta.LastSyncAt.Valid {
		lastSync = meta.LastSyncAt.Time
	}
	if meta.SyncCursor.Valid && meta.SyncCursor.String != "" {
		return meta.SyncCursor.String, int(meta.TotalCount.Int32), lastSync
	}
	return "", 0, lastSync
}

// saveCheckpoint persists the cursor and running total without touching the
// cooldown. An empty cursor is a no-op: there is nothing to resume from, and a
// fresh pass already restarts from the top.
func saveCheckpoint(ctx context.Context, q *db.Queries, srcName, topic, cursor string, total int) {
	if cursor == "" {
		return
	}
	if err := q.SaveSyncCursor(ctx, db.SaveSyncCursorParams{
		Source:     srcName,
		Topic:      topic,
		TotalCount: pgtype.Int4{Int32: int32(total), Valid: true},
		SyncCursor: pgtype.Text{String: cursor, Valid: true},
	}); err != nil {
		log.Printf("[%s/%s] checkpoint error: %v", srcName, topic, err)
	}
}

func shouldSync(ctx context.Context, q *db.Queries, srcName, topic string) bool {
	if forceSync {
		return true
	}
	meta, err := q.GetSyncMetadata(ctx, db.GetSyncMetadataParams{Source: srcName, Topic: topic})
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			log.Printf("[%s/%s] sync metadata check error: %v", srcName, topic, err)
		}
		return true
	}
	// An interrupted pass (non-empty cursor) must finish regardless of the
	// cooldown window.
	if meta.SyncCursor.Valid && meta.SyncCursor.String != "" {
		return true
	}
	return time.Now().After(meta.NextSyncAt.Time)
}
