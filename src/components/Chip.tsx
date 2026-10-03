const PALETTES: Record<string, string> = {
  violet: "bg-violet-500/15 text-violet-200 border-violet-400/30",
  sky: "bg-sky-500/15 text-sky-200 border-sky-400/30",
  pink: "bg-pink-500/15 text-pink-200 border-pink-400/30",
  amber: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  emerald: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  rose: "bg-rose-500/15 text-rose-200 border-rose-400/30",
  slate: "bg-white/5 text-slate-300 border-white/15",
};

export default function Chip({
  children,
  color = "violet",
}: {
  children: React.ReactNode;
  color?: keyof typeof PALETTES;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${PALETTES[color]}`}
    >
      {children}
    </span>
  );
}
