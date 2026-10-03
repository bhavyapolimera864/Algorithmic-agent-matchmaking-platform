import { db } from "@/db";
import { agents, matches, people } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matchId = Number(id);
  if (!Number.isInteger(matchId)) {
    return Response.json({ error: "Invalid match id." }, { status: 400 });
  }

  const [match] = await db.select().from(matches).where(eq(matches.id, matchId));
  if (!match) {
    return Response.json({ error: "Match not found." }, { status: 404 });
  }

  const [personA] = await db.select().from(people).where(eq(people.id, match.personAId));
  const [personB] = await db.select().from(people).where(eq(people.id, match.personBId));
  const [agentA] = await db.select().from(agents).where(eq(agents.id, match.agentAId));
  const [agentB] = await db.select().from(agents).where(eq(agents.id, match.agentBId));

  return Response.json({ match, personA, personB, agentA, agentB });
}
