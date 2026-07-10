import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/relay/page-header";
import { BranchHealthStrip } from "@/components/relay/branch-health-strip";
import { DecisionRow } from "@/components/relay/decision-row";
import { EmptyState, emptyStateIllustrations } from "@/components/relay/empty-state";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRelayStore } from "@/lib/relay/store";
import { slaBucket } from "@/components/relay/sla-countdown";

export const Route = createFileRoute("/_app/manager/")({
  component: DecisionQueue,
});

function DecisionQueue() {
  const exceptions = useRelayStore((s) => s.exceptions);
  const pending = useMemo(() => exceptions.filter((e) => e.status === "escalated"), [exceptions]);
  const overdueCount = pending.filter((e) => slaBucket(e.slaDueAt) === "overdue").length;
  const criticalCount = pending.filter((e) => e.priority === "critical").length;
  const branchCount = new Set(pending.map((e) => e.branchId)).size;

  const headline =
    pending.length === 0
      ? "No decisions are blocking dispatch."
      : `${pending.length} decision${pending.length === 1 ? "" : "s"} ${
          pending.length === 1 ? "is" : "are"
        } blocking dispatch.`;

  return (
    <>
      <PageHeader
        title={headline}
        guidance="Approve or deny escalations to unblock branches."
        className="bg-slate-50/85 backdrop-blur-md"
        actionsClassName="hidden sm:flex"
        actions={
          <DecisionPulse
            pending={pending.length}
            critical={criticalCount}
            overdue={overdueCount}
            branches={branchCount}
          />
        }
      />

      <div className="space-y-5 p-4 sm:p-6">
        <BranchHealthStrip />

        {pending.length === 0 ? (
          <EmptyState
            illustration={emptyStateIllustrations.regionalOperationsClear}
            artworkLabel="Regional Operations is caught up. No escalations are waiting for approval."
            imageClassName="max-w-[560px]"
          />
        ) : (
          <div className="space-y-3">
            {pending.map((e) => (
              <DecisionRow key={e.id} exception={e} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function DecisionPulse({
  pending,
  critical,
  overdue,
  branches,
}: {
  pending: number;
  critical: number;
  overdue: number;
  branches: number;
}) {
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-600 shadow-card transition-colors hover:bg-slate-50"
          aria-label={`${pending} pending decision${pending === 1 ? "" : "s"}, ${critical} critical, ${overdue} overdue, ${branches} branch${branches === 1 ? "" : "es"} affected`}
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
          <span className="hidden sm:inline">Decision pulse</span>
          <span className="tnum text-slate-500">{pending}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="end"
        className="w-48 bg-white p-2.5 text-slate-700 shadow-lg ring-1 ring-slate-200"
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
              Critical decisions
            </span>
            <span className="tnum font-medium text-amber-700">{critical}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              Branches affected
            </span>
            <span className="tnum font-medium text-slate-700">{branches}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
