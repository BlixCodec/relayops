import { useState } from "react";
import { UserPlus, ArrowUpRight, Check, SendHorizonal, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AvatarInitials } from "../avatar-initials";
import { DenyDialog } from "../deny-dialog";
import { useRelayStore, technicians } from "@/lib/relay/store";
import { managerApprovalCopy } from "@/lib/relay/decision-copy";
import type { Exception } from "@/lib/relay/types";
import { cn } from "@/lib/utils";

function ActionButton({
  icon: Icon,
  label,
  onClick,
  tone = "neutral",
  disabled,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  onClick?: () => void;
  tone?: "neutral" | "escalate" | "success";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-11 w-full min-w-0 items-center justify-center gap-1.5 rounded-lg border px-3 text-[12.5px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        tone === "escalate"
          ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
          : tone === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      <span className="truncate">{label}</span>
    </button>
  );
}

// Labeled prototype rewrite transform; no external model call is made.
function improveNote(input: string): string {
  const t = input.trim().replace(/\s+/g, " ");
  if (t.length === 0) return "";
  const withCap = t.charAt(0).toUpperCase() + t.slice(1);
  const withPeriod = /[.!?]$/.test(withCap) ? withCap : withCap + ".";
  return `Context: ${withPeriod} Recommend confirming ETA with the customer and logging any deviation for audit.`;
}

export function CompactDecisionBar({ exception }: { exception: Exception }) {
  const { role, escalate, approve, assignTechnician, resolve, addNote } = useRelayStore();
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState("");
  const [improving, setImproving] = useState(false);

  const canAssign = ["open", "assigned", "approved", "denied"].includes(exception.status);
  const canEscalate = ["open", "assigned", "denied"].includes(exception.status);
  const canResolve = ["open", "assigned", "approved", "denied"].includes(exception.status);
  const approval = managerApprovalCopy(exception);

  const submitNote = () => {
    if (note.trim().length === 0) return;
    addNote(exception.id, note.trim());
    setNote("");
    setExpanded(false);
    toast("Note added to the activity trail.");
  };

  const runImprove = () => {
    if (note.trim().length === 0) {
      toast("Add a draft comment before polishing it.");
      return;
    }
    setImproving(true);
    setExpanded(true);
    setTimeout(() => {
      setNote(improveNote(note));
      setImproving(false);
      toast("Draft polished for clarity — prototype behavior only.");
    }, 550);
  };

  return (
    <section className="border-t border-slate-200 bg-white px-3 py-3">
      {role === "manager" ? (
        exception.status === "escalated" ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="h-11 rounded-lg bg-slate-900 text-sm text-white hover:bg-slate-800"
              onClick={() => {
                approve(exception.id, approval.note);
                toast(approval.toast);
              }}
            >
              Approve escalation
            </Button>
            <DenyDialog
              exceptionId={exception.id}
              customer={exception.customer}
              trigger={
                <Button variant="outline" className="h-11 rounded-lg border-slate-200">
                  Deny with instruction
                </Button>
              }
            />
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[12px] text-slate-600">
            This decision has returned to Dispatch. The activity trail remains available for review.
          </div>
        )
      ) : exception.status === "escalated" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-900">
          Waiting on Regional Operations. You can add context below while a manager reviews the
          request.
        </div>
      ) : exception.status === "resolved" ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[12px] text-emerald-900">
          This exception is resolved. Its activity trail is preserved for review.
        </div>
      ) : (
        <div className={cn("grid gap-2", canEscalate ? "grid-cols-3" : "grid-cols-2")}>
          <Popover>
            <PopoverTrigger asChild>
              <div className="min-w-0">
                <ActionButton icon={UserPlus} label="Assign" disabled={!canAssign} />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
              <div className="px-2 py-1 text-[11px] font-medium text-slate-500">
                Available technicians
              </div>
              <div className="mt-1 space-y-0.5">
                {technicians.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      assignTechnician(exception.id, t.id);
                      toast(`${t.name} is assigned to ${exception.customer}.`);
                    }}
                    className="flex min-h-11 w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <AvatarInitials name={t.name} size={22} />
                    <span className="flex-1 truncate font-medium text-slate-800">{t.name}</span>
                    <span className="tnum text-[11px] text-slate-500">{t.minutesAway}m</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {canEscalate ? (
            <Dialog open={escalateOpen} onOpenChange={setEscalateOpen}>
              <DialogTrigger asChild>
                <div className="min-w-0">
                  <ActionButton icon={ArrowUpRight} label="Escalate" tone="escalate" />
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Escalate to Regional Operations</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-xs text-slate-600">
                    What decision do you need?
                  </Label>
                  <Textarea
                    id="reason"
                    name="escalation-reason"
                    value={escalateReason}
                    onChange={(e) => setEscalateReason(e.target.value)}
                    placeholder="Describe the approval needed, the constraint, and the requested next step."
                    rows={4}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setEscalateOpen(false)}
                    className="text-slate-600"
                  >
                    Keep editing
                  </Button>
                  <Button
                    disabled={escalateReason.trim().length < 5}
                    onClick={() => {
                      escalate(exception.id, escalateReason.trim());
                      setEscalateOpen(false);
                      setEscalateReason("");
                      toast(
                        "Escalation sent to Regional Operations — a manager will review shortly.",
                      );
                    }}
                  >
                    Send escalation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null}

          <div className="min-w-0">
            <ActionButton
              icon={Check}
              label="Resolve"
              tone="success"
              disabled={!canResolve}
              onClick={() => {
                resolve(exception.id);
                toast(`${exception.customer} marked resolved.`);
              }}
            />
          </div>
        </div>
      )}

      <div className="mt-3 rounded-lg border border-slate-200 bg-white focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400">
        <div className="flex items-start gap-1.5">
          <Textarea
            name="internal-comment"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onFocus={() => setExpanded(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submitNote();
              }
            }}
            placeholder="Add internal comment…"
            rows={expanded ? 2 : 1}
            className="min-h-0 resize-none border-0 bg-transparent px-2.5 py-1.5 text-[12px] shadow-none focus-visible:ring-0"
          />
          <button
            type="button"
            onClick={submitNote}
            disabled={note.trim().length === 0}
            className={cn(
              "mr-1 mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
              note.trim().length === 0
                ? "text-slate-300"
                : "bg-indigo-600 text-white hover:bg-indigo-700",
            )}
            aria-label="Send comment"
          >
            <SendHorizonal className="h-3.5 w-3.5" />
          </button>
        </div>
        {expanded || note.length > 0 ? (
          <div className="flex items-center justify-between border-t border-slate-100 px-2 py-1">
            <button
              type="button"
              onClick={runImprove}
              disabled={improving}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] font-medium text-violet-700 transition-colors hover:bg-violet-50",
                improving && "cursor-wait opacity-70",
              )}
            >
              {improving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" strokeWidth={2} />
              )}
              {improving ? "Polishing…" : "Polish draft"}
            </button>
            <span className="text-[10px] text-slate-400">⌘↵ to send</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
