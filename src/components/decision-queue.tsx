"use client";

// Screen 3 of 4: the manager decision queue. Escalations awaiting a decision
// at the top — Approve (indigo) / Deny (ghost, note required) — with the
// compact branch-health strip below for context (docs/decision-doc.md §4).

import { useState } from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BranchHealthStrip } from "@/components/branch-health-strip";
import { ExceptionDrawer } from "@/components/exception-drawer";
import { PriorityBadge } from "@/components/priority-badge";
import { getBranchById } from "@/lib/data";
import { useRelay } from "@/lib/store";
import { formatSlaClock, slaInfo, useSecondsElapsed } from "@/lib/use-sla";
import { cn } from "@/lib/utils";
import type { ApprovalType, Exception } from "@/lib/types";

const approvalLabels: Record<ApprovalType, string> = {
  overtime: "Overtime approval",
  "cross-branch-transfer": "Cross-branch transfer",
  "goodwill-credit": "Goodwill credit",
};

type PendingDecision = {
  exceptionId: string;
  mode: "approved" | "denied";
} | null;

export function DecisionQueue() {
  const { exceptions, decide } = useRelay();
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingDecision>(null);
  const [note, setNote] = useState("");

  const waiting = exceptions.filter(
    (e) => e.status === "awaiting-decision" && !e.escalation?.decision,
  );
  const selected = exceptions.find((e) => e.id === openId) ?? null;
  const pendingException =
    exceptions.find((e) => e.id === pending?.exceptionId) ?? null;

  // Deny always needs instructions; approve can ship with an empty note.
  const noteRequired = pending?.mode === "denied";
  const canSubmit = !noteRequired || note.trim().length > 0;

  function submitDecision() {
    if (!pending || !canSubmit) return;
    decide(pending.exceptionId, pending.mode, note.trim());
    setPending(null);
    setNote("");
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-lg font-semibold text-slate-900">Decision queue</h1>
      <p className="mt-1 text-xs text-slate-500">
        Escalations from the branches that need your sign-off.
      </p>

      {waiting.length === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center">
          <Inbox className="size-5 text-emerald-600" aria-hidden />
          <p className="mt-2 text-sm text-slate-900">No escalations waiting.</p>
          <p className="mt-1 text-sm text-slate-500">
            Nice — check branch health below.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {waiting.map((e) => (
            <DecisionRow
              key={e.id}
              exception={e}
              onDetails={() => setOpenId(e.id)}
              onDecide={(mode) => {
                setPending({ exceptionId: e.id, mode });
                setNote("");
              }}
            />
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-xs font-medium uppercase tracking-wide text-slate-500">
        Branch health
      </h2>
      <div className="mt-3">
        <BranchHealthStrip />
      </div>

      <ExceptionDrawer exception={selected} onClose={() => setOpenId(null)} />

      <Dialog
        open={!!pending}
        onOpenChange={(open) => {
          if (!open) {
            setPending(null);
            setNote("");
          }
        }}
      >
        <DialogContent className="border-slate-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">
              {pending?.mode === "approved" ? "Approve" : "Deny"}{" "}
              {pendingException?.id} — {pendingException?.customer}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {pending?.mode === "approved"
                ? "Your note travels back to the dispatcher with the approval."
                : "Denials need instructions — tell the branch what to do instead."}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="decision-note" className="text-xs text-slate-500">
              {pending?.mode === "approved"
                ? "Note for the branch (optional)"
                : "Instructions for the branch"}
            </Label>
            <Textarea
              id="decision-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                pending?.mode === "approved"
                  ? "Any conditions — caps, timing, follow-ups."
                  : "What should the dispatcher do instead?"
              }
              className="mt-1 border-slate-200"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPending(null)}
              className="border-slate-200 text-slate-900 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={submitDecision}
              disabled={!canSubmit}
              className={cn(
                pending?.mode === "approved"
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-slate-900 text-white hover:bg-slate-800",
              )}
            >
              {pending?.mode === "approved"
                ? "Approve escalation"
                : "Deny with instructions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function DecisionRow({
  exception,
  onDetails,
  onDecide,
}: {
  exception: Exception;
  onDetails: () => void;
  onDecide: (mode: "approved" | "denied") => void;
}) {
  const branch = getBranchById(exception.branch);
  const sla = slaInfo(exception, useSecondsElapsed());
  const escalation = exception.escalation;
  if (!escalation) return null;

  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={exception.priority} />
            <span className="text-sm font-semibold text-slate-900">
              {exception.customer}
            </span>
            <span className="text-xs tabular-nums text-slate-500">
              {exception.id}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{exception.issue}</p>

          <blockquote className="mt-3 border-l-2 border-slate-200 pl-3 text-sm text-slate-900">
            &ldquo;{escalation.reason}&rdquo;
            <footer className="mt-1 text-xs text-slate-500">
              {escalation.escalatedBy} · {escalation.escalatedAt} ·{" "}
              {approvalLabels[escalation.requestedApproval]}
            </footer>
          </blockquote>

          <p className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            <span
              className={cn(
                "font-medium tabular-nums",
                sla.urgent ? "text-red-600" : "text-slate-900",
              )}
            >
              {sla.breached
                ? "SLA breached"
                : `SLA ${formatSlaClock(sla.seconds ?? 0)}`}
            </span>
            <span aria-hidden>·</span>
            <span>{branch?.name ?? exception.branch}</span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">
              ${exception.revenueAtRisk.toLocaleString()} at risk
            </span>
          </p>
        </div>

        <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
          <Button
            size="sm"
            onClick={() => onDecide("approved")}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDecide("denied")}
            className="text-slate-900 hover:bg-slate-50"
          >
            Deny
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDetails}
            className="text-indigo-600 hover:bg-slate-50 hover:text-indigo-700"
          >
            Details
          </Button>
        </div>
      </div>
    </li>
  );
}
