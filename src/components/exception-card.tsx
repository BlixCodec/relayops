"use client";

// Exception card per docs/design-spec.md: priority badge + customer name
// (semibold) → issue one-liner (secondary) → footer: SLA countdown (tabular,
// red under 60 min) · branch · revenue at risk. Entire card clickable.

import { getBranchById } from "@/lib/data";
import { slaInfo, useMinutesElapsed } from "@/lib/use-sla";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/priority-badge";
import type { Exception } from "@/lib/types";

export function ExceptionCard({
  exception,
  onOpen,
}: {
  exception: Exception;
  onOpen: (id: string) => void;
}) {
  const branch = getBranchById(exception.branch);
  const decision = exception.escalation?.decision;
  const sla = slaInfo(exception, useMinutesElapsed());

  return (
    <button
      type="button"
      onClick={() => onOpen(exception.id)}
      className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
    >
      <div className="flex items-center gap-2">
        <PriorityBadge priority={exception.priority} />
        <span className="text-sm font-semibold text-slate-900">
          {exception.customer}
        </span>
        {exception.status === "awaiting-decision" && (
          <span className="ml-auto rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
            Waiting on manager
          </span>
        )}
        {decision && exception.status !== "resolved" && (
          <span
            className={cn(
              "ml-auto rounded-full px-2 py-0.5 text-xs font-medium",
              decision.outcome === "approved"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600",
            )}
          >
            {decision.outcome === "approved" ? "Approved" : "Denied"} — see note
          </span>
        )}
      </div>
      <p className="mt-1.5 text-sm text-slate-500">{exception.issue}</p>
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
        <span
          className={cn(
            "font-medium tabular-nums",
            sla.urgent ? "text-red-600" : "text-slate-900",
          )}
        >
          {sla.met
            ? "SLA met"
            : sla.breached
              ? "SLA breached"
              : `SLA ${sla.minutes} min`}
        </span>
        <span aria-hidden>·</span>
        <span>{branch?.name ?? exception.branch}</span>
        <span aria-hidden>·</span>
        <span className="tabular-nums">
          ${exception.revenueAtRisk.toLocaleString()} at risk
        </span>
      </div>
    </button>
  );
}
