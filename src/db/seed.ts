import { db } from "@/db";
import { agents, people } from "@/db/schema";
import { DEMO_PEOPLE } from "@/db/seed-data";
import { buildAgentProfile } from "@/lib/agent-builder";
import { count } from "drizzle-orm";

let seedingPromise: Promise<void> | null = null;

async function seedNow(): Promise<void> {
  const [row] = await db.select({ value: count() }).from(people);

  if (Number(row?.value ?? 0) >= DEMO_PEOPLE.length) {
    return;
  }

  for (const demo of DEMO_PEOPLE) {
    const [person] = await db
      .insert(people)
      .values({
        name: demo.name,
        linkedinUrl: demo.linkedinUrl,
        instagramUrl: demo.instagramUrl,
        profession: demo.profession,
        location: demo.location,
        avatarSeed: demo.avatarSeed,
        isDemo: true,
        publicBio: demo.publicBio,
        analysis: demo.analysis,
        analysisSource: "demo-seed",
      })
      .returning();

    const agentProfile = buildAgentProfile(demo.name, demo.analysis);

    await db.insert(agents).values({
      personId: person.id,
      interests: agentProfile.interests,
      hobbies: agentProfile.hobbies,
      personality: agentProfile.personality,
      lifestyle: agentProfile.lifestyle,
      careerGoals: agentProfile.careerGoals,
      socialPreferences: agentProfile.socialPreferences,
      relationshipPreferences: agentProfile.relationshipPreferences,
      summary: agentProfile.summary,
      compatibilityStrategy: agentProfile.compatibilityStrategy,
      status: "ready",
    });
  }
}

/**
 * Ensures the demo dataset (26 realistic seeded people + their AI agents)
 * exists. Safe to call on every request -- it's a cheap COUNT query after
 * the first successful seed, and concurrent calls share one in-flight
 * promise so we never double-insert.
 */
export function ensureSeedData(): Promise<void> {
  if (!seedingPromise) {
    seedingPromise = seedNow().catch((err) => {
      seedingPromise = null;
      throw err;
    });
  }
  return seedingPromise;
}
