import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AvatarInitials } from "./avatar-initials";
import { useRelayStore } from "@/lib/relay/store";
import type { Role } from "@/lib/relay/types";
import { cn } from "@/lib/utils";

export function RoleSwitchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { role, setRole, currentUser } = useRelayStore();
  const navigate = useNavigate();
  const [pending, setPending] = useState<Role>(role);

  const options: { role: Role; name: string; title: string; blurb: string }[] = [
    {
      role: "dispatcher",
      name: currentUser.dispatcher,
      title: "Sr. Dispatcher · North Ridge",
      blurb: "Triage exceptions, assign technicians, escalate when approval is required.",
    },
    {
      role: "manager",
      name: currentUser.manager,
      title: "Regional Operations Manager",
      blurb: "Review escalations, authorize cross-branch moves, and clear the decision queue.",
    },
  ];

  const confirm = () => {
    setRole(pending);
    navigate({ to: pending === "dispatcher" ? "/dispatcher/today" : "/manager" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold text-slate-900">
            Switch role
          </DialogTitle>
          <p className="text-xs text-slate-500">
            Choose the operating context. Nav, favorites, and inbox update instantly.
          </p>
        </DialogHeader>
        <div className="mt-2 grid gap-2">
          {options.map((o) => {
            const selected = pending === o.role;
            return (
              <button
                key={o.role}
                type="button"
                onClick={() => setPending(o.role)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                  selected
                    ? "border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                )}
              >
                <AvatarInitials name={o.name} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{o.name}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                        o.role === "dispatcher"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-violet-100 text-violet-700",
                      )}
                    >
                      {o.role === "dispatcher" ? "Dispatcher" : "Regional Operations"}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">{o.title}</div>
                  <p className="mt-1 text-xs text-slate-600">{o.blurb}</p>
                </div>
                {selected ? (
                  <Check className="mt-1 h-4 w-4 shrink-0 text-indigo-600" strokeWidth={2.5} />
                ) : null}
              </button>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-600">
            Cancel
          </Button>
          <Button onClick={confirm}>
            Continue as {pending === "dispatcher" ? "Dispatcher" : "Regional Operations"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
