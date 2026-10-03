import { db } from "@/db";
import { people } from "@/db/schema";
import { ensureSeedData } from "@/db/seed";
import { asc } from "drizzle-orm";
import RankingsClient from "@/components/RankingsClient";

export const dynamic = "force-dynamic";

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ personId?: string }>;
}) {
  await ensureSeedData();
  const { personId } = await searchParams;

  const rows = await db
    .select({ id: people.id, name: people.name, profession: people.profession, avatarSeed: people.avatarSeed })
    .from(people)
    .orderBy(asc(people.name));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Rankings</h1>
        <p className="mt-1 text-slate-400">
          Pick a person to see their AI agent&apos;s ranked compatibility matches, sorted however you like.
        </p>
      </div>
      <RankingsClient people={rows} initialPersonId={personId ? Number(personId) : null} />
    </div>
  );
}
