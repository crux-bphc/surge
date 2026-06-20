CREATE TABLE "event_contests" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"event_id" integer NOT NULL,
	"start_time" timestamp(3) NOT NULL,
	"duration_minutes" integer NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_contests_score" (
	"id" serial PRIMARY KEY NOT NULL,
	"participant_id" integer NOT NULL,
	"contest_score" integer DEFAULT 0 NOT NULL,
	"contest_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"group_score" integer DEFAULT 0 NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer,
	"user_id" text NOT NULL,
	"event_id" integer NOT NULL,
	"participant_score" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"desc" text,
	"created_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_contests" ADD CONSTRAINT "event_contests_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_contests_score" ADD CONSTRAINT "event_contests_score_participant_id_event_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."event_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_contests_score" ADD CONSTRAINT "event_contests_score_contest_id_event_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."event_contests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_groups" ADD CONSTRAINT "event_groups_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_group_id_event_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."event_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "event_contests_event_participant_unique" ON "event_contests_score" USING btree ("participant_id","contest_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_participant_unique" ON "event_participants" USING btree ("user_id","event_id");