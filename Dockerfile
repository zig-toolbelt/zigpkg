
FROM oven/bun:1-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache,id=bun,bundle=bun_deps \
  bun install --frozen-lockfile

FROM base AS prod-deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache,id=bun,bundle=bun_prod_deps \
  bun install --frozen-lockfile --production

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
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

USER app
EXPOSE 3200

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3200/ || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["bun", "./build/index.js"]
