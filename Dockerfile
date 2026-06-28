
FROM docker.io/node:24-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm,id=npm_deps \
  npm ci --legacy-peer-deps

FROM base AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm,id=npm_deps \
  npm ci --legacy-peer-deps --omit=dev

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV DATABASE_URL=${DATABASE_URL}
ENV PUBLIC_SITE_URL="https://zigpkg.dev"
RUN npm run prepare && npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
  PORT=3200

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
CMD ["sh", "-c", "node scripts/db-create.ts && npm run db:migrate && node ./build/index.js"]
