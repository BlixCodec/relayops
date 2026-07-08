"use client";

// Screen 4 of 4: the shared exception detail drawer. Both roles open this —
// dispatcher actions (Assign / Escalate / Resolve) render only for the
// dispatcher. Contains the audit timeline per docs/decision-doc.md.

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AiInsightCard } from "@/components/ai-insight-card";
import { AuditTimeline } from "@/components/audit-timeline";
import { PriorityBadge } from "@/components/priority-badge";
import { getBranchById, getTechnicianById, technicians } from "@/lib/data";
import { useRelay } from "@/lib/store";
import { formatSlaClock, slaInfo, useSecondsElapsed } from "@/lib/use-sla";
import { cn } from "@/lib/utils";
import type { ApprovalType, Exception } from "@/lib/types";

const approvalOptions: { value: ApprovalType; label: string }[] = [
  { value: "overtime", label: "Overtime approval" },
  { value: "cross-branch-transfer", label: "Cross-branch transfer" },
  { value: "goodwill-credit", label: "Goodwill credit" },
];

const techStatusLabels = {
  available: "available",
  "on-job": "on a job",
  "off-shift": "off shift",
} as const;

export function ExceptionDrawer({
  exception,
  onClose,
}: {
  exception: Exception | null;
  onClose: () => void;
}) {
  const { role, assignTech, escalate, resolve } = useRelay();
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [approval, setApproval] = useState<ApprovalType | "">("");
  const secondsElapsed = useSecondsElapsed();

  if (!exception) return null;

  const sla = slaInfo(exception, secondsElapsed);
  const branch = getBranchById(exception.branch);
  const assigned = getTechnicianById(exception.assignedTech);
  const decision = exception.escalation?.decision;
  const canAct =
    role === "dispatcher" &&
    (exception.status === "open" || exception.status === "assigned");

  function submitEscalation() {
    if (!exception || !reason.trim() || !approval) return;
    escalate(exception.id, reason.trim(), approval);
    setEscalateOpen(false);
    setReason("");
    setApproval("");
  }

  return (
    <>
      <Sheet open={!!exception} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto border-slate-200 sm:max-w-md"
        >
          <SheetHeader className="border-b border-slate-200">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={exception.priority} />
              <span className="text-xs tabular-nums text-slate-500">
                {exception.id}
              </span>
            </div>
            <SheetTitle className="text-base font-semibold text-slate-900">
              {exception.customer}
            </SheetTitle>
            <SheetDescription className="text-sm text-slate-500">
              {exception.issue}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 p-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">SLA remaining</dt>
                <dd
                  className={cn(
                    "mt-0.5 font-medium tabular-nums",
                    sla.urgent ? "text-red-600" : "text-slate-900",
                  )}
                >
                  {sla.met
                    ? "Met"
                    : sla.breached
                      ? "Breached"
                      : formatSlaClock(sla.seconds ?? 0)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Revenue at risk</dt>
                <dd className="mt-0.5 font-medium tabular-nums text-slate-900">
                  ${exception.revenueAtRisk.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Branch</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {branch?.name ?? exception.branch}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Visits this quarter</dt>
                <dd className="mt-0.5 font-medium tabular-nums text-slate-900">
                  {exception.visitsThisQuarter}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-slate-500">Assigned technician</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {assigned ? assigned.name : "Nobody yet"}
                </dd>
              </div>
            </dl>

            {exception.aiSuggestion && (
              <AiInsightCard suggestion={exception.aiSuggestion} />
            )}

            {exception.status === "awaiting-decision" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                Waiting on Regional Operations — the escalation is in the
                manager&apos;s decision queue.
              </div>
            )}

            {decision && (
              <div
                className={cn(
                  "rounded-lg border p-4 text-sm",
                  decision.outcome === "approved"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-600",
                )}
              >
                <p className="font-medium">
                  {decision.outcome === "approved" ? "Approved" : "Denied"} by{" "}
                  {decision.by} · {decision.at}
                </p>
                <p className="mt-1">{decision.note}</p>
              </div>
            )}

            {canAct && (
              <div className="space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Actions
                </h3>
                <div>
                  <Label
                    htmlFor="assign-tech"
                    className="text-xs text-slate-500"
                  >
                    Assign a technician
                  </Label>
                  <Select
                    value={exception.assignedTech ?? ""}
                    onValueChange={(techId) =>
                      assignTech(exception.id, techId)
                    }
                  >
                    <SelectTrigger
                      id="assign-tech"
                      className="mt-1 w-full border-slate-200"
                    >
                      <SelectValue placeholder="Pick from the bench" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} — {getBranchById(t.branch)?.name ?? t.branch}
                          {" · "}
                          {techStatusLabels[t.status]}
                          {t.etaMinutes !== null
                            ? ` · ${t.etaMinutes} min out`
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setEscalateOpen(true)}
                    className="bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Escalate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resolve(exception.id);
                    }}
                    className="border-slate-200 text-slate-900 hover:bg-slate-50"
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Audit trail
              </h3>
              <div className="mt-3">
                <AuditTimeline entries={exception.auditTrail} />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={escalateOpen} onOpenChange={setEscalateOpen}>
        <DialogContent className="border-slate-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">
              Escalate to Regional Operations
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Say what you need approved and why — the manager sees your reason
              word for word.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="approval-type" className="text-xs text-slate-500">
                What needs approval?
              </Label>
              <Select
                value={approval}
                onValueChange={(v) => setApproval(v as ApprovalType)}
              >
                <SelectTrigger
                  id="approval-type"
                  className="mt-1 w-full border-slate-200"
                >
                  <SelectValue placeholder="Pick an approval type" />
                </SelectTrigger>
                <SelectContent>
                  {approvalOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="escalate-reason" className="text-xs text-slate-500">
                Reason
              </Label>
              <Textarea
                id="escalate-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="What's blocked, and what should the manager approve?"
                className="mt-1 border-slate-200"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEscalateOpen(false)}
              className="border-slate-200 text-slate-900 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={submitEscalation}
              disabled={!reason.trim() || !approval}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              Send escalation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
