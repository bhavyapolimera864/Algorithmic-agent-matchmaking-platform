const STYLES: Record<string, { className: string; emoji: string }> = {
  "Exceptional Match": { className: "bg-pink-500/20 text-pink-200 border-pink-400/40", emoji: "💞" },
  "Strong Match": { className: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40", emoji: "❤️" },
  "Promising Match": { className: "bg-sky-500/20 text-sky-200 border-sky-400/40", emoji: "🤝" },
  "Possible Match": { className: "bg-amber-500/20 text-amber-200 border-amber-400/40", emoji: "🔍" },
  "Low Compatibility": { className: "bg-slate-500/20 text-slate-300 border-slate-400/40", emoji: "〰️" },
};

export default function DecisionBadge({ decision }: { decision: string }) {
  const style = STYLES[decision] ?? STYLES["Possible Match"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${style.className}`}>
      <span>{style.emoji}</span>
      {decision}
    </span>
  );
}
