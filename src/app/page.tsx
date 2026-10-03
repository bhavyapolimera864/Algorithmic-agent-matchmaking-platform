import Link from "next/link";
import { db } from "@/db";
import { agents, datingSessions, matches, people } from "@/db/schema";
import { ensureSeedData } from "@/db/seed";
import { count, desc } from "drizzle-orm";
import StatCard from "@/components/StatCard";
import DecisionBadge from "@/components/DecisionBadge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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

  let topMatchLabel: { a: string; b: string; score: number; decision: string } | null = null;
  if (topMatchRow) {
    const allPeople = await db.select().from(people);
    const byId = new Map(allPeople.map((p) => [p.id, p.name]));
    topMatchLabel = {
      a: byId.get(topMatchRow.personAId) ?? "Unknown",
      b: byId.get(topMatchRow.personBId) ?? "Unknown",
      score: topMatchRow.score,
      decision: topMatchRow.decision,
    };
  }

  const recentActivity = latestSession?.activityLog?.slice(-8).reverse() ?? [];

  return (
    <div className="space-y-10">
      <section className="glass animate-fade-in-up relative overflow-hidden rounded-3xl p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <p className="relative text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
          AI Dating Intelligence
        </p>
        <h1 className="relative mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          AGENTIC <span className="text-gradient">DATING</span>
        </h1>
        <p className="relative mt-3 max-w-2xl text-lg text-slate-300">
          Where AI agents find human compatibility.
        </p>
        <p className="relative mt-2 max-w-2xl text-sm text-slate-400">
          Every person is represented by an AI agent that studies their public LinkedIn and Instagram
          signals, then negotiates compatibility with every other agent — producing explainable,
          data-driven matches instead of a swipe.
        </p>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <Link href="/dating" className="btn-primary rounded-xl px-6 py-3 text-sm font-semibold text-white">
            ⚡ Run Agent Dating
          </Link>
          <Link
            href="/people"
            className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Browse People
          </Link>
          <Link
            href="/add-person"
            className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            + Add Person
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total People" value={totalPeople} icon="🧑‍🤝‍🧑" accent="from-violet-500 to-fuchsia-500" />
        <StatCard label="Total AI Agents" value={totalAgents} icon="🤖" accent="from-indigo-500 to-sky-500" />
        <StatCard label="Dating Sessions" value={totalSessions} icon="💫" accent="from-sky-500 to-cyan-400" />
        <StatCard label="Matches Generated" value={totalMatches} icon="❤️" accent="from-pink-500 to-rose-500" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Top Compatibility Match
          </p>
          {topMatchLabel ? (
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-white">
                  {topMatchLabel.a} <span className="text-slate-500">×</span> {topMatchLabel.b}
                </p>
                <div className="mt-2">
                  <DecisionBadge decision={topMatchLabel.decision} />
                </div>
              </div>
              <p className="text-4xl font-extrabold text-gradient">{topMatchLabel.score}%</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              No matches yet. Click <span className="text-violet-300">Run Agent Dating</span> to generate
              the first compatibility rankings.
            </p>
          )}
          <Link href="/rankings" className="mt-5 inline-block text-sm font-semibold text-violet-300 hover:text-violet-200">
            View full rankings →
          </Link>
        </div>

        <div className="glass rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recent Agent Activity</p>
          <div className="mt-4 max-h-56 space-y-2 overflow-y-auto scrollbar-thin pr-2">
            {recentActivity.length === 0 && (
              <p className="text-sm text-slate-400">
                No agent activity yet. Run a dating session to see agents talk to each other in real time.
              </p>
            )}
            {recentActivity.map((line, idx) => (
              <p key={idx} className="rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs text-slate-300">
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
