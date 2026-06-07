ALTER TABLE "music_project_members" ADD COLUMN "project_roles" text[];
--> statement-breakpoint
UPDATE "music_project_members" SET "project_roles" = ARRAY["project_role"] WHERE "project_role" IS NOT NULL AND "project_role" != '';
--> statement-breakpoint
ALTER TABLE "music_project_members" DROP COLUMN "project_role";
