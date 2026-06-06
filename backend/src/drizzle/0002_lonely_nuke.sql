CREATE TYPE "public"."campus_contest_status" AS ENUM('scheduled', 'live', 'ended');--> statement-breakpoint
CREATE TABLE "campus_contest_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"contest_id" integer NOT NULL,
	"group_id" integer NOT NULL,
	"contest_group_score" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campus_contest_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"contest_group_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"contest_participant_score" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campus_contest_solves" (
	"id" serial PRIMARY KEY NOT NULL,
	"participant_id" integer NOT NULL,
	"contest_group_id" integer NOT NULL,
	"problem_id" text NOT NULL,
	"solved_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campus_contests" (
	"id" serial PRIMARY KEY NOT NULL,
	"start_time" timestamp(3) NOT NULL,
	"duration_minutes" integer NOT NULL,
	"cf_contest_id" integer,
	"status" "campus_contest_status" DEFAULT 'scheduled' NOT NULL,
	"last_synced_at" timestamp(3),
	"created_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campus_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_name" text NOT NULL,
	CONSTRAINT "campus_groups_group_name_unique" UNIQUE("group_name")
);
--> statement-breakpoint
ALTER TABLE "campus_contest_groups" ADD CONSTRAINT "campus_contest_groups_contest_id_campus_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."campus_contests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campus_contest_groups" ADD CONSTRAINT "campus_contest_groups_group_id_campus_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."campus_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campus_contest_participants" ADD CONSTRAINT "campus_contest_participants_contest_group_id_campus_contest_groups_id_fk" FOREIGN KEY ("contest_group_id") REFERENCES "public"."campus_contest_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campus_contest_participants" ADD CONSTRAINT "campus_contest_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campus_contest_solves" ADD CONSTRAINT "campus_contest_solves_participant_id_campus_contest_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."campus_contest_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campus_contest_solves" ADD CONSTRAINT "campus_contest_solves_contest_group_id_campus_contest_groups_id_fk" FOREIGN KEY ("contest_group_id") REFERENCES "public"."campus_contest_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campus_contest_solves" ADD CONSTRAINT "campus_contest_solves_participant_id_contest_group_id_campus_contest_participants_id_contest_group_id_fk" FOREIGN KEY ("participant_id","contest_group_id") REFERENCES "public"."campus_contest_participants"("id","contest_group_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "campus_contest_groups_contest_group" ON "campus_contest_groups" USING btree ("contest_id","group_id");--> statement-breakpoint
CREATE INDEX "campus_contest_groups_contest_idx" ON "campus_contest_groups" USING btree ("contest_id");--> statement-breakpoint
CREATE INDEX "campus_contest_groups_group_idx" ON "campus_contest_groups" USING btree ("group_id");--> statement-breakpoint
CREATE UNIQUE INDEX "campus_contest_participants_group_user" ON "campus_contest_participants" USING btree ("contest_group_id","user_id");--> statement-breakpoint
CREATE INDEX "campus_contest_participants_group_idx" ON "campus_contest_participants" USING btree ("contest_group_id");--> statement-breakpoint
CREATE UNIQUE INDEX "campus_contest_solves_participant_problem" ON "campus_contest_solves" USING btree ("participant_id","problem_id");--> statement-breakpoint
CREATE INDEX "campus_contest_solves_contest_group_idx" ON "campus_contest_solves" USING btree ("contest_group_id");--> statement-breakpoint
CREATE INDEX "campus_contest_solves_participant_idx" ON "campus_contest_solves" USING btree ("participant_id");