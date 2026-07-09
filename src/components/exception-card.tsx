"use client";

// Exception card (Lovable-port panel look): floating white panel with
// shadow-card that lifts to shadow-panel on hover. Priority + id up top,
// customer name, issue one-liner, conditional high-confidence suggestion
// strip, then SLA countdown · branch · revenue footer.

import { Sparkles } from "lucide-react";
import { getBranchById } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/priority-badge";
import { SlaCountdown } from "@/components/sla-countdown";
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
  const suggestion = exception.aiSuggestion;
  const showSuggestion =
    suggestion &&
    suggestion.confidence === "high" &&
    suggestion.reasons.length >= 3 &&
    exception.status !== "resolved";

  return (
    <button
      type="button"
      onClick={() => onOpen(exception.id)}
      className="w-full cursor-pointer rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-left shadow-card transition-shadow hover:shadow-panel focus-visible:outline-2 focus-visible:outline-indigo-600"
    >
      <div className="flex items-center gap-2">
        <PriorityBadge priority={exception.priority} />
        <span className="tnum text-[11px] text-slate-400">{exception.id}</span>
        {exception.status === "awaiting-decision" && (
          <span className="ml-auto rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium leading-none text-amber-700">
            Waiting on manager
          </span>
        )}
        {decision && exception.status !== "resolved" && (
          <span
            className={cn(
              "ml-auto rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none",
              decision.outcome === "approved"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-600",
            )}
          >
            {decision.outcome === "approved" ? "Approved" : "Denied"} — see note
          </span>
        )}
      </div>

      <p className="mt-1.5 text-sm leading-tight font-semibold tracking-tight text-slate-900">
        {exception.customer}
      </p>
      <p className="mt-0.5 text-xs leading-snug text-slate-500">
        {exception.issue}
      </p>

      {showSuggestion && (
        <span className="mt-2 flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50/70 px-2 py-1 text-[11px] text-slate-700">
          <Sparkles
            className="h-3 w-3 shrink-0 text-emerald-600"
            strokeWidth={2}
            aria-hidden
          />
          <span className="truncate">
            <span className="font-medium">Suggested · </span>
            {suggestion.action}
          </span>
        </span>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
        <SlaCountdown exception={exception} />
        <span>{branch?.name ?? exception.branch}</span>
        <span className="tnum font-medium">
          ${exception.revenueAtRisk.toLocaleString()} at risk
        </span>
      </div>
    </button>
  );
}
