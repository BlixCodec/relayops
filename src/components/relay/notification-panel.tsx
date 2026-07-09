import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Info,
  MessageSquareOff,
  X,
} from "lucide-react";
import { EmptyState, emptyStateIllustrations } from "@/components/relay/empty-state";
import { PersonMentionText } from "@/components/relay/avatar-initials";
import { useRelayStore } from "@/lib/relay/store";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/relay/types";

const iconFor: Record<
  Notification["kind"],
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  escalation: ArrowUpRight,
  decision: CheckCircle2,
  sla: AlertTriangle,
  summary: Info,
  customer_stub: MessageSquareOff,
};

const iconTone: Record<Notification["kind"], string> = {
  escalation: "text-amber-600",
  decision: "text-emerald-600",
  sla: "text-red-600",
  summary: "text-slate-500",
  customer_stub: "text-slate-500",
};

const railTone: Record<Notification["kind"], string> = {
  escalation: "border-amber-300",
  decision: "border-emerald-300",
  sla: "border-red-300",
  summary: "border-slate-200",
  customer_stub: "border-slate-200",
};

const dotTone: Record<Notification["kind"], string> = {
  escalation: "bg-amber-500",
  decision: "bg-emerald-500",
  sla: "bg-red-500",
  summary: "bg-slate-400",
  customer_stub: "bg-slate-400",
};

// Grouping order + labels. Kinds not listed here are dropped from grouping.
const groupSpec: Array<{ kind: Notification["kind"]; label: string }> = [
  { kind: "escalation", label: "Escalations awaiting decision" },
  { kind: "sla", label: "SLA at risk" },
  { kind: "decision", label: "Recent decisions" },
  { kind: "summary", label: "Daily summary" },
  { kind: "customer_stub", label: "Customer messages" },
];

function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function NotificationPopoverContent({ onNavigate }: { onNavigate?: () => void }) {
  const { notifications, markAllRead, markRead, openDrawer } = useRelayStore();

  const groups = groupSpec
    .map((g) => ({
      ...g,
      items: notifications.filter((n) => n.kind === g.kind),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex max-h-[560px] w-[380px] flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
        <div>
          <div className="text-[13px] font-semibold text-slate-900">Notifications</div>
          <div className="text-[11px] text-slate-500">
            {notifications.filter((n) => !n.read).length} unread · {groups.length}{" "}
            {groups.length === 1 ? "group" : "groups"}
          </div>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
        >
          Mark all read
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {notifications.length === 0 ? (
          <EmptyState
            framed={false}
            illustration={emptyStateIllustrations.noNotifications}
            artworkLabel="You're all caught up. New operational updates will appear here."
            className="px-2 py-8"
            imageClassName="max-w-[300px]"
          />
        ) : (
          <div className="space-y-1">
            {groups.map((g) => (
              <Group
                key={g.kind}
                kind={g.kind}
                label={g.label}
                items={g.items}
                onOpen={(id) => {
                  openDrawer(id);
                  onNavigate?.();
                }}
                onDismiss={markRead}
              />
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-slate-200 px-4 py-2 text-[11px] text-slate-400">
        Grouped by kind · realtime delivery is stubbed for this prototype.
      </footer>
    </div>
  );
}

function Group({
  kind,
  label,
  items,
  onOpen,
  onDismiss,
}: {
  kind: Notification["kind"];
  label: string;
  items: Notification[];
  onOpen: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const Icon = iconFor[kind];
  const unread = items.filter((n) => !n.read).length;
  const shown = expanded ? items : items.slice(0, 3);
  const overflow = items.length - shown.length;

  return (
    <section className="rounded-md">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-slate-50"
      >
        <Icon className={cn("h-3.5 w-3.5 shrink-0", iconTone[kind])} strokeWidth={2.25} />
        <span className="text-[12px] font-semibold text-slate-800">{label}</span>
        <span className="tnum text-[11px] text-slate-400">{items.length}</span>
        {unread > 0 ? (
          <span
            className={cn(
              "ml-auto inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white",
              dotTone[kind],
            )}
          >
            {unread} new
          </span>
        ) : null}
        <ChevronDown
          className={cn(
            "h-3 w-3 shrink-0 text-slate-400 transition-transform",
            !open && "-rotate-90",
            unread === 0 && "ml-auto",
          )}
        />
      </button>

      {open ? (
        <ul className={cn("ml-4 mt-0.5 space-y-0.5 border-l pl-3", railTone[kind])}>
          {shown.map((n) => (
            <li key={n.id} className="relative">
              {/* rail dot */}
              <span
                aria-hidden
                className={cn(
                  "absolute -left-[15px] top-3 h-1.5 w-1.5 rounded-full ring-2 ring-white",
                  dotTone[kind],
                  !n.read && "animate-pulse",
                )}
              />
              <div
                className={cn(
                  "group/notif relative flex gap-2 rounded-md px-2 py-2 transition-colors hover:bg-slate-50",
                  !n.read && "bg-indigo-50/40",
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (n.exceptionId) onOpen(n.exceptionId);
                    onDismiss(n.id);
                  }}
                  className="absolute inset-0 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-label="Open notification"
                />
                <div className="relative min-w-0 flex-1">
                  <p className="text-[12.5px] leading-6 text-slate-800">
                    <PersonMentionText text={n.message} />
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="tnum text-[11px] text-slate-500">{relative(n.at)}</span>
                    {n.exceptionId ? (
                      <span className="text-[11px] font-medium text-indigo-600">
                        {n.actionLabel} ›
                      </span>
                    ) : null}
                  </div>
                </div>
                {!n.read ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(n.id);
                    }}
                    aria-label="Dismiss"
                    className="relative shrink-0 self-start rounded p-1 text-slate-400 opacity-0 transition-opacity hover:bg-slate-200 hover:text-slate-700 group-hover/notif:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : null}
              </div>
            </li>
          ))}
          {overflow > 0 ? (
            <li>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="ml-1 py-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
              >
                Show {overflow} more
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </section>
  );
}
