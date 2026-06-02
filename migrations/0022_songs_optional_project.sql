ALTER TABLE "songs" ADD COLUMN "user_id" text;--> statement-breakpoint
UPDATE "songs" SET "user_id" = "music_projects"."user_id" FROM "music_projects" WHERE "music_projects"."id" = "songs"."music_project_id";--> statement-breakpoint
ALTER TABLE "songs" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" DROP CONSTRAINT "songs_music_project_id_music_projects_id_fk";--> statement-breakpoint
ALTER TABLE "songs" ALTER COLUMN "music_project_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_music_project_id_music_projects_id_fk" FOREIGN KEY ("music_project_id") REFERENCES "public"."music_projects"("id") ON DELETE set null ON UPDATE no action;
