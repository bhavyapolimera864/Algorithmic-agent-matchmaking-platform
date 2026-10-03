"use client";

import { useMemo, useState } from "react";
import PersonCard, { type PersonCardData } from "@/components/PersonCard";

export default function PeopleGridClient({ people }: { people: PersonCardData[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.profession.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        (p.analysis?.interests ?? []).some((i) => i.toLowerCase().includes(q)),
    );
  }, [people, query]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, profession, location, or interest…"
          className="w-full max-w-md rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
        />
        <span className="text-sm text-slate-400">{filtered.length} people</span>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <PersonCard key={p.id} person={p} />
        ))}
      </div>
    </div>
  );
}
