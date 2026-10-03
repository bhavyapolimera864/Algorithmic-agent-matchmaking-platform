export default function Avatar({
  seed,
  size = 56,
  className = "",
}: {
  seed: string;
  size?: number;
  className?: string;
}) {
  const src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&backgroundColor=4c1d95,1e1b4b,0ea5e9`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      width={size}
      height={size}
      alt="Agent-generated avatar"
      className={`rounded-full border border-white/15 bg-white/5 ${className}`}
    />
  );
}
