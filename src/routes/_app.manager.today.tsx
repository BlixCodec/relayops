import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, Star } from "lucide-react";
import { toast } from "sonner";
import { useRelayStore, branchById } from "@/lib/relay/store";
import { branches } from "@/lib/relay/seed";
import { SlaCountdown, slaBucket, slaTone } from "@/components/relay/sla-countdown";
import { BranchHealthPill, StatusDot } from "@/components/relay/status-pill";
import { PriorityBadge } from "@/components/relay/priority-badge";
import { QuoteBlock } from "@/components/relay/quote-block";
import { RecommendationTree } from "@/components/relay/recommendation-tree";
import {
  AvatarInitials,
  PersonMention,
  PersonMentionText,
} from "@/components/relay/avatar-initials";
import { FacilityPhoto } from "@/components/relay/location-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Exception } from "@/lib/relay/types";

export const Route = createFileRoute("/_app/manager/today")({
  component: ManagerToday,
});

function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function ManagerToday() {
  const navigate = useNavigate();
  const { exceptions, decisionHistory, openDrawer, setFavoriteFilter, toggleFavorite, role } =
    useRelayStore();

  const escalated = exceptions.filter((e) => e.status === "escalated");
  const criticalBranch = branches.filter((b) => b.health === "critical").length;
  const overdueCount = escalated.filter((e) => slaBucket(e.slaDueAt) === "overdue").length;
  const criticalPending = escalated.filter((e) => e.priority === "critical").length;
  const decisionsToday = useMemo(() => {
    const cutoff = Date.now() - 24 * 3_600_000;
    return [...exceptions.filter((e) => e.decision && new Date(e.decision.at).getTime() > cutoff)]
      .length;
  }, [exceptions]);

  const primary = useMemo(() => {
    const rank = { critical: 0, high: 1, medium: 2 } as const;
    return [...escalated].sort(
      (a, b) =>
        rank[a.priority] - rank[b.priority] ||
        new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime(),
    )[0];
  }, [escalated]);

  const sub =
    escalated.length === 0
      ? "No decisions are blocking dispatch right now."
      : `${escalated.length} decision${escalated.length === 1 ? " is" : "s are"} currently blocking dispatch.`;

  const recent = useMemo(() => {
    return [...exceptions.filter((e) => e.decision), ...decisionHistory]
      .filter((e) => e.decision)
      .sort((a, b) => new Date(b.decision!.at).getTime() - new Date(a.decision!.at).getTime())
      .slice(0, 6);
  }, [exceptions, decisionHistory]);

  return (
    <div className="w-full max-w-none space-y-5 px-4 py-4 sm:px-8 sm:py-6">
      <section className="-mx-4 border-b border-slate-200/70 bg-slate-50/80 px-4 py-2.5 sm:-mx-8 sm:px-8 sm:py-3">
        <div className="mx-auto flex max-w-5xl flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="min-w-0 shrink-0 lg:w-[300px]">
            <h1 className="truncate text-[20px] font-semibold leading-tight tracking-tight text-slate-900">
              Regional Operations
            </h1>
            <p className="mt-0.5 truncate text-[12.5px] text-slate-500">{sub}</p>
          </div>
          <div className="-mx-1 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-1 pb-1 text-[12px] text-slate-500 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
            <SummaryChip value={branches.length} label="Branches" />
            <SummaryChip value={escalated.length} label="Pending" tone="warning" />
            <SummaryChip value={criticalBranch} label="Critical branch" tone="critical" />
            <SummaryChip value={decisionsToday} label="Today" />
          </div>
          <div className="hidden shrink-0 sm:block lg:ml-auto">
            <ManagerPulse
              pending={escalated.length}
              critical={criticalPending}
              overdue={overdueCount}
              branches={new Set(escalated.map((e) => e.branchId)).size}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-6">
        {primary ? (
          <PrimaryDecision
            ex={primary}
            onOpen={() => openDrawer(primary.id)}
            onToggleFavorite={() => {
              toggleFavorite(primary.id);
              const isFav = (primary.favoritedBy ?? []).includes(role);
              toast(
                isFav
                  ? `${primary.customer} removed from favorites.`
                  : `${primary.customer} added to favorites.`,
              );
            }}
            isFavorite={(primary.favoritedBy ?? []).includes(role)}
          />
        ) : null}

        <section>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Branch status
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              branches.find((b) => b.id === "north")!,
              branches.find((b) => b.id === "west")!,
              branches.find((b) => b.id === "east")!,
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setFavoriteFilter(b.id);
                  navigate({ to: "/manager" });
                  toast(`Filtering decision queue to ${b.name}.`);
                }}
                className="rounded-full outline-none transition-transform hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label={`Filter decision queue to ${b.name}`}
              >
                <BranchHealthPill branch={b.name} health={b.health} />
              </button>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
          <header className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <h3 className="text-[13px] font-semibold text-slate-900">Recent decisions</h3>
            <span className="tnum text-[11px] text-slate-400">{recent.length}</span>
          </header>
          {recent.length === 0 ? (
            <div className="px-4 py-4 text-[12.5px] text-slate-500">
              No decisions logged in the last few days.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((e) => (
                <li key={e.id}>
                  <div className="flex w-full items-center gap-3 px-4 py-2.5 transition-colors hover:bg-slate-50">
                    <StatusDot status={e.decision!.outcome} />
                    <FacilityPhoto name={e.customer} size={34} className="rounded-full" />
                    <button
                      type="button"
                      onClick={() => openDrawer(e.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-medium text-slate-900">
                          {e.customer}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize",
                            e.decision!.outcome === "approved"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700",
                          )}
                        >
                          {e.decision!.outcome}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-[11.5px] text-slate-500">
                        {e.issueType}
                      </div>
                    </button>
                    <div className="hidden items-center gap-2 sm:flex">
                      <AvatarInitials name={e.decision!.by} size={24} />
                      <span className="max-w-24 truncate text-[11px] text-slate-500">
                        {e.decision!.by}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        toggleFavorite(e.id);
                        const isFav = (e.favoritedBy ?? []).includes(role);
                        toast(
                          isFav
                            ? `${e.customer} removed from favorites.`
                            : `${e.customer} added to favorites.`,
                        );
                      }}
                      aria-label={(e.favoritedBy ?? []).includes(role) ? "Unfavorite" : "Favorite"}
                      className={cn(
                        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-slate-100",
                        (e.favoritedBy ?? []).includes(role)
                          ? "text-amber-500"
                          : "text-slate-300 hover:text-amber-500",
                      )}
                    >
                      <Star
                        className={cn(
                          "h-3.5 w-3.5",
                          (e.favoritedBy ?? []).includes(role) && "fill-current",
                        )}
                      />
                    </button>
                    <span className="tnum shrink-0 text-[11px] text-slate-400">
                      {relative(e.decision!.at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function SummaryChip({
  value,
  label,
  tone = "neutral",
}: {
  value: number;
  label: string;
  tone?: "neutral" | "warning" | "critical";
}) {
  return (
    <span className="inline-flex h-7 min-w-[132px] items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 shadow-card sm:min-w-0">
      <span
        className={cn(
          "tnum text-[13px] font-semibold",
          tone === "critical"
            ? "text-red-700"
            : tone === "warning"
              ? "text-amber-700"
              : "text-slate-900",
        )}
      >
        {value}
      </span>
      <span className="truncate text-[10.5px] text-slate-500 sm:text-[11px]">{label}</span>
    </span>
  );
}

function ManagerPulse({
  pending,
  critical,
  overdue,
  branches,
}: {
  pending: number;
  critical: number;
  overdue: number;
  branches: number;
}) {
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-600 shadow-card transition-colors hover:bg-slate-50"
          aria-label={`${pending} pending decisions, ${critical} critical, ${overdue} overdue, ${branches} branches affected`}
        >
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              {overdue > 0 ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
              ) : null}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
            </span>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
          </span>
          <span className="hidden sm:inline">Decision pulse</span>
          <span className="tnum text-slate-500">{pending}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="end"
        className="w-48 bg-white p-2.5 text-slate-700 shadow-lg ring-1 ring-slate-200"
      >
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
              Overdue
            </span>
            <span className="tnum font-medium text-red-700">{overdue}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Critical decisions
            </span>
            <span className="tnum font-medium text-amber-700">{critical}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              Branches affected
            </span>
            <span className="tnum font-medium text-slate-700">{branches}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function PrimaryDecision({
  ex,
  onOpen,
  onToggleFavorite,
  isFavorite,
}: {
  ex: Exception;
  onOpen: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}) {
  const branch = branchById(ex.branchId);
  const tone = slaTone(ex.slaDueAt);
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-card sm:p-6",
        tone === "breached" || tone === "critical" ? "border-red-200" : "border-slate-200",
      )}
    >
      <div className="flex items-start gap-3">
        <FacilityPhoto name={ex.customer} size={46} className="rounded-full" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
              Primary decision
            </span>
            <PriorityBadge priority={ex.priority} />
            <span className="tnum text-[11px] text-slate-400">{ex.id}</span>
          </div>
          <h2 className="mt-2 truncate text-[18px] font-semibold leading-tight text-slate-900">
            {ex.customer}
          </h2>
          <p className="mt-1.5 text-[13px] leading-5 text-slate-600">{ex.issueType}</p>
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Unfavorite" : "Favorite"}
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-slate-100",
            isFavorite ? "text-amber-500" : "text-slate-300 hover:text-amber-500",
          )}
        >
          <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-slate-600">
        <SlaCountdown dueAt={ex.slaDueAt} />
        <span>{branch?.name ?? "·"}</span>
        <span className="tnum">${ex.revenueAtRisk.toLocaleString()} at risk</span>
      </div>

      {ex.escalation ? (
        <QuoteBlock
          label={
            <span className="inline-flex items-center gap-1.5">
              Dispatcher note
              <span className="text-slate-300">·</span>
              <PersonMention name={ex.escalation.by} />
            </span>
          }
          className="mt-4 border-indigo-200 bg-indigo-50/70"
        >
          <PersonMentionText text={ex.escalation.reason} />
        </QuoteBlock>
      ) : null}

      <div className="mt-4">
        <RecommendationTree exception={ex} />
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Open details
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
