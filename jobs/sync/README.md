# sync

GitHub sync job for [zigpkg.dev](https://zigpkg.dev). Fetches Zig packages and programs from GitHub by topic and upserts them into the PostgreSQL database.

## What it does

- Searches GitHub for repositories tagged `zig-package` (libraries) and `zig-program` (applications)
- Fetches up to 1000 repos per topic (10 pages × 100 per page), sorted by stars
- Fetches the latest git tag for each repo to determine the version
- Upserts all data into the `packages` table
- Records sync time in `sync_metadata` — skips a topic if synced less than 1 hour ago

## Usage

```bash
go build -o sync .
./sync
```

Or directly:

```bash
go run .
```

## Environment variables

| Variable      | Default     | Description                        |
|---------------|-------------|------------------------------------|
| `GITHUB_TOKEN`| —           | GitHub personal access token (recommended, increases rate limit from 60 to 5000 req/h) |
| `DB_HOST`     | `127.0.0.1` | PostgreSQL host                    |
| `DB_PORT`     | `5432`      | PostgreSQL port                    |
| `DB_NAME`     | `zigpkg`    | Database name                      |
| `DB_USER`     | `postgres`  | Database user                      |
| `DB_PASSWORD` | —           | Database password                  |

## Database

Uses the `packages` and `sync_metadata` tables defined in `schema/schema.sql`.

DB code is generated via [sqlc](https://sqlc.dev):

```bash
sqlc generate
```

## Rate limiting

The client tracks `X-RateLimit-Remaining` and `X-RateLimit-Reset` headers and stops making requests when the limit is exhausted. A 50ms delay is added between tag fetches and 100ms between paginated search requests.
