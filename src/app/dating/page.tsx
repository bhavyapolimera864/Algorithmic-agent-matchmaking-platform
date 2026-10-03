"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import DecisionBadge from "@/components/DecisionBadge";
import type { MatchHighlight } from "@/lib/types";

const STEPS = [
  "Reading profile…",
  "Analyzing compatibility…",
  "Talking to the other agent…",
  "Comparing interests…",
  "Evaluating lifestyle…",
  "Finalizing match decision…",
];

interface RunResult {
  highlights: MatchHighlight[];
  totalPairs: number;
  totalMatches: number;
  totalPeople: number;
  topMatch: { personAName: string; personBName: string; score: number } | null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function AgentDatingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [playing, setPlaying] = useState(false);
  const [activePairIdx, setActivePairIdx] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [feed, setFeed] = useState<string[]>([]);
  const [resolvedPairs, setResolvedPairs] = useState<MatchHighlight[]>([]);
  const skipRef = useRef(false);

  async function playAnimation(highlights: MatchHighlight[]) {
    skipRef.current = false;
    setPlaying(true);
    setFeed([]);
    setResolvedPairs([]);
    const toPlay = highlights.slice(0, 8);

    for (let i = 0; i < toPlay.length; i++) {
      if (skipRef.current) break;
      const h = toPlay[i];
      setActivePairIdx(i);
      const firstA = h.personAName.split(" ")[0];
      const firstB = h.personBName.split(" ")[0];

      for (let s = 0; s < STEPS.length; s++) {
        if (skipRef.current) break;
        setActiveStep(s);
        const label =
          s === 2 ? `Talking to Agent ${firstB}…` : STEPS[s];
        setFeed((f) => [...f, `🤖 Agent ${firstA}: ${label}`]);
        await sleep(260);
      }

      if (skipRef.current) break;
      setFeed((f) => [
        ...f,
        h.sharedInterests.length > 0
          ? `✨ Shared interest detected: ${h.sharedInterests[0]}`
          : `🔎 No major shared interest found — checking lifestyle & personality.`,
        `📊 Compatibility calculated: ${h.score}% — ${h.decision}`,
      ]);
      setResolvedPairs((p) => [...p, h]);
      await sleep(350);
    }

    if (skipRef.current) {
      setResolvedPairs(highlights.slice(0, 8));
    }
    setPlaying(false);
  }

  async function handleRun() {
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/dating/run", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Agent dating run failed.");
      setResult(data);
      await playAnimation(data.highlights);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error while running agent dating.");
    } finally {
      setLoading(false);
    }
  }

  function handleSkip() {
    skipRef.current = true;
  }

  const currentPair = result?.highlights?.[activePairIdx];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Agent Dating</h1>
          <p className="mt-1 text-slate-400">
            Every agent evaluates every other agent using real shared interests, hobbies, lifestyle,
            career and personality signals — watch the process live.
          </p>
        </div>
        <div className="flex gap-3">
          {playing && (
            <button
              onClick={handleSkip}
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Skip Animation
            </button>
          )}
          <button
            onClick={handleRun}
            disabled={loading}
            className="btn-primary animate-pulse-glow rounded-xl px-6 py-3 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && !playing ? "🤖 Waking up agents…" : "⚡ RUN AGENT DATING"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          ⚠️ {error}
        </div>
      )}

      {(playing || currentPair) && (
        <div className="glass rounded-3xl p-8">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
            Live Agent Negotiation
          </p>
          {currentPair && (
            <div className="mt-6 flex items-center justify-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-3xl ${playing ? "animate-pulse-glow" : ""}`}>
                  🤖
                </div>
                <p className="text-sm font-semibold text-white">Agent {currentPair.personAName.split(" ")[0]}</p>
              </div>

              <div className="flex flex-1 max-w-xs flex-col items-center gap-2">
                <svg width="100%" height="24" viewBox="0 0 200 24" className="text-violet-400">
                  <line x1="0" y1="12" x2="200" y2="12" stroke="currentColor" strokeWidth="2" className={playing ? "animate-dash-flow" : ""} />
                </svg>
                <p className="min-h-[2.5rem] text-center text-sm font-medium text-violet-200">
                  {playing ? STEPS[activeStep] : `Match decision: ${currentPair.score}%`}
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-3xl ${playing ? "animate-pulse-glow" : ""}`}>
                  🤖
                </div>
                <p className="text-sm font-semibold text-white">Agent {currentPair.personBName.split(" ")[0]}</p>
              </div>
            </div>
          )}

          {!playing && currentPair && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-4xl">{currentPair.score >= 70 ? "❤️" : currentPair.score >= 40 ? "🤝" : "🔍"}</p>
              <DecisionBadge decision={currentPair.decision} />
            </div>
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Activity Feed
              </p>
              <div className="h-64 space-y-1.5 overflow-y-auto scrollbar-thin rounded-xl border border-white/10 bg-black/30 p-3">
                {feed.map((line, idx) => (
                  <p key={idx} className="animate-fade-in-up text-xs text-slate-300">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Resolved Pairs
              </p>
              <div className="h-64 space-y-2 overflow-y-auto scrollbar-thin pr-1">
                {resolvedPairs.map((h, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-white">
                      {h.personAName} × {h.personBName}
                    </span>
                    <span className="font-bold text-violet-300">{h.score}%</span>
                  </div>
                ))}
                {resolvedPairs.length === 0 && (
                  <p className="text-xs text-slate-500">Resolved pairs will appear here as agents finish talking.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {result && !playing && (
        <div className="glass animate-fade-in-up rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Dating Session Complete 🎉</h2>
              <p className="mt-1 text-sm text-slate-400">
                Evaluated <span className="font-semibold text-white">{result.totalPairs}</span> agent pairs
                across <span className="font-semibold text-white">{result.totalPeople}</span> people and
                generated <span className="font-semibold text-white">{result.totalMatches}</span> strong
                matches.
              </p>
              {result.topMatch && (
                <p className="mt-2 text-sm text-violet-300">
                  🏆 Top match: {result.topMatch.personAName} × {result.topMatch.personBName} —{" "}
                  {result.topMatch.score}%
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Link href="/rankings" className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold text-white">
                View Rankings
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="glass rounded-2xl p-10 text-center text-slate-400">
          <p className="text-5xl">🤖❤️🤖</p>
          <p className="mt-4">
            Click <span className="font-semibold text-violet-300">RUN AGENT DATING</span> to have every
            agent evaluate every other agent and generate fresh, explainable compatibility scores.
          </p>
        </div>
      )}
    </div>
  );
}
