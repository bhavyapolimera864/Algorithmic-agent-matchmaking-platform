"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Chip from "@/components/Chip";
import type { AnalysisSource, ProfileAnalysis } from "@/lib/types";

interface FormState {
  name: string;
  linkedinUrl: string;
  instagramUrl: string;
  profession: string;
  location: string;
  publicBio: string;
}

const EMPTY: FormState = {
  name: "",
  linkedinUrl: "",
  instagramUrl: "",
  profession: "",
  location: "",
  publicBio: "",
};

export default function AddPersonPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ analysis: ProfileAnalysis; source: AnalysisSource; note: string } | null>(
    null,
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setPreview(null);
  }

  async function handleAnalyze() {
    setError(null);
    setAnalyzing(true);
    setPreview(null);
    try {
      const res = await fetch("/api/analyze-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error while analyzing profile.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleAddPerson() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          analysisPreview: preview?.analysis,
          analysisPreviewSource: preview?.source,
          analysisPreviewNote: preview?.note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add person.");
      router.push(`/people/${data.person.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error while adding person.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Add Person</h1>
        <p className="mt-1 text-slate-400">
          Add a real public profile and let their AI agent extract interests, hobbies, and preferences.
        </p>
      </div>

      <div className="glass space-y-5 rounded-2xl p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Full Name *</label>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Jane Doe"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              LinkedIn Public Profile URL *
            </label>
            <input
              value={form.linkedinUrl}
              onChange={(e) => update("linkedinUrl", e.target.value)}
              placeholder="https://www.linkedin.com/in/jane-doe"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Instagram Public Profile URL *
            </label>
            <input
              value={form.instagramUrl}
              onChange={(e) => update("instagramUrl", e.target.value)}
              placeholder="https://www.instagram.com/janedoe"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Profession (optional)</label>
            <input
              value={form.profession}
              onChange={(e) => update("profession", e.target.value)}
              placeholder="Product Designer"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Location (optional)</label>
            <input
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="San Francisco, CA"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Public bio / headline text (optional)
          </label>
          <textarea
            value={form.publicBio}
            onChange={(e) => update("publicBio", e.target.value)}
            rows={3}
            placeholder="Paste any text you've copied from your own public LinkedIn headline or Instagram bio — this is never scraped automatically."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-500">
            Compliant by design: we only ever use public URLs and text you provide yourself. We never log
            in, scrape, or bypass privacy controls.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            ⚠️ {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !form.name || !form.linkedinUrl || !form.instagramUrl}
            className="rounded-xl border border-violet-400/40 bg-violet-500/10 px-5 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {analyzing ? "🤖 Analyzing Profile…" : "🔍 Analyze Profile"}
          </button>
          <button
            onClick={handleAddPerson}
            disabled={submitting || !form.name || !form.linkedinUrl || !form.instagramUrl}
            className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Adding…" : "✅ Add Person"}
          </button>
        </div>
      </div>

      {preview && (
        <div className="glass animate-fade-in-up space-y-4 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">AI Analysis Preview</h2>
            <Chip color={preview.source === "gemini" ? "emerald" : "slate"}>
              {preview.source === "gemini" ? "Live Gemini AI" : "Deterministic Fallback"}
            </Chip>
          </div>
          <p className="text-sm text-slate-400">{preview.note}</p>
          <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
            {preview.analysis.summary}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["Interests", preview.analysis.interests, "violet"],
                ["Hobbies", preview.analysis.hobbies, "sky"],
                ["Personality", preview.analysis.personality_traits, "pink"],
                ["Lifestyle", preview.analysis.lifestyle, "amber"],
              ] as const
            ).map(([title, items, color]) => (
              <div key={title}>
                <p className="mb-1 text-xs font-semibold uppercase text-slate-400">{title}</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item) => (
                    <Chip key={item} color={color}>
                      {item}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
