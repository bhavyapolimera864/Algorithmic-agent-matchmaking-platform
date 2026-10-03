import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { agents, people } from "@/db/schema";
import { eq } from "drizzle-orm";
import Avatar from "@/components/Avatar";
import Chip from "@/components/Chip";

export const dynamic = "force-dynamic";

function Section({ title, items, color }: { title: string; items: string[]; color: Parameters<typeof Chip>[0]["color"] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <Chip key={item} color={color}>
            {item}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export default async function PersonProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const personId = Number(id);
  if (!Number.isInteger(personId)) notFound();

  const [person] = await db.select().from(people).where(eq(people.id, personId));
  if (!person) notFound();

  const [agent] = await db.select().from(agents).where(eq(agents.personId, personId));
  const analysis = person.analysis;

  return (
    <div className="space-y-8">
      <div className="glass rounded-3xl p-8">
        <div className="flex flex-wrap items-start gap-6">
          <Avatar seed={person.avatarSeed} size={110} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{person.name}</h1>
              {person.isDemo ? <Chip color="slate">Demo Profile</Chip> : <Chip color="emerald">User Added</Chip>}
            </div>
            <p className="mt-1 text-lg text-slate-300">{person.profession}</p>
            <p className="text-sm text-slate-500">📍 {person.location}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={person.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-200 hover:bg-sky-500/20"
              >
                💼 LinkedIn Profile
              </a>
              <a
                href={person.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-pink-400/30 bg-pink-500/10 px-4 py-2 text-sm font-semibold text-pink-200 hover:bg-pink-500/20"
              >
                📸 Instagram Profile
              </a>
              <Link
                href={`/rankings?personId=${person.id}`}
                className="inline-flex items-center gap-2 rounded-xl btn-primary px-4 py-2 text-sm font-semibold text-white"
              >
                🏆 View Rankings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {analysis ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="glass space-y-5 rounded-2xl p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-white">AI-Extracted Profile Traits</h2>
            <Section title="Interests" items={analysis.interests} color="violet" />
            <Section title="Hobbies" items={analysis.hobbies} color="sky" />
            <Section title="Personality Traits" items={analysis.personality_traits} color="pink" />
            <Section title="Lifestyle" items={analysis.lifestyle} color="amber" />
            <Section title="Career Goals" items={analysis.career_goals} color="emerald" />
            <Section title="Social Preferences" items={analysis.social_preferences} color="violet" />
            <Section title="Relationship Preferences" items={analysis.relationship_preferences} color="rose" />
            <Section title="Education" items={analysis.education} color="slate" />
          </div>

          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                🤖 AI Agent Summary
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">{analysis.summary}</p>
              {agent && (
                <p className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Compatibility strategy:</span>{" "}
                  {agent.compatibilityStrategy}
                </p>
              )}
            </div>

            <div className="glass rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">Agent Analysis</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                This is an <span className="font-semibold text-white">AI-generated analysis</span>. The
                agent reviewed only publicly shared information (name, profession, location, and any public
                bio text the person provided) — never private data, logins, or scraped content. Source:{" "}
                <span className="font-semibold text-white">
                  {person.analysisSource === "gemini"
                    ? "Google Gemini (live AI call)"
                    : person.analysisSource === "demo-seed"
                      ? "Seeded demo dataset (deterministic)"
                      : "Deterministic fallback reasoning engine"}
                </span>
                . The agent weighs these traits — especially shared interests and hobbies — most heavily
                when evaluating compatibility with other agents.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 text-slate-300">
          No AI analysis available yet for this profile.
        </div>
      )}
    </div>
  );
}
