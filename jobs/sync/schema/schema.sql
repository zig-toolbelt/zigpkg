-- id is text (uuid), not serial: the SvelteKit app's Auth.js integration
-- requires a string user id (see panel/src/lib/server/db/schema.ts), and this
-- job upserts into the same table. name/email/email_verified/image are
-- Auth.js-only columns this job never reads or writes; omitted here since
-- sqlc only needs to type-check the queries this job actually issues.
CREATE TABLE users (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  source varchar(20) NOT NULL DEFAULT 'github',
  source_id bigint NOT NULL,
  username varchar(255) NOT NULL,
  avatar_url text,
  bio text,
  html_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, source_id),
  UNIQUE (source, username)
);

CREATE TABLE packages (
  id serial PRIMARY KEY,
  source varchar(20) NOT NULL DEFAULT 'github',
  source_id bigint NOT NULL,
  name varchar(255) NOT NULL,
  full_name varchar(512) NOT NULL,
  owner_id text NOT NULL REFERENCES users(id),
  description text,
  version varchar(50) DEFAULT 'latest',
  stars integer NOT NULL DEFAULT 0,
  forks integer NOT NULL DEFAULT 0,
  open_issues integer NOT NULL DEFAULT 0,
  license varchar(100),
  homepage text,
  repository_url text NOT NULL,
  topics jsonb,
  package_type varchar(20) NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  pushed_at timestamptz NOT NULL,
  cached_at timestamptz NOT NULL DEFAULT now(),
  status varchar(20) NOT NULL DEFAULT 'approved',
  origin varchar(20) NOT NULL DEFAULT 'sync',
  submitted_by text REFERENCES users(id),
  submitted_at timestamptz,
  reviewed_by text REFERENCES users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  primary_language varchar(50),
  has_zig_files boolean,
  has_build_zig_zon boolean,
  UNIQUE (source, source_id)
);

CREATE TABLE package_content (
  id serial PRIMARY KEY,
  package_id integer NOT NULL UNIQUE REFERENCES packages(id) ON DELETE CASCADE,
  readme text,
  tags jsonb,
  files jsonb,
  zon_content text,
  last_sync timestamptz
);

CREATE TABLE sync_metadata (
  id serial PRIMARY KEY,
  source varchar(20) NOT NULL DEFAULT 'github',
  topic varchar(100) NOT NULL,
  last_sync_at timestamptz NOT NULL,
  total_count integer DEFAULT 0,
  next_sync_at timestamptz NOT NULL,
  sync_cursor text,
  UNIQUE (source, topic)
);
