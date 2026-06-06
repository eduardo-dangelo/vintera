ALTER TABLE "calendar_events" ALTER COLUMN "asset_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "music_project_id" integer;
--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_music_project_id_music_projects_id_fk" FOREIGN KEY ("music_project_id") REFERENCES "public"."music_projects"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_asset_or_project_chk" CHECK ("asset_id" IS NOT NULL OR "music_project_id" IS NOT NULL);
