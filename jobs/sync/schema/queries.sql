-- name: UpsertPackage :exec
INSERT INTO packages (
  github_id, name, full_name, owner, owner_avatar_url,
  description, version, stars, forks, open_issues,
  license, homepage, repository_url, topics,
  package_type, created_at, updated_at, pushed_at, cached_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
  $11, $12, $13, $14, $15, $16, $17, $18, now()
)
ON CONFLICT (github_id) DO UPDATE SET
  name           = EXCLUDED.name,
  full_name      = EXCLUDED.full_name,
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
SELECT id, topic, last_sync_at, total_count, next_sync_at
FROM sync_metadata
WHERE topic = $1;

-- name: UpsertSyncMetadata :exec
INSERT INTO sync_metadata (topic, last_sync_at, total_count, next_sync_at)
VALUES ($1, now(), $2, now() + interval '1 hour')
ON CONFLICT (topic) DO UPDATE SET
  last_sync_at = now(),
  total_count  = EXCLUDED.total_count,
  next_sync_at = now() + interval '1 hour';
