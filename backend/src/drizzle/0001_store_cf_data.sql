/*
CREATE TYPE "public"."verdict" AS ENUM('AC', 'WA', 'TLE', 'RE', 'CE', 'other');--> statement-breakpoint
CREATE TABLE "cf_user_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"problems_solved" integer DEFAULT 0,
	"contests_participated" integer DEFAULT 0,
	"last_updated" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contests" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_id" integer NOT NULL,
	"name" text NOT NULL,
	"start_time" timestamp(0),
	"duration_minutes" integer,
	"url" text,
	CONSTRAINT "contests_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "potd" (
	"id" serial PRIMARY KEY NOT NULL,
	"problem_id" integer NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	CONSTRAINT "potd_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "potd_solves" (
	"id" serial PRIMARY KEY NOT NULL,
	"potd_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"solved_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problems" (
	"id" serial PRIMARY KEY NOT NULL,
	"contest_id" integer NOT NULL,
	"index" text NOT NULL,
	"name" text NOT NULL,
	"points" integer,
	"rating" integer,
	"tags" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" bigint PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"problem_id" integer NOT NULL,
	"submitted_at" timestamp(3),
	"relative_time_seconds" bigint NOT NULL,
	"programming_language" text NOT NULL,
	"verdict" "verdict",
	"passed_test_count" integer,
	"time_consumed_millis" integer,
	"memory_consumed_bytes" integer
);
--> statement-breakpoint
CREATE TABLE "user_contests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"contest_id" integer NOT NULL,
	"rank" integer,
	"solved_count" integer,
	"penalty" integer,
	"old_rating" integer,
	"new_rating" integer,
	"update_time" timestamp(0)
);
--> statement-breakpoint
ALTER TABLE "_prisma_migrations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "_prisma_migrations" CASCADE;--> statement-breakpoint
ALTER TABLE "User" RENAME TO "users";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "pfpUrl" TO "pfp_url";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "cfHandle" TO "cf_handle";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "cfRating" TO "cf_rating";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
DROP INDEX "User_cfHandle_key";--> statement-breakpoint
DROP INDEX "User_email_key";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "codechef_handle" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "codechef_rating" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "atcoder_handle" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "atcoder_rating" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "leetcode_handle" text;--> statement-breakpoint
ALTER TABLE "cf_user_stats" ADD CONSTRAINT "cf_user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "potd" ADD CONSTRAINT "potd_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "potd_solves" ADD CONSTRAINT "potd_solves_potd_id_potd_id_fk" FOREIGN KEY ("potd_id") REFERENCES "public"."potd"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "potd_solves" ADD CONSTRAINT "potd_solves_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problems" ADD CONSTRAINT "problems_contest_id_contests_external_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("external_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_contests" ADD CONSTRAINT "user_contests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_contests" ADD CONSTRAINT "user_contests_contest_id_contests_external_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("external_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "problems_contest_index" ON "problems" USING btree ("contest_id","index");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_cf_handle_unique" UNIQUE("cf_handle");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_codechef_handle_unique" UNIQUE("codechef_handle");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_atcoder_handle_unique" UNIQUE("atcoder_handle");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_leetcode_handle_unique" UNIQUE("leetcode_handle");
*/