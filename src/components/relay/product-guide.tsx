import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  LifeBuoy,
  RotateCcw,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRelayStore, workspace } from "@/lib/relay/store";
import { cn } from "@/lib/utils";

const workflow = [
  {
    label: "Dispatch identifies",
    detail: "Alicia opens the North Ridge blocker and escalates with context.",
  },
  {
    label: "Operations decides",
    detail: "Renata reviews the request and approves or denies the exception.",
  },
  {
    label: "Dispatch acts",
    detail: "The decision returns with a notification and complete activity trail.",
  },
] as const;

export function WorkflowOverview({
  onOpenGuide,
  className,
}: {
  onOpenGuide: () => void;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-card",
        className,
      )}
      aria-labelledby="workflow-overview-title"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="workflow-overview-title" className="text-[12px] font-semibold text-slate-900">
            How work moves
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-600">
            One blocker, one decision, one clear next step.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenGuide}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:border-indigo-200 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Open guide
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <ol className="mt-3 grid gap-2 sm:grid-cols-3">
        {workflow.map((step, index) => (
          <li
            key={step.label}
            className="flex min-w-0 items-center gap-2 text-[11px] text-slate-600"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-semibold text-indigo-700">
              {index + 1}
            </span>
            <span className="font-medium text-slate-700">{step.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ProductGuide({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { resetDemo, setBranch, setRole } = useRelayStore();

  const startWorkflow = () => {
    setRole("dispatcher");
    setBranch(workspace.defaultBranch);
    onOpenChange(false);
    navigate({ to: "/dispatcher/today" });
  };

  const restoreDemo = () => {
    resetDemo();
    onOpenChange(false);
    navigate({ to: "/" });
    toast.success("Demo restored to its starting state.", {
      description: "You can replay the complete workflow from the role selector.",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-[min(92vw,30rem)] flex-col gap-0 overflow-hidden border-slate-200 bg-white p-0 sm:max-w-[30rem]"
      >
        <SheetHeader className="border-b border-slate-200 px-5 py-5 pr-12 text-left">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
            <LifeBuoy className="h-4.5 w-4.5" />
          </div>
          <SheetTitle className="text-lg tracking-tight text-slate-950">
            How RelayOps works
          </SheetTitle>
          <SheetDescription className="max-w-[52ch] text-[13px] leading-5 text-slate-600">
            RelayOps routes the decision—not just the ticket. Follow one blocker from Dispatch to
            Regional Operations and back.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <section aria-labelledby="quick-start-title">
            <div className="flex items-center justify-between gap-3">
              <h3 id="quick-start-title" className="text-[13px] font-semibold text-slate-950">
                Try the core workflow
              </h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                About 90 seconds
              </span>
            </div>

            <ol className="relative mt-4 space-y-4 before:absolute before:bottom-3 before:left-[13px] before:top-3 before:w-px before:bg-slate-200">
              {workflow.map((step, index) => (
                <li key={step.label} className="relative flex gap-3">
                  <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-[11px] font-semibold text-indigo-700">
                    {index + 1}
                  </span>
                  <div className="pt-0.5">
                    <h4 className="text-[12.5px] font-semibold text-slate-900">{step.label}</h4>
                    <p className="mt-0.5 max-w-[52ch] text-[12px] leading-5 text-slate-600">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <Button
              onClick={startWorkflow}
              className="mt-5 h-10 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700"
            >
              Start as Alicia in Dispatch
              <ArrowRight className="h-4 w-4" />
            </Button>
          </section>

          <div className="my-5 h-px bg-slate-200" />

          <section className="space-y-2" aria-label="Additional guide information">
            <GuideDetail
              icon={ShieldCheck}
              title="Who does what"
              content={
                <div className="space-y-2.5">
                  <RoleLine
                    role="Dispatcher"
                    text="Triage exceptions, assign technicians, resolve work, and escalate when authorization is required."
                  />
                  <RoleLine
                    role="Regional Operations"
                    text="Review escalations, authorize exceptions, and return a clear instruction to Dispatch."
                  />
                </div>
              }
            />
            <GuideDetail
              icon={ClipboardCheck}
              title="Prototype boundaries"
              content={
                <p>
                  Authentication, server persistence, real-time notifications, and external AI calls
                  are deliberately stubbed. The working prototype uses realistic seed data and
                  stores changes in this browser.
                </p>
              }
            />
            <GuideDetail
              icon={CheckCircle2}
              title="Production path"
              content={
                <p>
                  The first production investments would be role-based access control, durable
                  append-only storage, and SLA-aware routing with real-time notifications.
                </p>
              }
            />
          </section>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg text-[12px] font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset demo data
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md rounded-2xl border-slate-200">
              <AlertDialogHeader>
                <AlertDialogTitle>Reset the RelayOps demo?</AlertDialogTitle>
                <AlertDialogDescription className="leading-5">
                  This restores every exception, notification, favorite, and activity entry to the
                  original starting state. You’ll return to role selection.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep current progress</AlertDialogCancel>
                <AlertDialogAction
                  onClick={restoreDemo}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  Reset demo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function GuideDetail({
  icon: Icon,
  title,
  content,
}: {
  icon: LucideIcon;
  title: string;
  content: ReactNode;
}) {
  return (
    <details className="group rounded-xl border border-slate-200 bg-white open:bg-slate-50/60">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2.5 px-3 text-[12px] font-medium text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 [&::-webkit-details-marker]:hidden">
        <Icon className="h-3.5 w-3.5 text-slate-500" />
        <span>{title}</span>
        <span
          className="ml-auto text-slate-400 transition-transform group-open:rotate-90"
          aria-hidden
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </summary>
      <div className="px-3 pb-3 pl-8 text-[11.5px] leading-5 text-slate-600">{content}</div>
    </details>
  );
}

function RoleLine({ role, text }: { role: string; text: string }) {
  return (
    <div>
      <p className="font-semibold text-slate-800">{role}</p>
      <p>{text}</p>
    </div>
  );
}
