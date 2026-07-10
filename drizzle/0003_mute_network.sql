-- users.id changes from serial to text (uuid): required by @auth/drizzle-adapter's
-- AdapterUser contract. The FK from packages.owner_id must be dropped before either
-- side's type changes, since Postgres rejects a type change on a column that's part
-- of an active FK to an incompatible type on the other side.
ALTER TABLE "packages" DROP CONSTRAINT "packages_owner_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" TYPE text USING "id"::text;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "owner_id" TYPE text USING "owner_id"::text;
--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id");
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");
--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
