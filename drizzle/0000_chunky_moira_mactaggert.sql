CREATE TABLE "package_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" integer NOT NULL,
	"readme" text,
	"tags" jsonb,
	"files" jsonb,
	"zon_content" text,
	"last_sync" timestamp with time zone,
	CONSTRAINT "package_content_package_id_unique" UNIQUE("package_id")
);

CREATE TABLE "packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"github_id" bigint NOT NULL,
	"name" varchar(255) NOT NULL,
	"full_name" varchar(512) NOT NULL,
	"owner_id" integer NOT NULL,
	"description" text,
	"version" varchar(50) DEFAULT 'latest',
	"stars" integer DEFAULT 0 NOT NULL,
	"forks" integer DEFAULT 0 NOT NULL,
	"open_issues" integer DEFAULT 0 NOT NULL,
	"license" varchar(100),
	"homepage" text,
	"repository_url" text NOT NULL,
	"topics" jsonb,
	"package_type" varchar(20) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"pushed_at" timestamp with time zone NOT NULL,
	"cached_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "packages_github_id_unique" UNIQUE("github_id"),
	CONSTRAINT "packages_package_type_check" CHECK ("packages"."package_type" IN ('library', 'application'))
);
--> statement-breakpoint
CREATE TABLE "sync_metadata" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic" varchar(100) NOT NULL,
	"last_sync_at" timestamp with time zone NOT NULL,
	"total_count" integer DEFAULT 0,
	"next_sync_at" timestamp with time zone NOT NULL,
	CONSTRAINT "sync_metadata_topic_unique" UNIQUE("topic")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"github_id" bigint NOT NULL,
	"username" varchar(255) NOT NULL,
	"avatar_url" text,
	"bio" text,
	"html_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_github_id_unique" UNIQUE("github_id"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);

ALTER TABLE "package_content"
ADD CONSTRAINT "package_content_package_id_packages_id_fk"
FOREIGN KEY ("package_id")
REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "packages"
ADD CONSTRAINT "packages_owner_id_users_id_fk"
FOREIGN KEY ("owner_id")
REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

CREATE INDEX "packages_stars_idx" ON "packages" USING btree ("stars");
CREATE INDEX "packages_updated_idx" ON "packages" USING btree ("updated_at");
CREATE INDEX "packages_cached_idx" ON "packages" USING btree ("cached_at");
CREATE INDEX "packages_type_idx" ON "packages" USING btree ("package_type");
CREATE INDEX "packages_owner_idx" ON "packages" USING btree ("owner_id");