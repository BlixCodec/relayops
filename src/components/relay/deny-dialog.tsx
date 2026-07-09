import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRelayStore } from "@/lib/relay/store";

export function DenyDialog({
  exceptionId,
  customer,
  trigger,
}: {
  exceptionId: string;
  customer: string;
  trigger: React.ReactNode;
}) {
  const deny = useRelayStore((s) => s.deny);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deny escalation</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-slate-500">
          {customer} · dispatch needs a specific instruction. A note is required.
        </p>
        <div className="space-y-2">
          <Label htmlFor="deny-note" className="text-xs text-slate-600">
            Instruction to dispatch
          </Label>
          <Textarea
            id="deny-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Denied. Counter with $1,000 credit plus complimentary quarterly PM."
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" className="text-slate-600" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={note.trim().length < 5}
            onClick={() => {
              deny(exceptionId, note.trim());
              setOpen(false);
              setNote("");
              toast("Dispatch has the denial instruction.");
            }}
          >
            Deny with instruction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
