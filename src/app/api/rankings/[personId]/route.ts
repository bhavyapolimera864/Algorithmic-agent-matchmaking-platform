import { db } from "@/db";
import { matches, people } from "@/db/schema";
import type { CompatibilityBreakdown } from "@/lib/types";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ personId: string }> }) {
  const { personId: personIdRaw } = await params;
  const personId = Number(personIdRaw);
  if (!Number.isInteger(personId)) {
    return Response.json({ error: "Invalid person id." }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get("sortBy") || "score";

  const [person] = await db.select().from(people).where(eq(people.id, personId));
  if (!person) {
    return Response.json({ error: "Person not found." }, { status: 404 });
  }

  const rows = await db
    .select()
    .from(matches)
    .where(or(eq(matches.personAId, personId), eq(matches.personBId, personId)));

  const allPeople = await db.select().from(people);
  const peopleById = new Map(allPeople.map((p) => [p.id, p]));

  const rankings = rows.map((m) => {
    const isA = m.personAId === personId;
    const otherId = isA ? m.personBId : m.personAId;
    const other = peopleById.get(otherId);
    const breakdown = m.breakdown as CompatibilityBreakdown;
    return {
      matchId: m.id,
      otherPersonId: otherId,
      otherPersonName: other?.name ?? "Unknown",
      otherPersonProfession: other?.profession ?? "",
      otherPersonLocation: other?.location ?? "",
      otherAvatarSeed: other?.avatarSeed ?? String(otherId),
      score: m.score,
      breakdown,
      sharedInterests: m.sharedInterests,
      sharedHobbies: m.sharedHobbies,
      reasons: m.reasons,
      concerns: m.concerns,
      decision: m.decision,
    };
  });

  rankings.sort((a, b) => {
    switch (sortBy) {
      case "interests":
        return (b.sharedInterests as string[]).length - (a.sharedInterests as string[]).length || b.score - a.score;
      case "lifestyle":
        return b.breakdown.lifestyle - a.breakdown.lifestyle || b.score - a.score;
      case "personality":
        return b.breakdown.personality - a.breakdown.personality || b.score - a.score;
      case "score":
      default:
        return b.score - a.score;
    }
  });

  return Response.json({ person, rankings });
}
