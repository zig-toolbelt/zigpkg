# sync

Package sync job for [zigpkg.dev](https://zigpkg.dev). Fetches Zig packages and programs by topic from one or more **sources** and upserts them into the PostgreSQL database.

Two sources are supported:

- **GitHub** (`github`) — always enabled. Uses the **GraphQL API** (`https://api.github.com/graphql`), so each repository — including its latest tag, owner, topics, and stats — is retrieved in a single query.
- **Codeberg** (`codeberg`) — opt-in (set `CODEBERG_TOKEN`). A [Forgejo](https://forgejo.org) instance with a Gitea-compatible **REST API**: search returns repos + topics inline, but the latest tag costs one extra request per repo, fetched lazily only for repos that survive the incremental cutoff.

Both backends are mapped onto a shared `source.Source` interface (`source/`), so the sync loop is source-agnostic; rows carry a `source` column and identity is per-source (`(source, source_id)`).

## What it does

- Searches each enabled source for repositories tagged `zig-package` / `zig-library` (libraries) and `zig-program` (applications)
- Fetches up to 1000 repos per `(source, topic)`, ordered newest-activity-first
- Reads the latest git tag of each repo to determine the version (inline for GitHub; a lazy per-repo request for Codeberg)
- Upserts each repo's owner into `users` and the repo itself into `packages`, tagged with its `source`
- Records sync time in `sync_metadata` per `(source, topic)` — skips a pairing if it was synced less than 1 hour ago (override with `--force`)
- **Syncs incrementally**: after the first full pass, each run stops paging as soon as it reaches a repo that hasn't been pushed since the previous completed sync, so only genuinely changed (and newly published) packages are re-fetched instead of the whole topic every hour
- Checkpoints its pagination cursor after every page, so a run interrupted by a rate limit, cancellation, or crash resumes where it left off instead of restarting the pairing

## Usage

```bash
go build -o sync .
./sync              # sync all topics (same as `sync all`)
```

Or directly:

```bash
go run .
```

### Commands

```bash
sync all                            # sync all topics from every enabled source
sync repo <owner/name>              # sync a single GitHub repository by full name
sync repo <owner/name> --source codeberg   # …from Codeberg instead
```

### Flags

| Flag       | Description                                                            |
|------------|-----------------------------------------------------------------------|
| `--force`  | Skip the per-`(source, topic)` cooldown check **and** force a full re-sync (ignores the incremental cutoff, re-fetching every repo) |
| `--source` | (`repo` command only) source to fetch from: `github` (default) or `codeberg` |

## Environment variables

| Variable        | Default     | Description                        |
|-----------------|-------------|------------------------------------|
| `GITHUB_TOKEN`  | —           | GitHub personal access token (recommended, increases rate limit from 60 to 5000 req/h) |
| `CODEBERG_TOKEN`| —           | Codeberg/Forgejo token. When set, Codeberg is added as a second source; when empty, Codeberg is skipped (`codeberg disabled`) |
| `DB_HOST`       | `127.0.0.1` | PostgreSQL host                    |
| `DB_PORT`     | `5432`      | PostgreSQL port                    |
| `DB_NAME`     | `zigpkg`    | Database name                      |
| `DB_USER`     | `postgres`  | Database user                      |
| `DB_PASSWORD` | —           | Database password                  |

## Database

Uses the `users`, `packages`, and `sync_metadata` tables defined in `schema/schema.sql`.

DB code is generated via [sqlc](https://sqlc.dev):

```bash
sqlc generate
```

`sync_metadata.sync_cursor` holds the resume point of an in-progress pass. This
job's `schema/schema.sql` exists only to drive sqlc code generation — it does
**not** apply anything to the database. The live schema for this shared database
is owned by the panel app's Drizzle migrations (`drizzle/`, source of truth
`src/lib/server/db/schema.ts`). The `sync_cursor` column ships as Drizzle
migration `0001_new_loki`; the per-source identity columns (`source`,
`source_id`, replacing `github_id`, plus the `(source, …)` unique constraints)
ship as `0002_add_source` (all existing rows default to `source = 'github'`).
Apply migrations from the panel root:

```bash
npm run db:migrate
```

> Do **not** add the column with a manual `ALTER TABLE`: Drizzle runs in
> `strict` mode, so a column it doesn't know about would be proposed for
> deletion on the next `db:push`/`db:generate`. Keep the two schemas in sync.

## Incremental sync

A full pass over a topic costs ~40 GraphQL requests regardless of how much
actually changed, and most packages don't change between hourly runs. To avoid
re-fetching unchanged data, the search is ordered newest-push-first
(`sort:updated`) and each pass stops as soon as it reaches a repo that hasn't
been pushed since the **previous completed sync**:

- `sync_metadata.last_sync_at` is the watermark. It is advanced only when a pass
  completes; cursor checkpoints during a pass leave it untouched, so a resumed
  run keeps comparing against the last *finished* sync.
- The cutoff is `last_sync_at` minus a one-hour overlap. The overlap absorbs the
  previous pass's own runtime, clock skew, and any slack between GitHub's sort
  key and `pushedAt`, guaranteeing an update that landed mid-pass isn't skipped.
  The only cost is re-fetching the handful of repos pushed within that window.
- The first sync of a topic (no watermark) and any run with `--force` skip the
  cutoff and fetch the full set. A topic's in-progress first-sync checkpoint
  stores an `'epoch'` `last_sync_at` so that resuming it stays a full pass rather
  than being truncated by the cutoff.

The net effect: the first run per topic does the full ~40 requests; subsequent
runs typically finish in one or two pages, touching only changed and newly
published packages.

## Rate limiting

### GitHub

The GitHub client treats GitHub's server-reported limits as the source of truth
and is built as three layers:

- **Retrying transport** — a `RoundTripper` that injects the auth token, buffers
  the request body for replay, and transparently retries network errors, `5xx`
  responses, `429`, and secondary `403` rate limits. The wait before each retry
  comes from the `Retry-After` header, falls back to `x-ratelimit-reset` when the
  primary quota is exhausted, and otherwise uses exponential backoff
  (`500ms · 2^attempt`, capped at 60s) with full jitter. Attempts are bounded
  (5 by default) and every wait is context-aware, so a cancelled run stops
  promptly. When retries are exhausted on a rate-limit response it returns a
  typed `*RateLimitError`.
- **GraphQL semantics** — GitHub can also report throttling as a `RATE_LIMITED`
  error inside an otherwise-`200` body; that, too, surfaces as `*RateLimitError`.
- **Adaptive limiter** — each query's `rateLimit { limit cost remaining resetAt }`
  block feeds a token-bucket limiter that paces outbound requests to spend ~90%
  of the remaining point budget evenly across the time until reset (the 10%
  margin guards against secondary limits). When the budget is spent it crawls
  until the window resets.

### Codeberg

Codeberg is a shared community instance with no per-token point budget, only a
`429` + `Retry-After` backstop. The Codeberg client uses the generic retrying
transport in `httpx/` (network errors, `5xx`, `429`/secondary `403`, with
`Retry-After` → full-jitter backoff, context-aware, bounded attempts) and
self-paces well below the instance limit with a conservative token bucket
(~5 req/s, small burst) rather than an adaptive budget.

### Both

When a `(source, topic)` sync hits a rate limit it checkpoints its cursor and
stops cleanly; the next run resumes from that cursor (regardless of the 1h
cooldown) and clears it once the pairing completes. A 100ms delay is also added
between paginated search requests.
