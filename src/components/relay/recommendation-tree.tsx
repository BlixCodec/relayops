import {
  Building2,
  Check,
  CircleDollarSign,
  CircleDot,
  Clock,
  Fan,
  FileText,
  Gauge,
  History,
  Package,
  Pill,
  Sparkles,
  Thermometer,
  Timer,
  TimerOff,
  Truck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { recommendationTree } from "@/lib/relay/recommendation-tree";
import { useNow } from "@/lib/relay/use-now";
import { AvatarInitials, PersonMentionText } from "./avatar-initials";
import { cn } from "@/lib/utils";
import type { Exception } from "@/lib/relay/types";
import type { TreeItem } from "@/lib/relay/recommendation-tree";

const connectedLineClass =
  "relative flex items-start gap-2 pl-4 before:absolute before:left-0 before:top-[9px] before:h-px before:w-2.5 before:border-t before:border-dashed before:border-slate-300/80";
const connectedCenterLineClass =
  "relative flex items-center gap-2 pl-4 before:absolute before:left-0 before:top-1/2 before:h-px before:w-2.5 before:-translate-y-1/2 before:border-t before:border-dashed before:border-slate-300/80";

// Keyword → glyph so each reasoning line reads at a glance (reference style).
const iconRules: Array<{ match: RegExp; icon: LucideIcon }> = [
  { match: /temperature|°f|cooler|cold|climbed/i, icon: Thermometer },
  { match: /compressor|cycling|fan|unit/i, icon: Fan },
  { match: /inventory|stock|parts|loaner/i, icon: Package },
  { match: /pharmacy|medication|patient/i, icon: Pill },
  { match: /dock|truck|leveler|freight/i, icon: Truck },
  { match: /boiler|pressure|alarm/i, icon: Gauge },
  { match: /elevator|inspection|tenant|property/i, icon: Building2 },
  { match: /generator|power|electric/i, icon: Zap },
  { match: /\$|revenue|cost|credit/i, icon: CircleDollarSign },
  { match: /visits|callback|history|account|quarter/i, icon: History },
  { match: /contract|renewal|compliance/i, icon: FileText },
];

function iconFor(text: string): LucideIcon {
  for (const r of iconRules) if (r.match.test(text)) return r.icon;
  return CircleDot;
}

function liveAgo(dueAt: string, now: number): string {
  const nowMs = now === 0 ? new Date(dueAt).getTime() : now;
  const abs = Math.abs(nowMs - new Date(dueAt).getTime());
  const totalSec = Math.floor(abs / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${String(m % 60).padStart(2, "0")}m`;
  }
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

/**
 * RecommendationTree — the RelayOps signature. Issue → Impact → Timeline →
 * Recommended, connected by a subtle dashed rail, so the reasoning behind the
 * recommended next action reads left to right at a glance.
 */
export function RecommendationTree({
  exception,
  className,
}: {
  exception: Exception;
  className?: string;
}) {
  const tree = recommendationTree(exception);
  const now = useNow();
  const breached = new Date(exception.slaDueAt).getTime() - (now || Date.now()) < 0;

  return (
    <section
      className={cn(
        "rounded-xl border border-violet-100 bg-violet-50/35 px-4 py-3.5 shadow-[0_1px_2px_rgba(79,70,229,0.04)] sm:px-5",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-violet-600">
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
        Recommended action
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-[14px] font-semibold leading-snug tracking-tight text-slate-900">
          <PersonMentionText text={tree.action} />
        </span>
        <span className="rounded-full border border-violet-200/70 bg-white px-2 py-0.5 text-[10px] font-medium text-violet-700">
          AI suggestion
        </span>
      </div>

      {/* Dashed connector + columns */}
      <div className="relative mt-4 border-t border-dashed border-slate-300/80 pt-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-4">
          <Column label="Issue">
            {tree.issue.map((item) => (
              <Line key={item.text} item={item} />
            ))}
          </Column>

          <Column label="Impact">
            {tree.impact.map((item) => (
              <Line key={item.text} item={item} />
            ))}
          </Column>

          <Column label="Timeline">
            <li className={connectedLineClass}>
              {breached ? (
                <TimerOff
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500"
                  strokeWidth={2}
                  aria-hidden
                />
              ) : (
                <Clock
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
                  strokeWidth={2}
                  aria-hidden
                />
              )}
              <span className="min-w-0 text-[12px] leading-snug text-slate-700">
                {breached ? "SLA breached" : "Time to SLA"}
                <span
                  className={cn(
                    "tnum block font-semibold",
                    breached ? "text-red-600" : "text-slate-800",
                  )}
                  suppressHydrationWarning
                >
                  {liveAgo(exception.slaDueAt, now)}
                  {breached ? " ago" : ""}
                </span>
              </span>
            </li>
            {tree.timeline.slice(1).map((item) => (
              <li key={item.text} className={connectedLineClass}>
                <Clock
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="min-w-0 text-[12px] leading-snug text-slate-700">
                  {item.text}
                  {item.sub ? (
                    <span className="tnum block text-slate-500" suppressHydrationWarning>
                      {item.sub}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </Column>

          <Column label="Recommended">
            {tree.tech ? (
              <>
                <li className={connectedCenterLineClass}>
                  <AvatarInitials name={tree.tech.name} size={22} />
                  <span className="text-[12.5px] font-semibold text-slate-900">
                    {tree.tech.name}
                  </span>
                </li>
                <li className={connectedLineClass}>
                  <Timer
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="tnum text-[12px] leading-snug text-slate-700">
                    {tree.tech.minutesAway} min away
                  </span>
                </li>
                <li className={connectedLineClass}>
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  <span className="text-[12px] leading-snug text-slate-700">
                    {tree.tech.certifications[0]} certified
                  </span>
                </li>
              </>
            ) : (
              tree.recommendedFallback.map((item) => (
                <li key={item.text} className={connectedLineClass}>
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  <span className="text-[12px] leading-snug text-slate-700">{item.text}</span>
                </li>
              ))
            )}
          </Column>
        </div>
      </div>
    </section>
  );
}

function Column({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* dashed drop from the horizontal rail into the column */}
      <span
        aria-hidden
        className="absolute -top-3 left-1.5 h-3 border-l border-dashed border-slate-300/80"
      />
      <h4 className="text-[12px] font-medium text-slate-800">{label}</h4>
      <ul className="relative mt-2 space-y-2 pl-1 before:absolute before:left-1 before:bottom-1 before:top-1 before:border-l before:border-dashed before:border-slate-300/80">
        {children}
      </ul>
    </div>
  );
}

function Line({ item }: { item: TreeItem }) {
  const Icon = iconFor(item.text);
  return (
    <li className={connectedLineClass}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
      <span className="min-w-0 text-[12px] leading-snug text-slate-700">
        {item.text}
        {item.sub ? <span className="tnum block text-slate-500">{item.sub}</span> : null}
      </span>
    </li>
  );
}
