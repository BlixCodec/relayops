"use client";

// Screen 4 of 4: the shared exception drawer, matched to the Lovable
// prototype: crumb header (branch / id + close), 20px title, status chips,
// meta line; slate body with Recommended action, Situation, and Activity
// Trail sections; compact decision bar (Assign popover / Escalate / Resolve)
// pinned at the bottom for the dispatcher. The prototype's favorites star,
// note composer, "Improve with AI", and decorative filter/search buttons are
// deliberately absent — fake or out-of-scope UI stays out.

import { useRef, useState } from "react";
import { Check, UserPlus, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import ArrowNarrowUpIcon from "@/components/ui/arrow-narrow-up-icon";
import SendIcon from "@/components/ui/send-icon";
import type { AnimatedIconHandle } from "@/components/ui/types";
import { AiInsightCard } from "@/components/ai-insight-card";
import { AuditTimeline } from "@/components/audit-timeline";
import { AvatarInitials } from "@/components/avatar-initials";
import { PriorityBadge } from "@/components/priority-badge";
import { SlaCountdown } from "@/components/sla-countdown";
import { StatusPill } from "@/components/status-pill";
import { getBranchById, getTechnicianById, technicians } from "@/lib/data";
import { useRelay } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ApprovalType, Exception } from "@/lib/types";

const approvalOptions: { value: ApprovalType; label: string }[] = [
  { value: "overtime", label: "Overtime approval" },
  { value: "cross-branch-transfer", label: "Cross-branch transfer" },
  { value: "goodwill-credit", label: "Goodwill credit" },
];

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
  const escalateIconRef = useRef<AnimatedIconHandle>(null);
  const sendIconRef = useRef<AnimatedIconHandle>(null);

  if (!exception) return null;

  const branch = getBranchById(exception.branch);
  const tech = getTechnicianById(exception.assignedTech);
  const escalation = exception.escalation;
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
          showCloseButton={false}
          className="flex w-full flex-col gap-0 rounded-l-2xl border-l border-slate-200 p-0 shadow-drawer sm:max-w-[620px]"
        >
          <div className="space-y-0 border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="truncate">
                {branch?.name ?? exception.branch}
              </span>
              <span className="text-slate-300">/</span>
              <span className="tnum font-semibold text-slate-800">
                {exception.id}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="ml-auto inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <SheetTitle className="mt-3 text-left text-[20px] leading-tight font-semibold tracking-tight text-slate-900">
              {exception.customer}
            </SheetTitle>
            <p className="mt-1 text-left text-xs text-slate-500 capitalize">
              {exception.type.replace(/-/g, " ")}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <PriorityBadge priority={exception.priority} />
              <StatusPill exception={exception} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
              <SlaCountdown exception={exception} />
              <span className="text-slate-300">·</span>
              <span className="tnum">
                ${exception.revenueAtRisk.toLocaleString()} at risk
              </span>
              <span className="text-slate-300">·</span>
              <span className="tnum">
                Visit {exception.visitsThisQuarter} this quarter
              </span>
              {tech ? (
                <>
                  <span className="text-slate-300">·</span>
                  <span>Tech · {tech.name}</span>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/40 px-6 py-6">
            {exception.aiSuggestion && (
              <AiInsightCard suggestion={exception.aiSuggestion} />
            )}

            <section>
              <h3 className="mb-2.5 text-[15px] font-semibold text-slate-900">
                Situation
              </h3>
              <div className="rounded-xl bg-white px-4 py-3 shadow-card ring-1 ring-slate-200/60">
                <p className="text-[13px] leading-relaxed text-slate-800">
                  {exception.issue}
                </p>
                {escalation && !escalation.decision ? (
                  <div className="mt-2.5 rounded-md border-l-2 border-amber-400 bg-amber-50/60 px-3 py-2 text-xs text-slate-700">
                    <span className="font-medium text-amber-800">
                      Escalation ask ·
                    </span>{" "}
                    {escalation.reason}
                  </div>
                ) : null}
                {escalation?.decision ? (
                  <div
                    className={cn(
                      "mt-2.5 rounded-md border-l-2 px-3 py-2 text-xs text-slate-700",
                      escalation.decision.outcome === "approved"
                        ? "border-emerald-400 bg-emerald-50/60"
                        : "border-red-400 bg-red-50/60",
                    )}
                  >
                    <span
                      className={cn(
                        "font-medium",
                        escalation.decision.outcome === "approved"
                          ? "text-emerald-800"
                          : "text-red-800",
                      )}
                    >
                      {escalation.decision.outcome === "approved"
                        ? "Approved"
                        : "Denied"}{" "}
                      · {escalation.decision.by} ·
                    </span>{" "}
                    {escalation.decision.note}
                  </div>
                ) : null}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-[15px] font-semibold text-slate-900">
                Activity Trail
              </h3>
              <AuditTimeline entries={exception.auditTrail} />
            </section>
          </div>

          {canAct && (
            <section className="border-t border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center gap-1.5 sm:flex-nowrap">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-8 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50"
                    >
                      {tech ? (
                        <AvatarInitials name={tech.name} size={16} ring={false} />
                      ) : (
                        <UserPlus
                          className="h-3.5 w-3.5 shrink-0"
                          strokeWidth={2}
                          aria-hidden
                        />
                      )}
                      <span className="truncate">
                        {tech ? tech.name : "Assign"}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="start">
                    <div className="px-2 py-1 text-[11px] tracking-wider text-slate-400 uppercase">
                      Technicians
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {technicians.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => assignTech(exception.id, t.id)}
                          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-50"
                        >
                          <AvatarInitials name={t.name} size={22} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-slate-800">
                              {t.name}
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              {getBranchById(t.branch)?.name ?? t.branch} ·{" "}
                              {t.status.replace(/-/g, " ")}
                            </span>
                          </span>
                          <span className="tnum text-[11px] text-slate-500">
                            {t.etaMinutes !== null ? `${t.etaMinutes}m` : "—"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <button
                  type="button"
                  onClick={() => setEscalateOpen(true)}
                  onMouseEnter={() => escalateIconRef.current?.startAnimation()}
                  onMouseLeave={() => escalateIconRef.current?.stopAnimation()}
                  onPointerDown={() => escalateIconRef.current?.startAnimation()}
                  className="inline-flex h-8 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-slate-900 bg-slate-900 px-2 text-xs font-medium text-white transition-colors hover:bg-slate-800"
                >
                  <ArrowNarrowUpIcon
                    ref={escalateIconRef}
                    size={14}
                    strokeWidth={2}
                  />
                  Escalate
                </button>

                <button
                  type="button"
                  onClick={() => resolve(exception.id)}
                  className="inline-flex h-8 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50"
                >
                  <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  Resolve
                </button>
              </div>
            </section>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={escalateOpen} onOpenChange={setEscalateOpen}>
        <DialogContent className="border-slate-200 shadow-panel sm:max-w-md">
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
              <Label htmlFor="approval-type" className="text-xs text-slate-600">
                What decision do you need?
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
              <Label htmlFor="escalate-reason" className="text-xs text-slate-600">
                Reason
              </Label>
              <Textarea
                id="escalate-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="What's blocked, and what should the manager approve?"
                className="mt-1 border-slate-200"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEscalateOpen(false)}
              className="text-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={submitEscalation}
              disabled={!reason.trim() || !approval}
              onMouseEnter={() => sendIconRef.current?.startAnimation()}
              onMouseLeave={() => sendIconRef.current?.stopAnimation()}
              onPointerDown={() => sendIconRef.current?.startAnimation()}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              <SendIcon ref={sendIconRef} size={16} strokeWidth={2} />
              Send escalation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
