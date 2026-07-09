import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CircleAlert,
  ClipboardList,
  Inbox,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { useRelayStore, branchById, techById } from "@/lib/relay/store";
import { branches } from "@/lib/relay/seed";
import { SlaCountdown, slaBucket, slaTone } from "@/components/relay/sla-countdown";
import { StatusDot } from "@/components/relay/status-pill";
import { PriorityBadge } from "@/components/relay/priority-badge";
import { AvatarInitials, PersonMentionText } from "@/components/relay/avatar-initials";
import { FacilityPhoto } from "@/components/relay/location-badge";
import { RecommendationTree } from "@/components/relay/recommendation-tree";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Exception } from "@/lib/relay/types";

export const Route = createFileRoute("/_app/dispatcher/today")({
  component: DispatcherToday,
});

function computeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function useGreeting() {
  const [g, setG] = useState("Hello");
  useEffect(() => {
    setG(computeGreeting());
  }, []);
  return g;
}

function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function DispatcherToday() {
  const { exceptions, currentUser, activeBranchId, openDrawer } = useRelayStore();
  const firstName = currentUser.dispatcher.split(" ")[0];
  const branch = branchById(activeBranchId);
  const greeting = useGreeting();

  const active = exceptions.filter((e) => e.status !== "resolved");
  const branchActive = active.filter((e) => e.branchId === activeBranchId);
  const critical = branchActive.filter((e) => e.priority === "critical");
  const escalated = active.filter((e) => e.status === "escalated");
  const mine = active.filter((e) => e.ownerDispatcher === currentUser.dispatcher);
  const approachingSla = branchActive.filter((e) => {
    const t = slaTone(e.slaDueAt);
    return t === "warning" || t === "critical" || t === "breached";
  }).length;
  const assignedCount = active.filter(
    (e) => e.status === "assigned" && e.ownerDispatcher === currentUser.dispatcher,
  ).length;
  const queueBuckets = useMemo(
    () => ({
      overdue: branchActive.filter((e) => slaBucket(e.slaDueAt) === "overdue").length,
      under60: branchActive.filter((e) => slaBucket(e.slaDueAt) === "under60").length,
      today: branchActive.filter((e) => slaBucket(e.slaDueAt) === "today").length,
    }),
    [branchActive],
  );

  const primary = useMemo(() => {
    const rank = { critical: 0, high: 1, medium: 2 } as const;
    return [...branchActive].sort(
      (a, b) =>
        rank[a.priority] - rank[b.priority] ||
        new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime(),
    )[0];
  }, [branchActive]);

  const recentActivity = useMemo(() => {
    const all = branchActive.flatMap((e) =>
      e.audit.map((a) => ({ ...a, customer: e.customer, exceptionId: e.id })),
    );
    return all.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 6);
  }, [branchActive]);

  const sub =
    critical.length > 0
      ? `${branch?.name ?? "Your branch"} needs attention in ${critical.length} place${critical.length === 1 ? "" : "s"}.`
      : `${branch?.name ?? "Your branch"} is holding steady. Review anything close to SLA first.`;

  return (
    <div className="w-full max-w-none space-y-4 px-4 py-4 sm:space-y-5 sm:px-8 sm:py-6">
      <section className="-mx-4 border-b border-slate-200/70 bg-slate-50/80 px-4 py-2.5 sm:-mx-8 sm:px-8 sm:py-3">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="min-w-0 shrink-0 lg:w-[280px]">
            <h1
              className="truncate text-[20px] font-semibold leading-tight tracking-tight text-slate-900"
              suppressHydrationWarning
            >
              {greeting}, {firstName}.
            </h1>
            <p className="mt-0.5 truncate text-[12.5px] text-slate-500">{sub}</p>
          </div>
          <div className="-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
            <StatChip
              icon={CircleAlert}
              tone="critical"
              value={critical.length}
              label="Critical"
              detail={`${critical.length} critical exception${critical.length === 1 ? "" : "s"} at ${branch?.name ?? "this branch"}.`}
            />
            <StatChip
              icon={Timer}
              tone="warning"
              value={approachingSla}
              label="Under 60"
              detail={`${queueBuckets.overdue} overdue and ${queueBuckets.under60} due inside 60 minutes.`}
            />
            <StatChip
              icon={ClipboardList}
              tone="neutral"
              value={assignedCount}
              label="Assigned"
              detail={`${assignedCount} assignment${assignedCount === 1 ? "" : "s"} currently owned by ${currentUser.dispatcher}.`}
            />
            <StatChip
              icon={Inbox}
              tone="neutral"
              value={escalated.length}
              label="Escalated"
              detail={`${escalated.length} escalation${escalated.length === 1 ? "" : "s"} waiting on Regional Operations.`}
            />
          </div>
          <div className="hidden shrink-0 sm:block lg:ml-auto">
            <QueuePulse
              overdue={queueBuckets.overdue}
              under60={queueBuckets.under60}
              today={queueBuckets.today}
              active={branchActive.length}
            />
          </div>
        </div>
      </section>

      {primary ? <PrimaryCard ex={primary} onOpen={() => openDrawer(primary.id)} /> : null}

      <Section title="Waiting on Regional Operations" count={escalated.length}>
        {escalated.length === 0 ? (
          <EmptyRow message="No escalations awaiting a decision." />
        ) : (
          <div className="divide-y divide-slate-100">
            {escalated.map((e) => (
              <MiniRow key={e.id} ex={e} onOpen={() => openDrawer(e.id)} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Your active assignments" count={mine.length}>
        {mine.length === 0 ? (
          <EmptyRow message="No active assignments under your name." />
        ) : (
          <div className="divide-y divide-slate-100">
            {mine.slice(0, 4).map((e) => (
              <MiniRow key={e.id} ex={e} onOpen={() => openDrawer(e.id)} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Recent activity" count={recentActivity.length}>
        {recentActivity.length === 0 ? (
          <EmptyRow message="No branch activity in the last few hours." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentActivity.map((a) => (
              <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                <span className="relative mt-0.5 flex h-8 w-10 shrink-0 items-center">
                  {a.actorRole === "system" ? (
                    <FacilityPhoto name={a.customer} size={30} className="rounded-full" />
                  ) : (
                    <AvatarInitials name={a.actor} size={30} />
                  )}
                  <FacilityPhoto
                    name={a.customer}
                    size={18}
                    className="absolute -bottom-1 -right-0.5 rounded-full ring-2 ring-white"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] text-slate-800">
                    <span className="font-medium">{a.actor}</span>
                    <span className="text-slate-500">
                      <PersonMentionText text={a.action.toLowerCase()} />
                    </span>
                    <button
                      type="button"
                      onClick={() => openDrawer(a.exceptionId)}
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      {a.customer}
                    </button>
                  </div>
                  {a.note ? (
                    <div className="mt-0.5 line-clamp-1 text-[12px] leading-6 text-slate-500">
                      <PersonMentionText text={a.note} />
                    </div>
                  ) : null}
                </div>
                <span
                  className="tnum shrink-0 pt-1 text-[11px] text-slate-400"
                  suppressHydrationWarning
                >
                  {relative(a.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function PrimaryCard({ ex, onOpen }: { ex: Exception; onOpen: () => void }) {
  const branch = branchById(ex.branchId);
  const tone = slaTone(ex.slaDueAt);
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-card sm:p-6",
        tone === "breached" || tone === "critical" ? "border-red-200" : "border-slate-200",
      )}
    >
      <div className="flex items-start gap-3">
        <FacilityPhoto name={ex.customer} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
              Start here
            </span>
            <PriorityBadge priority={ex.priority} />
            <span className="tnum text-[11px] text-slate-400">{ex.id}</span>
          </div>
          <h2 className="mt-2 text-[18px] font-semibold leading-tight text-slate-900">
            {ex.customer}
          </h2>
          <p className="mt-1.5 text-[13px] leading-5 text-slate-600">{ex.issue}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-slate-600">
        <SlaCountdown dueAt={ex.slaDueAt} />
        <span>{branch?.name ?? "·"}</span>
        <span className="tnum">${ex.revenueAtRisk.toLocaleString()} at risk</span>
      </div>

      <div className="mt-4">
        <RecommendationTree exception={ex} />
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Open details
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function StatChip({
  icon: Icon,
  tone,
  value,
  label,
  detail,
}: {
  icon: LucideIcon;
  tone: "critical" | "warning" | "neutral";
  value: number;
  label: string;
  detail: string;
}) {
  const toneClass =
    tone === "critical" ? "text-red-600" : tone === "warning" ? "text-amber-600" : "text-slate-500";
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="flex min-w-[132px] items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1.5 text-left shadow-card transition-colors hover:border-slate-300 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:min-w-0"
          aria-label={`${label}: ${detail}`}
        >
          <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center", toneClass)}>
            <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
          </span>
          <div className="flex min-w-0 items-baseline gap-1.5">
            <span className="tnum text-[13px] font-semibold leading-none text-slate-900">
              {value}
            </span>
            <span className="truncate text-[10.5px] leading-tight text-slate-500 sm:text-[11px]">
              {label}
            </span>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="max-w-56 bg-white text-slate-700 shadow-lg ring-1 ring-slate-200"
      >
        {detail}
      </TooltipContent>
    </Tooltip>
  );
}

function QueuePulse({
  overdue,
  under60,
  today,
  active,
}: {
  overdue: number;
  under60: number;
  today: number;
  active: number;
}) {
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-2.5 text-[11px] font-medium text-slate-600 shadow-card transition-colors hover:border-slate-300 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label={`${overdue} overdue, ${under60} under 60 minutes, ${today} later today`}
        >
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              {overdue > 0 ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
              ) : null}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
            </span>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
          </span>
          <span className="hidden sm:inline">Branch pulse</span>
          <span className="tnum text-slate-500">{active}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="end"
        className="w-44 bg-white p-2.5 text-slate-700 shadow-lg ring-1 ring-slate-200"
      >
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
              Overdue
            </span>
            <span className="tnum font-medium text-red-700">{overdue}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Under 60 min
            </span>
            <span className="tnum font-medium text-amber-700">{under60}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              Later today
            </span>
            <span className="tnum font-medium text-slate-700">{today}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <h3 className="text-[13px] font-semibold text-slate-900">{title}</h3>
        <span className="tnum text-[11px] text-slate-400">{count}</span>
      </header>
      {children}
    </section>
  );
}

function MiniRow({ ex, onOpen }: { ex: Exception; onOpen: () => void }) {
  const tech = techById(ex.assignedTech);
  const branch = branchById(ex.branchId);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
    >
      <StatusDot status={ex.status} />
      <FacilityPhoto name={ex.customer} size={30} className="hidden rounded-lg sm:inline-block" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium text-slate-900">{ex.customer}</span>
          <span className="tnum hidden text-[11px] text-slate-400 sm:inline">{ex.id}</span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-slate-500">
          <SlaCountdown dueAt={ex.slaDueAt} compact />
          <span className="hidden sm:inline">{branch?.name}</span>
          <span className="truncate">{ex.issueType}</span>
        </div>
      </div>
      {tech ? (
        <span className="hidden shrink-0 items-center gap-1.5 text-[11.5px] text-slate-600 sm:inline-flex">
          <AvatarInitials name={tech.name} size={18} />
          <span className="truncate">{tech.name.split(" ")[0]}</span>
        </span>
      ) : null}
      <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
        <span className="hidden sm:inline">Open details</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

function EmptyRow({ message }: { message: string }) {
  return <div className="px-4 py-4 text-[12.5px] text-slate-500">{message}</div>;
}

export { branches };
