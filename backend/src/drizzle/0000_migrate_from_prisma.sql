-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"pfpUrl" text,
	"cfHandle" text,
	"cfRating" integer,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX "User_cfHandle_key" ON "User" USING btree ("cfHandle" text_ops);
CREATE UNIQUE INDEX "User_email_key" ON "User" USING btree ("email" text_ops);
*/