import { toast } from "sonner";
import { ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "./priority-badge";
import { SlaCountdown } from "./sla-countdown";
import { AvatarWithTooltip, PersonMentionText } from "./avatar-initials";
import { FacilityPhoto } from "./location-badge";
import { DenyDialog } from "./deny-dialog";
import { RecommendationTree } from "./recommendation-tree";
import { useRelayStore, branchById } from "@/lib/relay/store";
import { recommendationTree } from "@/lib/relay/recommendation-tree";
import { managerApprovalCopy } from "@/lib/relay/decision-copy";
import type { Exception } from "@/lib/relay/types";

export function DecisionRow({ exception }: { exception: Exception }) {
  const { approve, openDrawer } = useRelayStore();
  const branch = branchById(exception.branchId);
  const escalatedBy = exception.escalation?.by;
  const recommendation = recommendationTree(exception);
  const approval = managerApprovalCopy(exception);

  return (
    <article className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-card transition-colors hover:bg-slate-50/50">
      <div className="flex items-center gap-2">
        <PriorityBadge priority={exception.priority} />
        <span className="tnum text-[11px] text-slate-500">{exception.id}</span>
        {escalatedBy ? (
          <span className="ml-1 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <AvatarWithTooltip name={escalatedBy} size={16} />
            {escalatedBy}
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => openDrawer(exception.id)}
          className="ml-auto rounded text-[11px] font-medium text-indigo-600 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Open details →
        </button>
      </div>

      <div className="mt-2 flex min-w-0 items-start gap-3">
        <FacilityPhoto name={exception.customer} size={42} className="rounded-full" />
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-slate-900">{exception.customer}</h2>
          {branch ? (
            <p className="mt-0.5 truncate text-[11px] text-slate-500">{branch.name}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        {exception.escalation ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12.5px] leading-5 text-slate-700">
            <span className="mr-1 font-medium text-slate-900">Dispatcher note:</span>
            <PersonMentionText text={exception.escalation.reason} />
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2 md:w-[236px]">
          <Button
            className="h-11 rounded-full bg-slate-900 px-4 text-xs text-white shadow-none hover:bg-slate-800"
            onClick={() => {
              approve(exception.id, approval.note);
              toast(approval.toast);
            }}
          >
            Approve
          </Button>
          <DenyDialog
            exceptionId={exception.id}
            customer={exception.customer}
            trigger={
              <Button
                variant="outline"
                className="h-11 rounded-full border-slate-200 bg-white px-4 text-xs text-slate-700 shadow-none hover:bg-slate-50 hover:text-slate-950"
              >
                Deny
              </Button>
            }
          />
        </div>
      </div>

      <details className="group mt-3 rounded-lg border border-violet-100 bg-violet-50/30 px-3 py-2.5">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 [&::-webkit-details-marker]:hidden">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-600" />
          <span className="text-[11px] font-medium text-violet-700">Recommended decision</span>
          <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-slate-800">
            {recommendation.action}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
        </summary>
        <RecommendationTree
          exception={exception}
          className="mt-2 border-0 bg-transparent px-0 py-1 shadow-none sm:px-0"
        />
      </details>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <SlaCountdown dueAt={exception.slaDueAt} />
        {branch ? <span>{branch.name}</span> : null}
        <span className="tnum">${exception.revenueAtRisk.toLocaleString()} at risk</span>
      </div>
    </article>
  );
}
