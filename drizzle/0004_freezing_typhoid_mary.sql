ALTER TABLE "packages" ADD COLUMN "status" varchar(20) DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "origin" varchar(20) DEFAULT 'sync' NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "submitted_by" text;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "submitted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "reviewed_by" text;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "primary_language" varchar(50);--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "has_zig_files" boolean;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "has_build_zig_zon" boolean;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "packages_status_idx" ON "packages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "packages_origin_idx" ON "packages" USING btree ("origin");--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_status_check" CHECK ("packages"."status" IN ('approved', 'pending', 'rejected'));--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_origin_check" CHECK ("packages"."origin" IN ('sync', 'manual'));