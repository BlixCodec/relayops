"use client";

// Exception card, matched to the Lovable prototype's anatomy: venue glyph +
// priority + id header, customer name with assigned-tech avatar, issue
// one-liner, conditional high-confidence suggestion strip, then the
// SLA countdown · status · branch · revenue · tech footer.

import { Sparkles } from "lucide-react";
import { getBranchById, getTechnicianById } from "@/lib/data";
import { cn } from "@/lib/utils";
import { AvatarInitials } from "@/components/avatar-initials";
import { LocationBadge } from "@/components/location-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { SlaCountdown } from "@/components/sla-countdown";
import { StatusDot } from "@/components/status-pill";
import type { Exception } from "@/lib/types";

export function ExceptionCard({
  exception,
  onOpen,
}: {
  exception: Exception;
  onOpen: (id: string) => void;
}) {
  const branch = getBranchById(exception.branch);
  const tech = getTechnicianById(exception.assignedTech);
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
      className="group flex w-full cursor-pointer flex-col rounded-xl border border-slate-200/60 bg-white px-4 py-3.5 text-left shadow-card transition-shadow hover:shadow-panel focus-visible:outline-2 focus-visible:outline-indigo-600"
    >
      <div className="flex min-w-0 items-center gap-2">
        <LocationBadge name={exception.customer} size={22} />
        <PriorityBadge priority={exception.priority} />
        <span className="tnum text-[11px] text-slate-400">{exception.id}</span>
        {exception.status === "awaiting-decision" && (
          <span className="ml-auto rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] leading-none font-medium text-amber-700">
            Waiting on manager
          </span>
        )}
        {decision && exception.status !== "resolved" && (
          <span
            className={cn(
              "ml-auto rounded-full border px-2 py-0.5 text-[11px] leading-none font-medium",
              decision.outcome === "approved"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-600",
            )}
          >
            {decision.outcome === "approved" ? "Approved" : "Denied"} — see note
          </span>
        )}
      </div>

      <div className="mt-1.5 flex min-w-0 items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-sm leading-tight font-semibold tracking-tight text-slate-900">
          {exception.customer}
        </span>
        {tech ? (
          <AvatarInitials name={tech.name} size={18} className="shrink-0" />
        ) : null}
      </div>

      <p className="mt-0.5 line-clamp-1 text-xs leading-snug text-slate-500">
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

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
        <SlaCountdown exception={exception} />
        <StatusDot exception={exception} />
        <span className="hidden sm:inline">
          {branch?.name ?? exception.branch}
        </span>
        <span className="tnum">
          ${exception.revenueAtRisk.toLocaleString()} at risk
        </span>
        {tech ? (
          <span className="ml-auto hidden items-center gap-1.5 sm:inline-flex">
            <AvatarInitials name={tech.name} size={16} />
            <span className="text-slate-600">{tech.name}</span>
          </span>
        ) : null}
      </div>
    </button>
  );
}
