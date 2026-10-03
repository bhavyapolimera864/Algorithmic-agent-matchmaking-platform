import { db } from "@/db";
import { agents, people } from "@/db/schema";
import { buildAgentProfile } from "@/lib/agent-builder";
import { analyzeProfile } from "@/lib/gemini";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const personId = Number(id);
  if (!Number.isInteger(personId)) {
    return Response.json({ error: "Invalid person id." }, { status: 400 });
  }

  const [person] = await db.select().from(people).where(eq(people.id, personId));
  if (!person) {
    return Response.json({ error: "Person not found." }, { status: 404 });
  }

  try {
    const result = await analyzeProfile({
      name: person.name,
      linkedinUrl: person.linkedinUrl,
      instagramUrl: person.instagramUrl,
      profession: person.profession,
      location: person.location,
      publicBio: person.publicBio,
    });

    const [updatedPerson] = await db
      .update(people)
      .set({
        analysis: result.analysis,
        analysisSource: result.source,
        profession: result.analysis.profession || person.profession,
        location: result.analysis.location || person.location,
      })
      .where(eq(people.id, personId))
      .returning();

    const agentProfile = buildAgentProfile(person.name, result.analysis);
    const [updatedAgent] = await db
      .insert(agents)
      .values({
        personId,
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
      })
      .onConflictDoUpdate({
        target: agents.personId,
        set: {
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
        },
      })
      .returning();

    return Response.json({
      person: updatedPerson,
      agent: updatedAgent,
      analysisNote: result.note,
    });
  } catch (err) {
    console.error(`POST /api/people/${id}/analyze failed`, err);
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return Response.json({ error: `Re-analysis failed: ${message}` }, { status: 500 });
  }
}
