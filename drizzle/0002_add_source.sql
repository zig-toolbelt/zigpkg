ALTER TABLE "users" ADD COLUMN "source" varchar(20) DEFAULT 'github' NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "source" varchar(20) DEFAULT 'github' NOT NULL;--> statement-breakpoint
ALTER TABLE "sync_metadata" ADD COLUMN "source" varchar(20) DEFAULT 'github' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "github_id" TO "source_id";--> statement-breakpoint
ALTER TABLE "packages" RENAME COLUMN "github_id" TO "source_id";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_github_id_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_username_unique";--> statement-breakpoint
ALTER TABLE "packages" DROP CONSTRAINT "packages_github_id_unique";--> statement-breakpoint
ALTER TABLE "sync_metadata" DROP CONSTRAINT "sync_metadata_topic_unique";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_source_source_id_unique" UNIQUE("source","source_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_source_username_unique" UNIQUE("source","username");--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_source_source_id_unique" UNIQUE("source","source_id");--> statement-breakpoint
ALTER TABLE "sync_metadata" ADD CONSTRAINT "sync_metadata_source_topic_unique" UNIQUE("source","topic");
