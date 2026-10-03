import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { matches, people } from "@/db/schema";
import { eq } from "drizzle-orm";
import Avatar from "@/components/Avatar";
import Chip from "@/components/Chip";
import ScoreBar from "@/components/ScoreBar";
import DecisionBadge from "@/components/DecisionBadge";
import type { ConversationLine } from "@/lib/types";

export const dynamic = "force-dynamic";

function PersonColumn({ person }: { person: typeof people.$inferSelect }) {
  const analysis = person.analysis;
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <Avatar seed={person.avatarSeed} size={56} />
        <div>
          <p className="font-semibold text-white">{person.name}</p>
          <p className="text-xs text-slate-400">{person.profession}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Interests</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {analysis?.interests.map((i) => (
              <Chip key={i} color="violet">
                {i}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Hobbies</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {analysis?.hobbies.map((h) => (
              <Chip key={h} color="sky">
                {h}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Lifestyle</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {analysis?.lifestyle.map((l) => (
              <Chip key={l} color="amber">
                {l}
              </Chip>
            ))}
          </div>
        </div>
      </div>
      <Link
        href={`/people/${person.id}`}
        className="mt-4 inline-block text-xs font-semibold text-violet-300 hover:text-violet-200"
      >
        View full profile →
      </Link>
    </div>
  );
}

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matchId = Number(id);
  if (!Number.isInteger(matchId)) notFound();

  const [match] = await db.select().from(matches).where(eq(matches.id, matchId));
  if (!match) notFound();

  const [personA] = await db.select().from(people).where(eq(people.id, match.personAId));
  const [personB] = await db.select().from(people).where(eq(people.id, match.personBId));
  if (!personA || !personB) notFound();

  const conversation = match.conversation as ConversationLine[];
  const breakdown = match.breakdown;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          {personA.name} <span className="text-slate-500">×</span> {personB.name}
        </h1>
        <p className="mt-1 text-slate-400">Agent-to-agent compatibility match detail</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PersonColumn person={personA} />
        <PersonColumn person={personB} />
      </div>

      <div className="glass rounded-3xl p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Compatibility Score</p>
        <p className="mt-2 text-6xl font-extrabold text-gradient">{match.score}%</p>
        <div className="mt-4 flex justify-center">
          <DecisionBadge decision={match.decision} />
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white">Compatibility Breakdown</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ScoreBar label="Interests" value={breakdown.interests} />
          <ScoreBar label="Lifestyle" value={breakdown.lifestyle} />
          <ScoreBar label="Personality" value={breakdown.personality} />
          <ScoreBar label="Hobbies" value={breakdown.hobbies} />
          <ScoreBar label="Career" value={breakdown.career} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white">Why Their Agents Matched</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {match.reasons.map((r, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-emerald-400">✓</span>
                {r}
              </li>
            ))}
          </ul>
          <h3 className="mt-5 text-sm font-semibold text-slate-400">Potential Concerns</h3>
          <ul className="mt-2 space-y-2 text-sm text-slate-300">
            {match.concerns.map((c, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-amber-400">!</span>
                {c}
              </li>
            ))}
          </ul>
          <h3 className="mt-5 text-sm font-semibold text-slate-400">Conversation Starters</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {match.conversationTopics.map((t) => (
              <Chip key={t} color="emerald">
                {t}
              </Chip>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white">Simulated Agent Conversation</h2>
          <p className="mt-1 text-xs text-slate-500">
            AI-generated (simulated) dialogue based on each agent&apos;s real extracted traits — labeled
            clearly as a simulation, not an actual chat between the people.
          </p>
          <div className="mt-4 space-y-3">
            {conversation.map((line, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  line.speaker === "A"
                    ? "bg-violet-500/15 text-violet-100"
                    : "ml-auto bg-sky-500/15 text-sky-100"
                }`}
              >
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-70">
                  Agent {line.speaker === "A" ? personA.name.split(" ")[0] : personB.name.split(" ")[0]}
                </p>
                {line.text}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-slate-400">Final Decision</p>
            <div className="mt-2 flex justify-center">
              <DecisionBadge decision={match.decision} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
