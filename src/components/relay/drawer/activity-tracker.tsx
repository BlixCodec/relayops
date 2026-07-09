import { ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";
import { AvatarInitials, PersonMentionText } from "../avatar-initials";
import { BrandMark } from "../brand-logo";
import { EmptyState, emptyStateIllustrations } from "../empty-state";
import { roleFor } from "@/lib/relay/people";
import { useNow } from "@/lib/relay/use-now";
import type { AuditEvent } from "@/lib/relay/types";
import { cn } from "@/lib/utils";

function relative(iso: string, now: number) {
  const nowMs = now === 0 ? new Date(iso).getTime() : now;
  const diff = nowMs - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

type HighlightKind = "resolved" | "approved" | "denied" | "escalated";

function highlightKind(e: AuditEvent): HighlightKind | null {
  const a = e.action.toLowerCase();
  if (a.includes("resolved")) return "resolved";
  if (a.includes("approved")) return "approved";
  if (a.includes("denied")) return "denied";
  if (a.includes("escalated")) return "escalated";
  return null;
}

const highlightMap: Record<
  HighlightKind,
  {
    icon: React.ComponentType<{ className?: string }>;
    bg: string;
    border: string;
    text: string;
    label: string;
  }
> = {
  resolved: {
    icon: CheckCircle2,
    bg: "bg-emerald-50/70",
    border: "border-emerald-200/70",
    text: "text-emerald-800",
    label: "Marked resolved",
  },
  approved: {
    icon: CheckCircle2,
    bg: "bg-emerald-50/70",
    border: "border-emerald-200/70",
    text: "text-emerald-800",
    label: "Escalation approved",
  },
  denied: {
    icon: XCircle,
    bg: "bg-red-50/70",
    border: "border-red-200/70",
    text: "text-red-800",
    label: "Escalation denied",
  },
  escalated: {
    icon: ArrowUpRight,
    bg: "bg-amber-50/70",
    border: "border-amber-200/70",
    text: "text-amber-800",
    label: "Escalated to Regional Operations",
  },
};

// Group consecutive events by actor.
function groupByActor(events: AuditEvent[]): AuditEvent[][] {
  const groups: AuditEvent[][] = [];
  for (const e of events) {
    const last = groups[groups.length - 1];
    if (last && last[0].actor === e.actor) last.push(e);
    else groups.push([e]);
  }
  return groups;
}

function ActorMark({ name }: { name: string }) {
  if (name.toLowerCase() === "system") {
    return (
      <span
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-slate-200"
        aria-label="RelayOps system"
      >
        <BrandMark className="h-5 w-5" />
      </span>
    );
  }

  return <AvatarInitials name={name} size={36} className="shadow-sm" />;
}

function EventCard({ e, now }: { e: AuditEvent; now: number }) {
  const hi = highlightKind(e);

  if (hi) {
    const cfg = highlightMap[hi];
    const Icon = cfg.icon;
    return (
      <div className={cn("rounded-xl border px-4 py-3 shadow-card", cfg.bg, cfg.border)}>
        <div className="flex items-center">
          <span className="tnum text-[11px] font-medium text-slate-500">{relative(e.at, now)}</span>
        </div>
        <div className={cn("mt-1.5 flex items-center gap-2 text-[13px] font-medium", cfg.text)}>
          <Icon className="h-4 w-4 shrink-0" />
          <span>
            {cfg.label}: <PersonMentionText text={e.action} />
          </span>
        </div>
        {e.note ? (
          <p className={cn("mt-1.5 text-[12px] italic leading-6", cfg.text, "opacity-90")}>
            "<PersonMentionText text={e.note} />"
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white px-4 py-3 shadow-card ring-1 ring-slate-200/60">
      <div className="flex items-center">
        <span className="tnum text-[11px] font-medium text-slate-400">{relative(e.at, now)}</span>
      </div>
      <p className="mt-1.5 text-[13px] leading-6 text-slate-800">
        <PersonMentionText text={e.action} />
      </p>
      {e.note ? (
        <p className="mt-1.5 text-[12px] leading-6 text-slate-600">
          <PersonMentionText text={e.note} />
        </p>
      ) : null}
    </div>
  );
}

export function ActivityTracker({ events }: { events: AuditEvent[] }) {
  const now = useNow();
  const groups = groupByActor(events);

  if (events.length === 0) {
    return (
      <EmptyState
        framed={false}
        illustration={emptyStateIllustrations.noActivity}
        artworkLabel="No operational history has been recorded yet. Actions taken on this exception will appear here."
        className="py-6"
        imageClassName="max-w-[420px]"
      />
    );
  }

  return (
    <ol
      className="relative space-y-6 rounded-2xl border border-slate-200/60 bg-slate-50/70 p-3"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(71, 85, 105, 0.16) 1px, transparent 0)",
        backgroundSize: "18px 18px",
      }}
    >
      {groups.map((group, gi) => {
        const head = group[0];
        const role = roleFor(head.actor);
        return (
          <li key={gi} className="relative">
            <div className="flex items-center gap-2.5">
              <ActorMark name={head.actor} />
              <div className="min-w-0">
                <div className="text-[13px] font-semibold leading-tight text-slate-900">
                  {head.actor}
                </div>
                {role ? (
                  <div className="text-[11px] leading-tight text-slate-400">{role}</div>
                ) : null}
              </div>
            </div>

            {/* Dashed vertical rail + cards */}
            <div className="relative mt-3 pl-11">
              <span
                aria-hidden
                className="absolute left-[15px] top-0 bottom-0 border-l border-dashed border-slate-200"
              />
              <div className="space-y-3">
                {group.map((e) => (
                  <EventCard key={e.id} e={e} now={now} />
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
