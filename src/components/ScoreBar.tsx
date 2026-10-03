export default function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 80 ? "from-emerald-400 to-teal-400" : value >= 55 ? "from-violet-400 to-indigo-400" : "from-amber-400 to-rose-400";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-300">{label}</span>
        <span className="font-semibold text-white">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
