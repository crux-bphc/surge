CREATE TABLE "wrapped_25" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"submission_count" integer NOT NULL,
	"solved_count" integer NOT NULL,
	"monthly_solves" jsonb NOT NULL,
	"accuracy" real NOT NULL,
	"most_solved_tags" jsonb NOT NULL,
	"longest_streak" integer DEFAULT 1 NOT NULL,
	"contest_count" integer DEFAULT 0 NOT NULL,
	"initial_rating" integer,
	"final_rating" integer,
	"highest_rating" integer,
	"potd_solves" integer,
	"campus_rank" integer NOT NULL,
	"batch_rank" integer NOT NULL,
	CONSTRAINT "wrapped_25_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "wrapped_25" ADD CONSTRAINT "wrapped_25_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;