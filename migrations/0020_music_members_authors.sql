CREATE TABLE "music_project_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"music_project_id" integer NOT NULL,
	"user_id" text,
	"display_name" text,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "song_authors" (
	"id" serial PRIMARY KEY NOT NULL,
	"song_id" integer NOT NULL,
	"member_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "music_project_members" ADD CONSTRAINT "music_project_members_music_project_id_music_projects_id_fk" FOREIGN KEY ("music_project_id") REFERENCES "public"."music_projects"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "music_project_members" ADD CONSTRAINT "music_project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "song_authors" ADD CONSTRAINT "song_authors_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "song_authors" ADD CONSTRAINT "song_authors_member_id_music_project_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."music_project_members"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "music_project_members_project_user_idx" ON "music_project_members" USING btree ("music_project_id","user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "song_authors_song_member_idx" ON "song_authors" USING btree ("song_id","member_id");
--> statement-breakpoint
CREATE INDEX "music_project_members_music_project_id_idx" ON "music_project_members" USING btree ("music_project_id");
--> statement-breakpoint
CREATE INDEX "song_authors_song_id_idx" ON "song_authors" USING btree ("song_id");
--> statement-breakpoint
INSERT INTO "music_project_members" ("music_project_id", "user_id", "sort_order", "created_at", "updated_at")
SELECT mp."id", mp."user_id", 0, now(), now()
FROM "music_projects" mp
INNER JOIN "users" u ON u."id" = mp."user_id"
WHERE NOT EXISTS (
	SELECT 1 FROM "music_project_members" mpm
	WHERE mpm."music_project_id" = mp."id" AND mpm."user_id" = mp."user_id"
);
