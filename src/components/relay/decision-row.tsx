import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "./priority-badge";
import { SlaCountdown } from "./sla-countdown";
import { AvatarWithTooltip, PersonMentionText } from "./avatar-initials";
import { FacilityPhoto } from "./location-badge";
import { DenyDialog } from "./deny-dialog";
import { RecommendationTree } from "./recommendation-tree";
import { useRelayStore, branchById } from "@/lib/relay/store";
import type { Exception } from "@/lib/relay/types";

export function DecisionRow({ exception }: { exception: Exception }) {
  const { approve, openDrawer } = useRelayStore();
  const branch = branchById(exception.branchId);
  const escalatedBy = exception.escalation?.by;

  return (
    <article className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200/60 bg-white p-4 shadow-card transition-colors hover:bg-slate-50/50 md:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={exception.priority} />
          <span className="tnum text-[11px] text-slate-400">{exception.id}</span>
          {escalatedBy ? (
            <span className="ml-1 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
              <AvatarWithTooltip name={escalatedBy} size={16} />
              {escalatedBy}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => openDrawer(exception.id)}
            className="ml-auto text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
          >
            Open details →
          </button>
        </div>

        <div className="mt-2 flex min-w-0 items-start gap-3">
          <FacilityPhoto name={exception.customer} size={42} className="rounded-full" />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">{exception.customer}</h3>
            {branch ? (
              <p className="mt-0.5 truncate text-[11px] text-slate-500">{branch.name}</p>
            ) : null}
          </div>
        </div>

        {exception.escalation ? (
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12.5px] leading-5 text-slate-700">
            <span className="mr-1 font-medium text-slate-900">Dispatcher note:</span>
            <PersonMentionText text={exception.escalation.reason} />
          </div>
        ) : null}

        <RecommendationTree exception={exception} className="mt-3" />

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
          <SlaCountdown dueAt={exception.slaDueAt} />
          {branch ? <span>{branch.name}</span> : null}
          <span className="tnum">${exception.revenueAtRisk.toLocaleString()} at risk</span>
        </div>
      </div>

      <div className="flex items-end justify-end gap-2 md:flex-col md:items-stretch md:justify-end">
        <Button
          className="h-8 min-w-[112px] rounded-full bg-slate-900 px-4 text-xs text-white shadow-none hover:bg-slate-800"
          onClick={() => {
            approve(
              exception.id,
              "Approved. Proceed with the recommended action and notify dispatch.",
            );
            toast("Dispatch has approval and instructions.");
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
              className="h-8 min-w-[112px] rounded-full border-slate-200 bg-white px-4 text-xs text-slate-700 shadow-none hover:bg-slate-50 hover:text-slate-950"
            >
              Deny
            </Button>
          }
        />
      </div>
    </article>
  );
}
