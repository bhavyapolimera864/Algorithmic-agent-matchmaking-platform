import { db } from "@/db";
import { agents, datingSessions, matches, people } from "@/db/schema";
import { ensureSeedData } from "@/db/seed";
import { computeCompatibility } from "@/lib/compatibility";
import type { AgentProfile, MatchHighlight } from "@/lib/types";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const MATCH_THRESHOLD = 60;

interface Participant {
  personId: number;
  agentId: number;
  name: string;
  profession: string;
  agentProfile: AgentProfile;
}

export async function POST() {
  try {
    await ensureSeedData();

    const rows = await db
      .select({
        personId: people.id,
        name: people.name,
        profession: people.profession,
        agentId: agents.id,
        interests: agents.interests,
        hobbies: agents.hobbies,
        personality: agents.personality,
        lifestyle: agents.lifestyle,
        careerGoals: agents.careerGoals,
        socialPreferences: agents.socialPreferences,
        relationshipPreferences: agents.relationshipPreferences,
        summary: agents.summary,
        compatibilityStrategy: agents.compatibilityStrategy,
      })
      .from(agents)
      .innerJoin(people, eq(people.id, agents.personId));

    if (rows.length < 2) {
      return Response.json(
        { error: "Need at least two people with AI agents to run agent dating." },
        { status: 400 },
      );
    }

    const participants: Participant[] = rows.map((r) => ({
      personId: r.personId,
      agentId: r.agentId,
      name: r.name,
      profession: r.profession,
      agentProfile: {
        interests: r.interests,
        hobbies: r.hobbies,
        personality: r.personality,
        lifestyle: r.lifestyle,
        careerGoals: r.careerGoals,
        socialPreferences: r.socialPreferences,
        relationshipPreferences: r.relationshipPreferences,
        summary: r.summary,
        compatibilityStrategy: r.compatibilityStrategy,
      },
    }));

    const matchRows: (typeof matches.$inferInsert)[] = [];
    let topScore = -1;
    let topPair: { a: Participant; b: Participant } | null = null;
    let totalMatches = 0;

    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const a = participants[i];
        const b = participants[j];
        const result = computeCompatibility(
          a.name,
          a.agentProfile,
          a.profession,
          b.name,
          b.agentProfile,
          b.profession,
        );

        if (result.score >= MATCH_THRESHOLD) totalMatches++;
        if (result.score > topScore) {
          topScore = result.score;
          topPair = { a, b };
        }

        matchRows.push({
          agentAId: a.agentId,
          agentBId: b.agentId,
          personAId: a.personId,
          personBId: b.personId,
          score: result.score,
          breakdown: result.breakdown,
          sharedInterests: result.sharedInterests,
          sharedHobbies: result.sharedHobbies,
          reasons: result.reasons,
          concerns: result.concerns,
          conversationTopics: result.conversationTopics,
          conversation: result.conversation,
          decision: result.decision,
        });
      }
    }

    await db.delete(matches);
    // Chunk inserts to stay well under any statement parameter limits.
    const CHUNK = 200;
    for (let i = 0; i < matchRows.length; i += CHUNK) {
      await db.insert(matches).values(matchRows.slice(i, i + CHUNK));
    }

    const insertedMatches = await db.select().from(matches);
    const byId = new Map(insertedMatches.map((m) => [`${m.personAId}-${m.personBId}`, m]));

    const sortedForHighlights = [...matchRows].sort((x, y) => y.score - x.score).slice(0, 14);

    const highlights: MatchHighlight[] = sortedForHighlights.map((m) => {
      const a = participants.find((p) => p.personId === m.personAId)!;
      const b = participants.find((p) => p.personId === m.personBId)!;
      const persisted = byId.get(`${m.personAId}-${m.personBId}`);
      return {
        matchId: persisted?.id,
        personAId: a.personId,
        personAName: a.name,
        personBId: b.personId,
        personBName: b.name,
        score: m.score,
        decision: m.decision,
        sharedInterests: m.sharedInterests as string[],
      };
    });

    const activityLog: string[] = [];
    for (const h of highlights) {
      activityLog.push(`Agent ${h.personAName.split(" ")[0]} is analyzing Agent ${h.personBName.split(" ")[0]}.`);
      activityLog.push(`Agent ${h.personBName.split(" ")[0]} is analyzing Agent ${h.personAName.split(" ")[0]}.`);
      if (h.sharedInterests.length > 0) {
        activityLog.push(`Shared interest detected: ${h.sharedInterests[0]}.`);
      }
      activityLog.push(`Compatibility calculated: ${h.score}%.`);
      if (h.score >= MATCH_THRESHOLD) {
        activityLog.push(`Match created: ${h.personAName} ↔ ${h.personBName} (${h.decision}).`);
      }
    }
    activityLog.push(
      `Dating session complete — evaluated ${matchRows.length} agent pairs across ${participants.length} people.`,
    );

    const [session] = await db
      .insert(datingSessions)
      .values({
        totalPeople: participants.length,
        totalPairs: matchRows.length,
        totalMatches,
        topScore: Math.max(topScore, 0),
        topPairPersonAId: topPair?.a.personId,
        topPairPersonBId: topPair?.b.personId,
        activityLog,
        highlights,
      })
      .returning();

    return Response.json({
      session,
      highlights,
      totalPairs: matchRows.length,
      totalMatches,
      totalPeople: participants.length,
      topMatch: topPair
        ? {
            personAId: topPair.a.personId,
            personAName: topPair.a.name,
            personBId: topPair.b.personId,
            personBName: topPair.b.name,
            score: topScore,
          }
        : null,
    });
  } catch (err) {
    console.error("POST /api/dating/run failed", err);
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return Response.json({ error: `Agent dating run failed: ${message}` }, { status: 500 });
  }
}
