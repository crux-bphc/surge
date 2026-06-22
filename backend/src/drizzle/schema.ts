import {
  pgTable,
  timestamp,
  text,
  integer,
  index,
  uniqueIndex,
  serial,
  date,
  jsonb,
  pgEnum,
  bigint,
  real,
  foreignKey
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  name: text("name"),
  pfpUrl: text("pfp_url"),
  cfHandle: text("cf_handle").unique(),
  cfRating: integer("cf_rating"),
  codechefHandle: text("codechef_handle").unique(),
  codechefRating: integer("codechef_rating"),
  atcoderHandle: text("atcoder_handle").unique(),
  atcoderRating: integer("atcoder_rating"),
  leetcodeHandle: text("leetcode_handle").unique(),
  createdAt: timestamp("created_at", { precision: 3, mode: "string" })
    .defaultNow()
    .notNull(),
});

export const verdictEnum = pgEnum("verdict", [
  "AC",
  "WA",
  "TLE",
  "RE",
  "CE",
  "other",
]);

export const problems = pgTable(
  "problems",
  {
    id: serial("id").primaryKey(),
    contestId: integer("contest_id")
      .notNull()
      .references(() => contests.externalId),
    index: text("index").notNull(),
    name: text("name").notNull(),
    points: integer("points"),
    rating: integer("rating"),
    tags: jsonb("tags").notNull().$type<string[]>(),
  },
  (table) => [
    // ensure unique per contest + index
    uniqueIndex("problems_contest_index").on(table.contestId, table.index),
  ]
);

export const contests = pgTable("contests", {
  id: serial("id").primaryKey(),
  externalId: integer("external_id").notNull().unique(),
  name: text("name").notNull(),
  startTime: timestamp("start_time", { precision: 0, mode: "string" }),
  durationMinutes: integer("duration_minutes"),
  url: text("url"),
});

export const submissions = pgTable("submissions", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  problemId: integer("problem_id")
    .notNull()
    .references(() => problems.id),
  submittedAt: timestamp("submitted_at", { precision: 3, mode: "string" }),
  relativeTimeSeconds: bigint("relative_time_seconds", {
    mode: "number",
  }).notNull(),
  programmingLanguage: text("programming_language").notNull(),
  verdict: verdictEnum("verdict"),
  passedTestCount: integer("passed_test_count"),
  runtimeMs: integer("time_consumed_millis"),
  memoryKb: integer("memory_consumed_bytes"),
});

export const userContests = pgTable(
  "user_contests",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    contestId: integer("contest_id")
      .notNull()
      .references(() => contests.externalId),
    rank: integer("rank"),
    solvedCount: integer("solved_count"),
    penalty: integer("penalty"),
    oldRating: integer("old_rating"),
    newRating: integer("new_rating"),
    updateTime: timestamp("update_time", { precision: 0, mode: "string" }),
  },
  (table) => [
    uniqueIndex("user_contest_unique").on(table.userId, table.contestId),
  ]
);

export const potd = pgTable("potd", {
  id: serial("id").primaryKey(),
  problemId: integer("problem_id")
    .notNull()
    .references(() => problems.id),
  date: date("date").notNull().unique(),
  createdAt: timestamp("created_at", { precision: 3, mode: "string" })
    .defaultNow()
    .notNull(),
});

export const potdSolves = pgTable("potd_solves", {
  id: serial("id").primaryKey(),
  potdId: integer("potd_id")
    .notNull()
    .references(() => potd.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  solvedAt: timestamp("solved_at", { precision: 3, mode: "string" })
    .defaultNow()
    .notNull(),
});

export const cfUserStats = pgTable("cf_user_stats", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  problemsSolved: integer("problems_solved").default(0),
  contestsParticipated: integer("contests_participated").default(0),
  lastUpdated: timestamp("last_updated", { precision: 3, mode: "string" })
    .defaultNow()
    .notNull(),
});

export type MonthlySolves = {
  month: string,
  label: string,
  solvedCount: number
}[];

export const wrapped25 = pgTable("wrapped_25", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id).unique(),
  submissionCount: integer("submission_count").notNull(),
  solvedCount: integer("solved_count").notNull(),
  monthlySolves: jsonb("monthly_solves").$type<MonthlySolves>().notNull(),
  accuracy: real("accuracy").notNull(),
  mostSolvedTags: jsonb("most_solved_tags").$type<string[]>().notNull(),
  longestStreak: integer("longest_streak").notNull().default(1),
  contestCount: integer("contest_count").notNull().default(0),
  initialRating: integer("initial_rating"),
  finalRating: integer("final_rating"),
  highestRating: integer("highest_rating"),
  potdSolves: integer("potd_solves"),
  campusRank: integer("campus_rank").notNull(),
  batchRank: integer("batch_rank").notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  desc: text("desc"),
  createdAt: timestamp("created_at", { precision: 3, mode: "string" }).defaultNow().notNull(),
});

export const eventContests = pgTable("event_contests", {
  id: integer("id").primaryKey(), // cf contestid
  name: text("name").notNull(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time", { precision: 3, mode: "string" }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  createdAt: timestamp("created_at", { precision: 3, mode: "string" }).defaultNow().notNull(),
});

export const eventGroups = pgTable("event_groups", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  groupScore: integer("group_score").notNull().default(0),
  name: text("name").notNull(),
});

export const eventParticipants = pgTable(
  "event_participants",
  {
    id: serial("id").primaryKey(),
    groupId: integer("group_id").references(() => eventGroups.id, {onDelete: "cascade",}),
    userId: text("user_id").notNull().references(() => users.id),
    eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    participantScore: integer("participant_score").notNull().default(0),
  },
  (table) => [
    uniqueIndex("event_participant_unique").on(
      table.userId,
      table.eventId
    ),
  ]
);

export const eventContestsScore = pgTable(
  "event_contests_score",
  {
    id: serial("id").primaryKey(),
    participantId: integer("participant_id").notNull().references(() => eventParticipants.id, { onDelete: "cascade" }),
    contestScore: integer("contest_score").notNull().default(0),
    contestId: integer("contest_id").notNull().references(() => eventContests.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("event_contests_event_participant_unique").on(
      table.participantId,
      table.contestId
    ),
  ]
);

