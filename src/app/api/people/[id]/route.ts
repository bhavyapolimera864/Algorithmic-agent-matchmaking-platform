import { db } from "@/db";
import { agents, people } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const personId = Number(id);
  if (!Number.isInteger(personId)) {
    return Response.json({ error: "Invalid person id." }, { status: 400 });
  }

  const [person] = await db.select().from(people).where(eq(people.id, personId));
  if (!person) {
    return Response.json({ error: "Person not found." }, { status: 404 });
  }

  const [agent] = await db.select().from(agents).where(eq(agents.personId, personId));

  return Response.json({ person, agent: agent ?? null });
}
