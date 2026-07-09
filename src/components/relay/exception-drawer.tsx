import { Star, X } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useRelayStore, branchById, techById } from "@/lib/relay/store";
import { PriorityBadge } from "./priority-badge";
import { StatusPill } from "./status-pill";
import { SlaCountdown } from "./sla-countdown";
import { FacilityPhoto } from "./location-badge";
import { PersonMention, PersonMentionText } from "./avatar-initials";
import { RecommendationTree } from "./recommendation-tree";
import { ActivityTracker } from "./drawer/activity-tracker";
import { CompactDecisionBar } from "./drawer/compact-decision-bar";
import { cn } from "@/lib/utils";

export function ExceptionDrawer() {
  const { drawerExceptionId, closeDrawer, exceptions, toggleFavorite, role } = useRelayStore();
  const exception = exceptions.find((e) => e.id === drawerExceptionId) ?? null;
  const branch = exception ? branchById(exception.branchId) : null;
  const tech = techById(exception?.assignedTech);
  const isFav = exception ? (exception.favoritedBy ?? []).includes(role) : false;

  return (
    <Sheet
      open={!!exception}
      onOpenChange={(o) => {
        if (!o) closeDrawer();
      }}
    >
      <SheetContent
        side="right"
        hideClose
        className="flex w-full flex-col gap-0 rounded-l-2xl border-l border-slate-200 p-0 shadow-drawer sm:max-w-[620px]"
      >
        {exception ? (
          <>
            <SheetHeader className="sticky top-0 z-20 space-y-0 border-b border-slate-100 bg-white px-6 py-5 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
              <div className="flex items-center gap-2 text-[12px] text-slate-500">
                <span className="truncate">{branch?.name}</span>
                <span className="text-slate-300">/</span>
                <span className="tnum font-semibold text-slate-800">{exception.id}</span>
                <div className="ml-auto flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      toggleFavorite(exception.id);
                      toast(
                        isFav
                          ? `${exception.customer} removed from favorites.`
                          : `${exception.customer} added to favorites.`,
                      );
                    }}
                    aria-label={isFav ? "Unfavorite" : "Favorite"}
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-slate-100",
                      isFav ? "text-amber-500" : "text-slate-400 hover:text-amber-500",
                    )}
                  >
                    <Star className={cn("h-3.5 w-3.5", isFav && "fill-current")} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={closeDrawer}
                    aria-label="Close"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3.5">
                <FacilityPhoto name={exception.customer} size={52} className="rounded-full" />
                <div className="min-w-0 flex-1">
                  <SheetTitle className="text-left text-[20px] font-semibold leading-tight tracking-tight text-slate-900">
                    {exception.customer}
                  </SheetTitle>
                  <p className="mt-1 text-left text-[12px] text-slate-500">{exception.issueType}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <PriorityBadge priority={exception.priority} />
                    <StatusPill status={exception.status} />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500 ring-1 ring-slate-200/70">
                <SlaCountdown dueAt={exception.slaDueAt} />
                <span className="text-slate-300">·</span>
                <span className="tnum">${exception.revenueAtRisk.toLocaleString()} at risk</span>
                {tech ? (
                  <>
                    <span className="text-slate-300">·</span>
                    <span>Tech · {tech.name}</span>
                  </>
                ) : null}
              </div>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/40 px-6 py-6">
              <RecommendationTree exception={exception} />

              <section>
                <h3 className="mb-2.5 text-[15px] font-semibold text-slate-900">Situation</h3>
                <div className="rounded-xl bg-white px-4 py-3 shadow-card ring-1 ring-slate-200/60">
                  <p className="text-[13px] leading-relaxed text-slate-800">{exception.issue}</p>
                  {exception.escalation && !exception.decision ? (
                    <div className="mt-2.5 rounded-md border-l-2 border-amber-400 bg-amber-50/60 px-3 py-2 text-xs text-slate-700">
                      <span className="font-medium text-amber-800">Escalation ask ·</span>{" "}
                      <PersonMentionText text={exception.escalation.reason} />
                    </div>
                  ) : null}
                  {exception.decision ? (
                    <div
                      className={cn(
                        "mt-2.5 rounded-md border-l-2 px-3 py-2 text-xs text-slate-700",
                        exception.decision.outcome === "approved"
                          ? "border-emerald-400 bg-emerald-50/60"
                          : "border-red-400 bg-red-50/60",
                      )}
                    >
                      <span
                        className={cn(
                          "font-medium",
                          exception.decision.outcome === "approved"
                            ? "text-emerald-800"
                            : "text-red-800",
                        )}
                      >
                        {exception.decision.outcome === "approved" ? "Approved" : "Denied"} by{" "}
                        <PersonMention name={exception.decision.by} /> ·
                      </span>{" "}
                      <PersonMentionText
                        text={exception.decision.note ?? "Decision returned to Dispatch."}
                      />
                    </div>
                  ) : null}
                </div>
              </section>

              <section>
                <h3 className="mb-2.5 text-[15px] font-semibold text-slate-900">
                  Business Context
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <ContextStat
                    label="Revenue at risk"
                    value={`$${exception.revenueAtRisk.toLocaleString()}`}
                  />
                  <ContextStat label="Branch" value={branch?.name ?? "—"} />
                  <ContextStat label="History" value={exception.customerHistory} wide />
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-[15px] font-semibold text-slate-900">Activity Trail</h3>
                <ActivityTracker events={exception.audit} />
              </section>
            </div>

            <CompactDecisionBar exception={exception} />
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function ContextStat({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/60",
        wide && "col-span-2 sm:col-span-1",
      )}
    >
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className="tnum mt-0.5 text-[12.5px] font-medium leading-snug text-slate-800">
        {value}
      </div>
    </div>
  );
}
