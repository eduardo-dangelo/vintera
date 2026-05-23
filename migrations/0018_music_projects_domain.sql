CREATE TABLE "music_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"genre" text,
	"color" text,
	"status" text DEFAULT 'active' NOT NULL,
	"cover_image_url" text,
	"metadata" jsonb,
	"linked_asset_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "albums" (
	"id" serial PRIMARY KEY NOT NULL,
	"music_project_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"release_date" timestamp,
	"cover_image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "songs" (
	"id" serial PRIMARY KEY NOT NULL,
	"music_project_id" integer NOT NULL,
	"album_id" integer,
	"title" text NOT NULL,
	"track_number" integer,
	"duration_seconds" integer,
	"key" text,
	"bpm" integer,
	"lyrics" text,
	"chords_or_tabs" text,
	"metadata" jsonb,
	"status" text DEFAULT 'idea' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "music_projects" ADD CONSTRAINT "music_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "music_projects" ADD CONSTRAINT "music_projects_linked_asset_id_assets_id_fk" FOREIGN KEY ("linked_asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "albums" ADD CONSTRAINT "albums_music_project_id_music_projects_id_fk" FOREIGN KEY ("music_project_id") REFERENCES "public"."music_projects"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_music_project_id_music_projects_id_fk" FOREIGN KEY ("music_project_id") REFERENCES "public"."music_projects"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "music_projects_user_slug_idx" ON "music_projects" USING btree ("user_id","slug");
--> statement-breakpoint
CREATE INDEX "music_projects_user_id_idx" ON "music_projects" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "albums_music_project_id_idx" ON "albums" USING btree ("music_project_id");
--> statement-breakpoint
CREATE INDEX "songs_music_project_id_idx" ON "songs" USING btree ("music_project_id");
--> statement-breakpoint
CREATE INDEX "songs_album_id_idx" ON "songs" USING btree ("album_id");
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "theme" SET DEFAULT 'dark';
