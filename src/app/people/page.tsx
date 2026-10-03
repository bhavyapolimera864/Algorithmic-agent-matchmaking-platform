import { db } from "@/db";
import { agents, people } from "@/db/schema";
import { ensureSeedData } from "@/db/seed";
import { desc, eq } from "drizzle-orm";
import PeopleGridClient from "@/components/PeopleGridClient";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  await ensureSeedData();

  const rows = await db
    .select({
      id: people.id,
      name: people.name,
      profession: people.profession,
      location: people.location,
      avatarSeed: people.avatarSeed,
      analysis: people.analysis,
      isDemo: people.isDemo,
      agentId: agents.id,
      agentStatus: agents.status,
    })
    .from(people)
    .leftJoin(agents, eq(agents.personId, people.id))
    .orderBy(desc(people.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">People</h1>
        <p className="mt-1 text-slate-400">
          {rows.length} profiles represented by AI dating agents — including 26 seeded demo profiles so
          the app works instantly.
        </p>
      </div>
      <PeopleGridClient people={rows} />
    </div>
  );
}
