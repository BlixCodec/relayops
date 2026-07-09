"use client";

// Screen 3 of 4: the manager decision queue. Escalations awaiting a decision
// at the top — Approve (indigo) / Deny (ghost, note required) — with the
// compact branch-health strip below for context (docs/decision-doc.md §4).

import { useRef, useState } from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import CheckedIcon from "@/components/ui/checked-icon";
import DenyIcon from "@/components/ui/x-icon";
import type { AnimatedIconHandle } from "@/components/ui/types";
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
import { SlaCountdown } from "@/components/sla-countdown";
import { getBranchById } from "@/lib/data";
import { useRelay } from "@/lib/store";
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
    <main className="mx-auto w-full max-w-5xl p-6">
      <h1 className="text-lg font-semibold tracking-tight text-slate-900">
        Decision queue
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        <span className="font-medium tabular-nums text-slate-900">
          {waiting.length}
        </span>{" "}
        escalation{waiting.length === 1 ? "" : "s"} awaiting your sign-off
      </p>

      {waiting.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
          <Inbox
            className="size-5 text-slate-400"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="mt-3 text-sm text-slate-600">
            No escalations waiting — nice.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              document
                .getElementById("branch-health")
                ?.scrollIntoView({ block: "start" })
            }
            className="mt-3 border-slate-200 text-slate-900 hover:bg-slate-50"
          >
            Check branch health
          </Button>
        </div>
      ) : (
        <ul className="mt-4 space-y-2.5">
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

      <h2
        id="branch-health"
        className="mt-8 text-xs font-medium uppercase tracking-wide text-slate-500"
      >
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
        <DialogContent className="border-slate-200 shadow-panel sm:max-w-md">
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
              variant={pending?.mode === "approved" ? "default" : "ghost"}
              className={cn(
                pending?.mode === "approved"
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "text-slate-900 hover:bg-slate-50",
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
  const approveIconRef = useRef<AnimatedIconHandle>(null);
  const denyIconRef = useRef<AnimatedIconHandle>(null);
  const escalation = exception.escalation;
  if (!escalation) return null;

  return (
    <li className="rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-card transition-shadow hover:shadow-panel">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          role="button"
          tabIndex={0}
          onClick={onDetails}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onDetails();
            }
          }}
          className="-m-2 min-w-0 flex-1 cursor-pointer rounded-lg p-2 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={exception.priority} />
            <span className="text-sm leading-tight font-semibold tracking-tight text-slate-900">
              {exception.customer}
            </span>
            <span className="text-xs tabular-nums text-slate-500">
              {exception.id}
            </span>
          </div>
          <p className="mt-1 text-sm leading-snug text-slate-500">
            {exception.issue}
          </p>

          <blockquote className="mt-2 rounded-md border-l-2 border-slate-300 bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
              Escalation reason
            </p>
            <p className="mt-0.5 text-sm text-slate-700">
              &ldquo;{escalation.reason}&rdquo;
            </p>
            <footer className="mt-1 text-xs text-slate-500">
              {escalation.escalatedBy} · {escalation.escalatedAt} ·{" "}
              {approvalLabels[escalation.requestedApproval]}
            </footer>
          </blockquote>

          <p className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
            <SlaCountdown exception={exception} />
            <span>{branch?.name ?? exception.branch}</span>
            <span className="tnum font-medium">
              ${exception.revenueAtRisk.toLocaleString()} at risk
            </span>
          </p>
        </div>

        <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
          <Button
            size="sm"
            onClick={() => onDecide("approved")}
            onMouseEnter={() => approveIconRef.current?.startAnimation()}
            onMouseLeave={() => approveIconRef.current?.stopAnimation()}
            onPointerDown={() => approveIconRef.current?.startAnimation()}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            <CheckedIcon ref={approveIconRef} size={16} strokeWidth={2} />
            Approve
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDecide("denied")}
            onMouseEnter={() => denyIconRef.current?.startAnimation()}
            onMouseLeave={() => denyIconRef.current?.stopAnimation()}
            onPointerDown={() => denyIconRef.current?.startAnimation()}
            className="text-slate-900 hover:bg-slate-50"
          >
            <DenyIcon ref={denyIconRef} size={16} strokeWidth={2} />
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
