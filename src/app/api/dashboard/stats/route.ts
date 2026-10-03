import { db } from "@/db";
import { agents, datingSessions, matches, people } from "@/db/schema";
import { ensureSeedData } from "@/db/seed";
import { count, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeedData();

  const [[{ value: totalPeople }], [{ value: totalAgents }], [{ value: totalSessions }], [{ value: totalMatches }]] =
    await Promise.all([
      db.select({ value: count() }).from(people),
      db.select({ value: count() }).from(agents),
      db.select({ value: count() }).from(datingSessions),
      db.select({ value: count() }).from(matches),
    ]);

  const [topMatchRow] = await db.select().from(matches).orderBy(desc(matches.score)).limit(1);
  const [latestSession] = await db
    .select()
    .from(datingSessions)
    .orderBy(desc(datingSessions.createdAt))
    .limit(1);

  let topMatch = null;
  if (topMatchRow) {
    const allPeople = await db.select().from(people);
    const peopleById = new Map(allPeople.map((p) => [p.id, p]));
    const a = peopleById.get(topMatchRow.personAId);
    const b = peopleById.get(topMatchRow.personBId);
    topMatch = {
      matchId: topMatchRow.id,
      personAName: a?.name,
      personBName: b?.name,
      score: topMatchRow.score,
      decision: topMatchRow.decision,
    };
  }

  return Response.json({
    totalPeople,
    totalAgents,
    totalSessions,
    totalMatches,
    topMatch,
    recentActivity: latestSession?.activityLog ?? [],
  });
}
