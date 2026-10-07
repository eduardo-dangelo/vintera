CREATE TABLE "calendar_feeds" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"music_project_id" integer NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calendar_feeds" ADD CONSTRAINT "calendar_feeds_music_project_id_music_projects_id_fk" FOREIGN KEY ("music_project_id") REFERENCES "public"."music_projects"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "calendar_feeds" ADD CONSTRAINT "calendar_feeds_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "calendar_feeds_token_idx" ON "calendar_feeds" USING btree ("token");
--> statement-breakpoint
CREATE UNIQUE INDEX "calendar_feeds_music_project_id_idx" ON "calendar_feeds" USING btree ("music_project_id");
