import { useState } from "react";
import { cn } from "@/lib/utils";
import { people, portraitUrl } from "@/lib/relay/people";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  const url = portraitUrl(name, size);
  const [failed, setFailed] = useState(false);
  const tone = palette[hash(name) % palette.length];

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={cn(
          "inline-block rounded-full object-cover",
          ring && "ring-1 ring-slate-200",
          className,
        )}
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }

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
    >
      {initials(name)}
    </span>
  );
}

export function AvatarWithTooltip({
  name,
  size = 22,
  active,
  ring = true,
}: {
  name: string;
  size?: number;
  active?: boolean;
  ring?: boolean;
}) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="relative inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label={name}
        >
          <AvatarInitials name={name} size={size} ring={ring} />
          {active ? (
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white"
            />
          ) : null}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="center"
        sideOffset={6}
        collisionPadding={8}
        className="bg-slate-900 text-[11px] text-white"
      >
        {name}
        {active ? " · online" : ""}
      </TooltipContent>
    </Tooltip>
  );
}

export function AvatarCluster({
  names,
  max = 3,
  size = 22,
  activeNames = [],
}: {
  names: string[];
  max?: number;
  size?: number;
  activeNames?: string[];
}) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  const activeSet = new Set(activeNames);
  return (
    <div className="flex items-center justify-center">
      <div className="flex -space-x-1.5">
        {shown.map((n, index) => {
          const active = activeSet.has(n);
          return (
            <span
              key={n}
              className="relative inline-flex"
              style={{ zIndex: active ? shown.length + 1 : shown.length - index }}
            >
              <AvatarWithTooltip name={n} size={size} active={active} />
            </span>
          );
        })}
      </div>
      {extra > 0 ? (
        <span
          className="ml-1 inline-flex items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600 ring-1 ring-white"
          style={{ width: size, height: size }}
          aria-label={`${extra} more people`}
        >
          +{extra}
        </span>
      ) : null}
    </div>
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const firstNameCounts = people.reduce<Record<string, number>>((counts, person) => {
  const first = person.name.split(" ")[0].toLowerCase();
  counts[first] = (counts[first] ?? 0) + 1;
  return counts;
}, {});
const personAliases = people.flatMap((person) => {
  const first = person.name.split(" ")[0];
  return firstNameCounts[first.toLowerCase()] === 1 ? [person.name, first] : [person.name];
});
const personNames = [...personAliases].sort((a, b) => b.length - a.length);
const canonicalPersonName = new Map(
  people.flatMap((person) => {
    const first = person.name.split(" ")[0];
    const aliases =
      firstNameCounts[first.toLowerCase()] === 1 ? [person.name, first] : [person.name];
    return aliases.map((alias) => [alias.toLowerCase(), person.name] as const);
  }),
);
const personNamePattern =
  personNames.length > 0 ? new RegExp(`(${personNames.map(escapeRegExp).join("|")})`, "gi") : null;

export function PersonMention({
  name,
  size = 16,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "mx-0.5 inline-flex align-baseline items-center gap-1 rounded-full bg-white px-1.5 py-0.5 text-[11px] font-semibold leading-none normal-case tracking-normal text-indigo-700 ring-1 ring-indigo-100",
        className,
      )}
    >
      <AvatarInitials name={name} size={size} />
      <span>{name}</span>
    </span>
  );
}

export function PersonMentionText({
  text,
  size = 16,
  className,
}: {
  text: string;
  size?: number;
  className?: string;
}) {
  if (!personNamePattern) return <>{text}</>;

  const parts = text.split(personNamePattern);
  return (
    <>
      {parts.map((part, index) => {
        const canonical = canonicalPersonName.get(part.toLowerCase());
        if (canonical) {
          return (
            <PersonMention
              key={`${canonical}-${index}`}
              name={canonical}
              size={size}
              className={className}
            />
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export { AvatarInitials as Avatar };
