import { db } from "@/db";
import { agents, people } from "@/db/schema";
import { ensureSeedData } from "@/db/seed";
import { buildAgentProfile } from "@/lib/agent-builder";
import { analyzeProfile } from "@/lib/gemini";
import { validatePersonInput } from "@/lib/validation";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSeedData();
    const rows = await db
      .select({
        id: people.id,
        name: people.name,
        linkedinUrl: people.linkedinUrl,
        instagramUrl: people.instagramUrl,
        profession: people.profession,
        location: people.location,
        avatarSeed: people.avatarSeed,
        isDemo: people.isDemo,
        analysis: people.analysis,
        analysisSource: people.analysisSource,
        createdAt: people.createdAt,
        agentId: agents.id,
        agentStatus: agents.status,
      })
      .from(people)
      .leftJoin(agents, eq(agents.personId, people.id))
      .orderBy(desc(people.createdAt));

    return Response.json({ people: rows });
  } catch (err) {
    console.error("GET /api/people failed", err);
    return Response.json({ error: "Failed to load people." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureSeedData();
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const errors = validatePersonInput(body);
    if (errors.length > 0) {
      return Response.json({ error: errors.join(" ") }, { status: 400 });
    }

    const name = String(body.name).trim();
    const linkedinUrl = String(body.linkedinUrl).trim();
    const instagramUrl = String(body.instagramUrl).trim();
    const profession = typeof body.profession === "string" ? body.profession.trim() : "";
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const publicBio = typeof body.publicBio === "string" ? body.publicBio.trim() : "";

    let analysisResult = body.analysisPreview;
    let source = body.analysisPreviewSource;
    let note = body.analysisPreviewNote;

    if (!analysisResult) {
      const result = await analyzeProfile({ name, linkedinUrl, instagramUrl, profession, location, publicBio });
      analysisResult = result.analysis;
      source = result.source;
      note = result.note;
    }

    const avatarSeed = `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

    const [person] = await db
      .insert(people)
      .values({
        name,
        linkedinUrl,
        instagramUrl,
        profession: analysisResult.profession || profession,
        location: analysisResult.location || location,
        avatarSeed,
        isDemo: false,
        publicBio,
        analysis: analysisResult,
        analysisSource: source,
      })
      .returning();

    const agentProfile = buildAgentProfile(name, analysisResult);
    const [agent] = await db
      .insert(agents)
      .values({
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
      })
      .returning();

    return Response.json({ person, agent, analysisNote: note }, { status: 201 });
  } catch (err) {
    console.error("POST /api/people failed", err);
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return Response.json({ error: `Failed to add person: ${message}` }, { status: 500 });
  }
}
