
FROM docker.io/oven/bun:1-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache,id=bun_deps \
  bun install --frozen-lockfile

FROM base AS prod-deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache,id=bun_deps \
  bun install --frozen-lockfile --production

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV DATABASE_URL=${DATABASE_URL}
ENV PUBLIC_SITE_URL="https://zigpkg.dev"
RUN bun run prepare && bun run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
  PORT=3200 \
  BUN_RUNTIME_SECMGR_ENABLED=1

# tini + curl for healthcheck/signals
RUN apk add --no-cache tini curl && \
  addgroup -g 1001 -S app && \
  adduser -S app -u 1001 -G app

# Prod artifacts
COPY --from=prod-deps --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/build ./build
COPY --from=builder --chown=app:app /app/package.json ./
COPY --from=builder --chown=app:app /app/drizzle ./drizzle
COPY --from=builder --chown=app:app /app/drizzle.config.ts ./
COPY --from=builder --chown=app:app /app/scripts ./scripts

USER app
EXPOSE 3200

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "bun scripts/db-create.ts && bun run db:migrate && bun ./build/index.js"]
