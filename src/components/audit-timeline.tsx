// Activity tracker (Lovable port): audit events grouped into consecutive
// same-actor clusters — actor header, dashed rail, one card per event.
// Decision moments (escalated/approved/denied/resolved) get tinted highlight
// cards. Times stay absolute (HH:MM from the store) — honest, no parsing.
// The prototype's decorative bookmark/menu buttons are omitted (no fake UI).

import { ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditEntry } from "@/lib/types";

type HighlightKind = "resolved" | "approved" | "denied" | "escalated";

function highlightKind(entry: AuditEntry): HighlightKind | null {
  const a = entry.action.toLowerCase();
  if (a.includes("resolved") || a.includes("repair complete")) return "resolved";
  if (a.includes("approved")) return "approved";
  if (a.includes("denied")) return "denied";
  if (a.includes("escalated")) return "escalated";
  return null;
}

const highlightMap: Record<
  HighlightKind,
  {
    icon: React.ComponentType<{ className?: string }>;
    surface: string;
    text: string;
  }
> = {
  resolved: {
    icon: CheckCircle2,
    surface: "border-emerald-200/70 bg-emerald-50/70",
    text: "text-emerald-800",
  },
  approved: {
    icon: CheckCircle2,
    surface: "border-emerald-200/70 bg-emerald-50/70",
    text: "text-emerald-800",
  },
  denied: {
    icon: XCircle,
    surface: "border-red-200/70 bg-red-50/70",
    text: "text-red-800",
  },
  escalated: {
    icon: ArrowUpRight,
    surface: "border-amber-200/70 bg-amber-50/70",
    text: "text-amber-800",
  },
};

function actorInitials(actor: string): string {
  return actor
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Group consecutive events by actor so a run of actions reads as one cluster.
function groupByActor(entries: AuditEntry[]): AuditEntry[][] {
  const groups: AuditEntry[][] = [];
  for (const entry of entries) {
    const last = groups[groups.length - 1];
    if (last && last[0].actor === entry.actor) last.push(entry);
    else groups.push([entry]);
  }
  return groups;
}

function EventCard({ entry }: { entry: AuditEntry }) {
  const kind = highlightKind(entry);

  if (kind) {
    const cfg = highlightMap[kind];
    const Icon = cfg.icon;
    return (
      <div className={cn("rounded-xl border px-4 py-3 shadow-card", cfg.surface)}>
        <span className="tnum text-[11px] font-medium text-slate-500">
          {entry.time}
        </span>
        <div
          className={cn(
            "mt-1 flex items-start gap-2 text-[13px] leading-snug font-medium",
            cfg.text,
          )}
        >
          <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{entry.action}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white px-4 py-3 shadow-card ring-1 ring-slate-200/60">
      <span className="tnum text-[11px] font-medium text-slate-400">
        {entry.time}
      </span>
      <p className="mt-1 text-[13px] leading-relaxed text-slate-800">
        {entry.action}
      </p>
    </div>
  );
}

export function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
  const groups = groupByActor(entries);

  return (
    <ol className="space-y-5">
      {groups.map((group, gi) => (
        <li key={`${group[0].actor}-${gi}`} className="relative">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200/70"
            >
              {actorInitials(group[0].actor)}
            </span>
            <span className="text-[13px] leading-tight font-semibold text-slate-900">
              {group[0].actor}
            </span>
          </div>
          <div className="relative mt-2.5 pl-10">
            <span
              aria-hidden
              className="absolute top-0 bottom-0 left-[13px] border-l border-dashed border-slate-200"
            />
            <div className="space-y-2.5">
              {group.map((entry, i) => (
                <EventCard key={`${entry.time}-${i}`} entry={entry} />
              ))}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
