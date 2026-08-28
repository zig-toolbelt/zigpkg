# zigpkg.dev — SvelteKit Frontend

## Project

**zigpkg.dev** is an open-source package registry for the Zig programming language. Users can browse, search, and discover Zig libraries and applications.

- **Framework:** SvelteKit 2 (adapter-node) + Svelte 5
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 (`@tailwindcss/vite`) + `tailwind-merge`, `tailwind-variants`, `tw-animate-css`
- **Icons:** `lucide-svelte`
- **Database:** PostgreSQL + Drizzle ORM 0.45 + `drizzle-kit` 0.31
- **Auth:** Auth.js with GitHub OAuth
- **Testing:** Vitest 4 (unit) + Playwright (E2E)
- **Doc rendering:** `marked` / `asciidoctor` / `rst-compiler` + `highlight.js`
- **Sanitization:** `isomorphic-dompurify`
- **Formatting:** EditorConfig only (2-space indent, LF). No ESLint/Prettier.
- **Package manager:** Bun (dev), npm (Docker build)
- **Sync worker:** Go binary at `jobs/sync/` — crawls GitHub/Codeberg

## Key Directories

| Directory | Purpose |
|---|---|
| `src/lib/` | Shared library: components, utils, types, services, server logic |
| `src/lib/server/db/` | Drizzle schema + DB client |
| `src/lib/server/packages/` | Package resolution, queries, readme rendering |
| `src/lib/server/github/` | GitHub API client |
| `src/lib/server/codeberg/` | Codeberg API client |
| `src/lib/components/` | Reusable Svelte components |
| `src/routes/` | SvelteKit pages + API endpoints |
| `drizzle/` | DB migration SQL files |
| `e2e/` | Playwright tests |
| `jobs/sync/` | Go sync worker |

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | **Typecheck** — `svelte-kit sync && svelte-check` (run after any code changes) |
| `npm run test:unit` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test` | All tests (unit + E2E) |
| `npm run db:push` | Push schema to DB |
| `npm run db:generate` | Generate migration SQL |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:studio` | Launch Drizzle Studio |

## MCP Tools (Svelte Documentation)

You have access to a Svelte MCP server with comprehensive Svelte 5 and SvelteKit docs.

### 1. `list-sections`
Use this **FIRST** to discover available doc sections. Always call it when asked about Svelte/SvelteKit.

### 2. `get-documentation`
Fetch full docs for specific sections. After `list-sections`, fetch ALL relevant sections.

### 3. `svelte-autofixer`
Analyzes Svelte code for issues. **Must** use this whenever writing Svelte code — keep calling until no issues remain.

### 4. `playground-link`
Generates a Svelte Playground link. Only call after user confirmation and NEVER if code was written to files.

## Code Conventions

- **No comments** in code unless absolutely necessary
- Follow existing patterns: check neighboring files before writing new code
- Use `cn()` utility from `$lib/utils/cn` for Tailwind class merging
- UI variants via `tailwind-variants` (see `button-variants.ts`, `badge-variants.ts`)
- Run `npm run check` after any change — fix all type errors
- Use `$lib` path alias for imports (SvelteKit default)