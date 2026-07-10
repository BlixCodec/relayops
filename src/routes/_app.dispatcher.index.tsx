import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/relay/page-header";
import { ExceptionCard } from "@/components/relay/exception-card";
import { EmptyState, emptyStateIllustrations } from "@/components/relay/empty-state";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRelayStore } from "@/lib/relay/store";
import { SlaLegend, slaBucket } from "@/components/relay/sla-countdown";

export const Route = createFileRoute("/_app/dispatcher/")({
  component: DispatcherWorkbench,
});

function DispatcherWorkbench() {
  const exceptions = useRelayStore((s) => s.exceptions);
  const active = useMemo(() => exceptions.filter((e) => e.status !== "resolved"), [exceptions]);

  const criticalOpen = useMemo(
    () =>
      active.filter(
        (e) => e.priority === "critical" && e.status !== "approved" && e.status !== "denied",
      ).length,
    [active],
  );

  const groups = useMemo(() => {
    const overdue = active.filter((e) => slaBucket(e.slaDueAt) === "overdue");
    const under60 = active.filter((e) => slaBucket(e.slaDueAt) === "under60");
    const today = active.filter((e) => slaBucket(e.slaDueAt) === "today");
    const priorityRank: Record<string, number> = { critical: 0, high: 1, medium: 2 };
    const sort = (arr: typeof active) =>
      [...arr].sort(
        (a, b) =>
          priorityRank[a.priority] - priorityRank[b.priority] ||
          new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime(),
      );
    return [
      { key: "overdue", label: "Overdue", items: sort(overdue) },
      { key: "under60", label: "Under 60 min", items: sort(under60) },
      { key: "today", label: "Today", items: sort(today) },
    ];
  }, [active]);

  const visibleGroups = groups.filter((g) => g.items.length > 0);
  const overdueCount = groups.find((g) => g.key === "overdue")?.items.length ?? 0;
  const under60Count = groups.find((g) => g.key === "under60")?.items.length ?? 0;

  // The single highest-priority card opens expanded; the rest start collapsed
  // so the queue stays scannable. Any manual toggle overrides this.
  const topId = visibleGroups[0]?.items[0]?.id;

  const headline =
    criticalOpen === 0
      ? "No critical exceptions open right now."
      : `${criticalOpen} critical exception${criticalOpen === 1 ? "" : "s"} ${
          criticalOpen === 1 ? "requires" : "require"
        } attention today.`;

  return (
    <>
      <PageHeader
        title={headline}
        guidance="Start with the highest-risk exception."
        className="bg-indigo-50/30"
        actionsClassName="hidden sm:flex"
        actions={
          <QueuePulse overdue={overdueCount} under60={under60Count} active={active.length} />
        }
      />

      <div className="p-4 sm:p-6">
        {visibleGroups.length === 0 ? (
          <EmptyState
            illustration={emptyStateIllustrations.noCriticalExceptions}
            artworkLabel="You're caught up. No critical exceptions require attention right now."
            imageClassName="max-w-[560px]"
          />
        ) : (
          <div className="relative space-y-5 pl-5 before:absolute before:bottom-4 before:left-1.5 before:top-2 before:border-l before:border-dashed before:border-slate-200">
            {visibleGroups.map((g) => {
              return (
                <section key={g.key} className="relative">
                  <div className="absolute -left-5 top-1.5 h-3 w-3 rounded-full border border-slate-200 bg-white ring-4 ring-white">
                    <span className="absolute inset-1 rounded-full bg-slate-300" />
                  </div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        {g.label}
                      </h2>
                      <span className="tnum text-[11px] text-slate-400">{g.items.length}</span>
                    </div>
                    {g.key === "overdue" ? (
                      <SlaLegend className="-my-1 hidden sm:inline-flex" />
                    ) : null}
                  </div>
                  <div className="space-y-3">
                    {g.items.map((e) => (
                      <ExceptionCard key={e.id} exception={e} defaultExpanded={e.id === topId} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function QueuePulse({
  overdue,
  under60,
  active,
}: {
  overdue: number;
  under60: number;
  active: number;
}) {
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-600 shadow-card transition-colors hover:bg-slate-50"
          aria-label={`${overdue} overdue, ${under60} under 60 minutes, ${active} active exceptions`}
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
          <span className="hidden sm:inline">Queue pulse</span>
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
              Active queue
            </span>
            <span className="tnum font-medium text-slate-700">{active}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
