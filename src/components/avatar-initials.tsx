// Initials avatar (Lovable port, initials-only — no external portrait
// fetches). Tone is stable per name via a small hash.

import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const palette = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

export function AvatarInitials({
  name,
  size = 24,
  className,
  ring = true,
}: {
  name: string;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const tone = palette[hash(name) % palette.length];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium leading-none",
        tone,
        ring && "ring-1 ring-slate-200",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, Math.floor(size * 0.4)),
      }}
      aria-label={name}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
