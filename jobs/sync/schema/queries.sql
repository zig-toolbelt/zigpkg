-- name: UpsertUser :one
INSERT INTO users (source, source_id, username, avatar_url, bio, html_url, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, now())
ON CONFLICT (source, source_id) DO UPDATE SET
  username   = EXCLUDED.username,
  avatar_url = EXCLUDED.avatar_url,
  bio        = EXCLUDED.bio,
  html_url   = EXCLUDED.html_url,
  updated_at = now()
RETURNING id;

-- name: UpsertPackage :exec
INSERT INTO packages (
  source, source_id, name, full_name, owner_id,
  description, version, stars, forks, open_issues,
  license, homepage, repository_url, topics,
  package_type, created_at, updated_at, pushed_at, cached_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9,
  $10, $11, $12, $13, $14, $15, $16, $17, $18, now()
)
ON CONFLICT (source, source_id) DO UPDATE SET
  name           = EXCLUDED.name,
  full_name      = EXCLUDED.full_name,
  owner_id       = EXCLUDED.owner_id,
  description    = EXCLUDED.description,
  version        = EXCLUDED.version,
  stars          = EXCLUDED.stars,
  forks          = EXCLUDED.forks,
  open_issues    = EXCLUDED.open_issues,
  license        = EXCLUDED.license,
  homepage       = EXCLUDED.homepage,
  topics         = EXCLUDED.topics,
  updated_at     = EXCLUDED.updated_at,
  pushed_at      = EXCLUDED.pushed_at,
  cached_at      = now();

-- name: GetSyncMetadata :one
SELECT id, source, topic, last_sync_at, total_count, next_sync_at, sync_cursor
FROM sync_metadata
WHERE source = $1 AND topic = $2;

-- name: UpsertSyncMetadata :exec
-- Marks a (source, topic) pass as complete: bumps the cooldown and clears the cursor.
INSERT INTO sync_metadata (source, topic, last_sync_at, total_count, next_sync_at, sync_cursor)
VALUES ($1, $2, now(), $3, now() + interval '1 hour', NULL)
ON CONFLICT (source, topic) DO UPDATE SET
  last_sync_at = now(),
  total_count  = EXCLUDED.total_count,
  next_sync_at = now() + interval '1 hour',
  sync_cursor  = NULL;

-- name: SaveSyncCursor :exec
-- Checkpoints an in-progress pass: persists the pagination cursor and the
-- running total without bumping the cooldown, so an interrupted run resumes.
-- last_sync_at is only ever advanced by UpsertSyncMetadata on completion; the
-- INSERT branch (a (source, topic)'s first-ever checkpoint) seeds it with
-- 'epoch' so a resumed *first* sync is not mistaken for an incremental pass and
-- truncated by the freshness cutoff. The UPDATE branch deliberately leaves
-- last_sync_at alone, preserving the previous completed pass as the watermark.
INSERT INTO sync_metadata (source, topic, last_sync_at, total_count, next_sync_at, sync_cursor)
VALUES ($1, $2, 'epoch', $3, now() + interval '1 hour', $4)
ON CONFLICT (source, topic) DO UPDATE SET
  total_count = EXCLUDED.total_count,
  sync_cursor = EXCLUDED.sync_cursor;
