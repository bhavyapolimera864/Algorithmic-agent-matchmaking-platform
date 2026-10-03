export default function StatCard({
  label,
  value,
  icon,
  accent = "from-violet-500 to-indigo-500",
}: {
  label: string;
  value: string | number;
  icon: string;
  accent?: string;
}) {
  return (
    <div className="glass glass-hover rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-base`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
