"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import Chip from "@/components/Chip";
import DecisionBadge from "@/components/DecisionBadge";
import type { CompatibilityBreakdown } from "@/lib/types";

interface PersonOption {
  id: number;
  name: string;
  profession: string;
  avatarSeed: string;
}

interface RankingItem {
  matchId: number;
  otherPersonId: number;
  otherPersonName: string;
  otherPersonProfession: string;
  otherAvatarSeed: string;
  score: number;
  breakdown: CompatibilityBreakdown;
  sharedInterests: string[];
  sharedHobbies: string[];
  reasons: string[];
  concerns: string[];
  decision: string;
}

const SORT_OPTIONS = [
  { value: "score", label: "Highest Compatibility" },
  { value: "interests", label: "Shared Interests" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "personality", label: "Personality" },
];

const MEDALS = ["🥇", "🥈", "🥉"];

export default function RankingsClient({
  people,
  initialPersonId,
}: {
  people: PersonOption[];
  initialPersonId: number | null;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(initialPersonId ?? people[0]?.id ?? null);
  const [sortBy, setSortBy] = useState("score");
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/rankings/${selectedId}?sortBy=${sortBy}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load rankings.");
        setRankings(data.rankings);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Network error."))
      .finally(() => setLoading(false));
  }, [selectedId, sortBy]);

  const filteredPeople = people.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  const selectedPerson = people.find((p) => p.id === selectedId);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="glass h-fit rounded-2xl p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people…"
          className="mb-3 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
        />
        <div className="max-h-[32rem] space-y-1 overflow-y-auto scrollbar-thin pr-1">
          {filteredPeople.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
                p.id === selectedId ? "bg-violet-500/20 ring-1 ring-violet-400/50" : "hover:bg-white/5"
              }`}
            >
              <Avatar seed={p.avatarSeed} size={32} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{p.name}</p>
                <p className="truncate text-xs text-slate-500">{p.profession}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-white">
            {selectedPerson ? `${selectedPerson.name}'s Matches` : "Select a person"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  sortBy === opt.value
                    ? "border-violet-400/60 bg-violet-500/20 text-violet-100"
                    : "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            ⚠️ {error}
          </div>
        )}

        {loading && <p className="text-sm text-slate-400">Loading rankings…</p>}

        {!loading && rankings.length === 0 && !error && (
          <div className="glass rounded-2xl p-8 text-center text-slate-400">
            No matches yet for this person. Go to{" "}
            <Link href="/dating" className="text-violet-300 underline">
              Agent Dating
            </Link>{" "}
            and click Run Agent Dating first.
          </div>
        )}

        <div className="space-y-3">
          {rankings.map((r, idx) => (
            <div key={r.matchId} className="glass glass-hover rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{MEDALS[idx] ?? `#${idx + 1}`}</span>
                  <Avatar seed={r.otherAvatarSeed} size={44} />
                  <div>
                    <p className="font-semibold text-white">{r.otherPersonName}</p>
                    <p className="text-xs text-slate-500">{r.otherPersonProfession}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-extrabold text-gradient">{r.score}%</p>
                  <DecisionBadge decision={r.decision} />
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-300">{r.reasons[0]}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.sharedInterests.slice(0, 4).map((i) => (
                  <Chip key={i} color="violet">
                    {i}
                  </Chip>
                ))}
                {r.concerns.slice(0, 1).map((c) => (
                  <Chip key={c} color="rose">
                    ⚠ {c}
                  </Chip>
                ))}
              </div>

              <Link
                href={`/matches/${r.matchId}`}
                className="mt-4 inline-block rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                View Match →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
