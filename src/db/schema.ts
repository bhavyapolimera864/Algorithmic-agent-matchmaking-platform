import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import type {
  ProfileAnalysis,
  CompatibilityBreakdown,
  ConversationLine,
  MatchHighlight,
} from "@/lib/types";

export const people = pgTable("people", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  linkedinUrl: text("linkedin_url").notNull(),
  instagramUrl: text("instagram_url").notNull(),
  profession: text("profession").notNull().default(""),
  location: text("location").notNull().default(""),
  avatarSeed: text("avatar_seed").notNull(),
  isDemo: boolean("is_demo").notNull().default(false),
  publicBio: text("public_bio").notNull().default(""),
  analysis: jsonb("analysis").$type<ProfileAnalysis>(),
  analysisSource: text("analysis_source"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  personId: integer("person_id")
    .notNull()
    .unique()
    .references(() => people.id, { onDelete: "cascade" }),
  interests: jsonb("interests").$type<string[]>().notNull(),
  hobbies: jsonb("hobbies").$type<string[]>().notNull(),
  personality: jsonb("personality").$type<string[]>().notNull(),
  lifestyle: jsonb("lifestyle").$type<string[]>().notNull(),
  careerGoals: jsonb("career_goals").$type<string[]>().notNull(),
  socialPreferences: jsonb("social_preferences").$type<string[]>().notNull(),
  relationshipPreferences: jsonb("relationship_preferences").$type<string[]>().notNull(),
  summary: text("summary").notNull(),
  compatibilityStrategy: text("compatibility_strategy").notNull(),
  status: text("status").notNull().default("ready"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const matches = pgTable(
  "matches",
  {
    id: serial("id").primaryKey(),
    agentAId: integer("agent_a_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    agentBId: integer("agent_b_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    personAId: integer("person_a_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    personBId: integer("person_b_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    breakdown: jsonb("breakdown").$type<CompatibilityBreakdown>().notNull(),
    sharedInterests: jsonb("shared_interests").$type<string[]>().notNull(),
    sharedHobbies: jsonb("shared_hobbies").$type<string[]>().notNull(),
    reasons: jsonb("reasons").$type<string[]>().notNull(),
    concerns: jsonb("concerns").$type<string[]>().notNull(),
    conversationTopics: jsonb("conversation_topics").$type<string[]>().notNull(),
    conversation: jsonb("conversation").$type<ConversationLine[]>().notNull(),
    decision: text("decision").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("matches_person_a_idx").on(table.personAId),
    index("matches_person_b_idx").on(table.personBId),
  ],
);

export const datingSessions = pgTable("dating_sessions", {
  id: serial("id").primaryKey(),
  totalPeople: integer("total_people").notNull(),
  totalPairs: integer("total_pairs").notNull(),
  totalMatches: integer("total_matches").notNull(),
  topScore: integer("top_score").notNull(),
  topPairPersonAId: integer("top_pair_person_a_id"),
  topPairPersonBId: integer("top_pair_person_b_id"),
  activityLog: jsonb("activity_log").$type<string[]>().notNull(),
  highlights: jsonb("highlights").$type<MatchHighlight[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
