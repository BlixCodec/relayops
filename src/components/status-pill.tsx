// Status pill + dot (Lovable port), keyed to our store's statuses.
// "awaiting-decision" reads as "Escalated" — that's what it means on the
// floor, and it matches the prototype's vocabulary.

import { cn } from "@/lib/utils";
import type { Exception, ExceptionStatus } from "@/lib/types";

type StatusKey = ExceptionStatus | "approved" | "denied";

const statusTone: Record<
  StatusKey,
  { dot: string; text: string; bg: string; border: string; label: string }
> = {
  open: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Open",
  },
  assigned: {
    dot: "bg-indigo-500",
    text: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    label: "Assigned",
  },
  "awaiting-decision": {
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Escalated",
  },
  approved: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Approved",
  },
  denied: {
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "Denied",
  },
  resolved: {
    dot: "bg-slate-400",
    text: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-200",
    label: "Resolved",
  },
};

/** Effective display status: a fresh decision outranks the raw status. */
export function statusKeyFor(e: Exception): StatusKey {
  const decision = e.escalation?.decision;
  if (decision && e.status !== "resolved") return decision.outcome;
  return e.status;
}

export function StatusPill({
  exception,
  className,
}: {
  exception: Exception;
  className?: string;
}) {
  const t = statusTone[statusKeyFor(exception)];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] leading-none font-medium",
        t.bg,
        t.text,
        t.border,
        className,
      )}
    >
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
      {t.label}
    </span>
  );
}

export function StatusDot({
  exception,
  className,
}: {
  exception: Exception;
  className?: string;
}) {
  const t = statusTone[statusKeyFor(exception)];
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
      <span>{t.label}</span>
    </span>
  );
}
