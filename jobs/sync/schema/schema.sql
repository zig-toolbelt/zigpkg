CREATE TABLE packages (
  id serial PRIMARY KEY,
  github_id integer NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  full_name varchar(512) NOT NULL,
  owner varchar(255) NOT NULL,
  owner_avatar_url text,
  description text,
  version varchar(50) DEFAULT 'latest',
  stars integer NOT NULL DEFAULT 0,
  forks integer NOT NULL DEFAULT 0,
  open_issues integer NOT NULL DEFAULT 0,
  license varchar(100),
  homepage text,
  repository_url text NOT NULL,
  topics text,
  package_type varchar(20) NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  pushed_at timestamptz NOT NULL,
  cached_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sync_metadata (
  id serial PRIMARY KEY,
  topic varchar(100) NOT NULL UNIQUE,
  last_sync_at timestamptz NOT NULL,
  total_count integer DEFAULT 0,
  next_sync_at timestamptz NOT NULL
);
