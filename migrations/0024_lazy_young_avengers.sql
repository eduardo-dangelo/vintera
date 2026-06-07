ALTER TABLE "music_project_members" ADD COLUMN "permission" text DEFAULT 'admin' NOT NULL;
--> statement-breakpoint
ALTER TABLE "music_project_members" ADD COLUMN "project_role" text;
--> statement-breakpoint
UPDATE "music_project_members" SET "permission" = 'admin' WHERE "permission" IS NULL OR "permission" = '';
