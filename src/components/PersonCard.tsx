import Link from "next/link";
import Avatar from "@/components/Avatar";
import Chip from "@/components/Chip";
import type { ProfileAnalysis } from "@/lib/types";

export interface PersonCardData {
  id: number;
  name: string;
  profession: string;
  location: string;
  avatarSeed: string;
  analysis: ProfileAnalysis | null;
  agentId?: number | null;
  agentStatus?: string | null;
  isDemo?: boolean;
}

export default function PersonCard({ person }: { person: PersonCardData }) {
  const interests = person.analysis?.interests?.slice(0, 3) ?? [];
  const hobbies = person.analysis?.hobbies?.slice(0, 2) ?? [];

  return (
    <div className="glass glass-hover flex flex-col rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <Avatar seed={person.avatarSeed} size={56} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-white">{person.name}</p>
          <p className="truncate text-sm text-slate-400">{person.profession || "Profession unknown"}</p>
          <p className="truncate text-xs text-slate-500">📍 {person.location || "Unknown"}</p>
        </div>
        {person.isDemo ? <Chip color="slate">Demo</Chip> : <Chip color="emerald">Live</Chip>}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {interests.map((i) => (
          <Chip key={`i-${i}`} color="violet">
            {i}
          </Chip>
        ))}
        {hobbies.map((h) => (
          <Chip key={`h-${h}`} color="sky">
            {h}
          </Chip>
        ))}
        {interests.length === 0 && hobbies.length === 0 && (
          <span className="text-xs text-slate-500">No analysis yet</span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 text-slate-400">
          <span
            className={`h-2 w-2 rounded-full ${person.agentId ? "bg-emerald-400" : "bg-slate-500"}`}
          />
          Agent {person.agentId ? (person.agentStatus ?? "ready") : "not created"}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href={`/people/${person.id}`}
          className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-white/10"
        >
          View Profile
        </Link>
        <Link
          href={`/dating`}
          className="flex-1 rounded-xl btn-primary px-3 py-2 text-center text-sm font-semibold text-white"
        >
          Start Dating
        </Link>
      </div>
    </div>
  );
}
