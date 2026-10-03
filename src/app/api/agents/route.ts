import { db } from "@/db";
import { agents, people } from "@/db/schema";
import { ensureSeedData } from "@/db/seed";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeedData();
  const rows = await db
    .select({
      id: agents.id,
      personId: agents.personId,
      personName: people.name,
      interests: agents.interests,
      hobbies: agents.hobbies,
      personality: agents.personality,
      lifestyle: agents.lifestyle,
      careerGoals: agents.careerGoals,
      socialPreferences: agents.socialPreferences,
      relationshipPreferences: agents.relationshipPreferences,
      summary: agents.summary,
      compatibilityStrategy: agents.compatibilityStrategy,
      status: agents.status,
      createdAt: agents.createdAt,
    })
    .from(agents)
    .innerJoin(people, eq(people.id, agents.personId));

  return Response.json({ agents: rows });
}
