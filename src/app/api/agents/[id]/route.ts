import { db } from "@/db";
import { agents, people } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agentId = Number(id);
  if (!Number.isInteger(agentId)) {
    return Response.json({ error: "Invalid agent id." }, { status: 400 });
  }

  const [row] = await db
    .select({
      agent: agents,
      person: people,
    })
    .from(agents)
    .innerJoin(people, eq(people.id, agents.personId))
    .where(eq(agents.id, agentId));

  if (!row) {
    return Response.json({ error: "Agent not found." }, { status: 404 });
  }

  return Response.json(row);
}
