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
import { AvatarInitials } from "@/components/avatar-initials";
import { BranchHealthStrip } from "@/components/branch-health-strip";
import { ExceptionDrawer } from "@/components/exception-drawer";
import { LocationBadge } from "@/components/location-badge";
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
      <h1 className="text-[19px] leading-tight font-semibold tracking-tight text-slate-900">
        Decision queue
      </h1>
      <p className="mt-1 text-[13px] text-slate-500">
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
                : "Dispatch needs a specific instruction. A note is required."}
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
                : "Deny with instruction"}
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
    <li className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200/60 bg-white p-4 shadow-card md:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={exception.priority} />
          <span className="tnum text-[11px] text-slate-400">
            {exception.id}
          </span>
          <span className="ml-1 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <AvatarInitials name={escalation.escalatedBy} size={16} />
            {escalation.escalatedBy}
          </span>
          <button
            type="button"
            onClick={onDetails}
            className="ml-auto cursor-pointer text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
          >
            Review details →
          </button>
        </div>

        <h3 className="mt-1.5 flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-900">
          <LocationBadge name={exception.customer} size={20} />
          <span className="truncate">{exception.customer}</span>
        </h3>

        <p className="mt-1 text-xs text-slate-700 italic">
          &ldquo;{escalation.reason}&rdquo;
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
          <SlaCountdown exception={exception} />
          <span>{branch?.name ?? exception.branch}</span>
          <span className="tnum">
            ${exception.revenueAtRisk.toLocaleString()} at risk
          </span>
          <span className="ml-auto">
            {approvalLabels[escalation.requestedApproval]}
          </span>
        </div>
      </div>

      <div className="flex items-end justify-end gap-2 md:flex-col md:items-stretch md:justify-between">
        <Button
          onClick={() => onDecide("approved")}
          onMouseEnter={() => approveIconRef.current?.startAnimation()}
          onMouseLeave={() => approveIconRef.current?.stopAnimation()}
          onPointerDown={() => approveIconRef.current?.startAnimation()}
          className="min-w-[110px] bg-slate-900 text-white hover:bg-slate-800"
        >
          <CheckedIcon ref={approveIconRef} size={16} strokeWidth={2} />
          Approve
        </Button>
        <Button
          variant="ghost"
          onClick={() => onDecide("denied")}
          onMouseEnter={() => denyIconRef.current?.startAnimation()}
          onMouseLeave={() => denyIconRef.current?.stopAnimation()}
          onPointerDown={() => denyIconRef.current?.startAnimation()}
          className="min-w-[110px] text-slate-600 hover:text-slate-900"
        >
          <DenyIcon ref={denyIconRef} size={16} strokeWidth={2} />
          Deny
        </Button>
      </div>
    </li>
  );
}
