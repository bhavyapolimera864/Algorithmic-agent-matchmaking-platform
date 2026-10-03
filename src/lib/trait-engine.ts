import {
  CAREER_GOALS_POOL,
  DEGREES_POOL,
  HOBBIES_POOL,
  INTERESTS_POOL,
  LIFESTYLE_POOL,
  PERSONALITY_POOL,
  RELATIONSHIP_PREFERENCES_POOL,
  SCHOOLS_POOL,
  SOCIAL_PREFERENCES_POOL,
  pickMany,
  pickOne,
} from "@/lib/trait-pools";
import type { ProfileAnalysis } from "@/lib/types";

/**
 * Deterministic trait derivation engine.
 *
 * Given a stable "seed key" (e.g. a person's name + profession), this
 * produces a reproducible -- but non-trivial and varied -- set of traits.
 * It is used:
 *   1. To generate the 26 realistic demo profiles at seed time.
 *   2. As the guaranteed fallback when the Gemini API is unavailable, so the
 *      app always works end-to-end without an API key.
 *
 * It is intentionally NOT random (Math.random) -- the same input always
 * yields the same output, which is important for a trustworthy demo.
 */
export function deriveTraitsFromSeed(
  seedKey: string,
): Pick<
  ProfileAnalysis,
  | "education"
  | "interests"
  | "hobbies"
  | "personality_traits"
  | "lifestyle"
  | "career_goals"
  | "social_preferences"
  | "relationship_preferences"
> {
  const interests = pickMany(INTERESTS_POOL, `${seedKey}:interests`, 6);
  const hobbies = pickMany(HOBBIES_POOL, `${seedKey}:hobbies`, 5);
  const lifestyle = pickMany(LIFESTYLE_POOL, `${seedKey}:lifestyle`, 4);
  const personality_traits = pickMany(PERSONALITY_POOL, `${seedKey}:personality`, 4);
  const career_goals = pickMany(CAREER_GOALS_POOL, `${seedKey}:career`, 3);
  const social_preferences = pickMany(SOCIAL_PREFERENCES_POOL, `${seedKey}:social`, 3);
  const relationship_preferences = pickMany(
    RELATIONSHIP_PREFERENCES_POOL,
    `${seedKey}:relationship`,
    3,
  );
  const degree = pickOne(DEGREES_POOL, `${seedKey}:degree`);
  const school = pickOne(SCHOOLS_POOL, `${seedKey}:school`);

  return {
    education: [`${degree} — ${school}`],
    interests,
    hobbies,
    personality_traits,
    lifestyle,
    career_goals,
    social_preferences,
    relationship_preferences,
  };
}

export function buildSummary(
  name: string,
  profession: string,
  interests: string[],
  hobbies: string[],
): string {
  const topInterests = interests.slice(0, 2).join(" and ");
  const topHobby = hobbies[0] ?? "exploring new experiences";
  return `${name} is a ${profession || "driven professional"} with a strong passion for ${topInterests}. Outside of work, ${name.split(" ")[0]} unwinds through ${topHobby.toLowerCase()} and values genuine, growth-oriented connections.`;
}
