import { useRelayStore, branchById } from "@/lib/relay/store";
import { branches } from "@/lib/relay/seed";
import { PriorityBadge } from "./priority-badge";
import { StatusDot } from "./status-pill";
import { SlaCountdown } from "./sla-countdown";
import { AvatarInitials, AvatarWithTooltip } from "./avatar-initials";
import { FacilityPhoto } from "./location-badge";
import { techById } from "@/lib/relay/store";
import { ArrowRight, ChevronDown, Star } from "lucide-react";
import { toast } from "sonner";
import { RecommendationTree } from "./recommendation-tree";
import { cn } from "@/lib/utils";
import type { Exception } from "@/lib/relay/types";

export function ExceptionCard({
  exception,
  defaultExpanded = true,
}: {
  exception: Exception;
  defaultExpanded?: boolean;
}) {
  const openDrawer = useRelayStore((s) => s.openDrawer);
  const toggleFavorite = useRelayStore((s) => s.toggleFavorite);
  const role = useRelayStore((s) => s.role);
  // Absent store entry falls back to the per-card default; an explicit user
  // toggle always wins.
  const storedCollapsed = useRelayStore((s) => s.collapsedCards[exception.id]);
  const setCardCollapsed = useRelayStore((s) => s.setCardCollapsed);
  const collapsed = storedCollapsed ?? !defaultExpanded;
  const featured = defaultExpanded && !collapsed;

  const branch = branchById(exception.branchId);
  const tech = techById(exception.assignedTech);
  const isFav = (exception.favoritedBy ?? []).includes(role);

  return (
    <div
      className={cn(
        "group relative flex w-full flex-col rounded-xl border border-slate-200/60 bg-white shadow-card transition-shadow",
        featured ? "px-4 py-4 sm:px-5 sm:py-5" : "px-3.5 py-3 sm:px-4 sm:py-3.5",
        "hover:shadow-panel",
      )}
    >
      <button
        type="button"
        onClick={() => openDrawer(exception.id)}
        className="absolute inset-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
        aria-label={`Open ${exception.customer}`}
      />

      <div className="relative flex min-w-0 items-start gap-3">
        <FacilityPhoto name={exception.customer} size={featured ? 46 : 40} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <PriorityBadge priority={exception.priority} />
            <span className="tnum hidden text-[11px] text-slate-400 sm:inline">{exception.id}</span>
          </div>
          <div className="mt-1.5 flex min-w-0 items-center gap-2">
            <div
              className={cn(
                "min-w-0 flex-1 truncate font-semibold text-slate-900",
                featured ? "text-[15px] sm:text-[15.5px]" : "text-[13.5px] sm:text-sm",
              )}
            >
              {exception.customer}
            </div>
            {tech ? (
              <span className="relative z-10 shrink-0">
                <AvatarWithTooltip name={tech.name} size={18} />
              </span>
            ) : null}
          </div>
        </div>
        <span className="ml-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(exception.id);
              toast(
                isFav
                  ? `${exception.customer} removed from favorites.`
                  : `${exception.customer} added to favorites.`,
              );
            }}
            className={cn(
              "relative rounded p-1 text-slate-300 transition-colors hover:bg-slate-100 hover:text-amber-500",
              isFav && "text-amber-500",
            )}
            aria-label={isFav ? "Unfavorite" : "Favorite"}
          >
            <Star className={cn("h-3.5 w-3.5", isFav && "fill-current")} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCardCollapsed(exception.id, !collapsed);
            }}
            aria-label={collapsed ? "Expand" : "Collapse"}
            className="relative rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", collapsed && "-rotate-90")}
            />
          </button>
        </span>
      </div>

      {!collapsed ? (
        <>
          <div
            className={cn(
              "relative line-clamp-1 text-slate-500",
              featured ? "mt-2.5 text-[12.5px]" : "mt-2 text-xs",
            )}
          >
            {exception.issue}
          </div>

          {exception.status !== "resolved" && exception.recommendation.bullets.length > 0 ? (
            <div className={cn("pointer-events-none relative", featured ? "mt-3" : "mt-2.5")}>
              <RecommendationTree exception={exception} />
            </div>
          ) : null}

          <div
            className={cn(
              "relative flex flex-col gap-2 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between",
              featured ? "mt-4 pt-3" : "mt-3 pt-2.5",
            )}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
              <SlaCountdown dueAt={exception.slaDueAt} compact />
              <span className="inline-flex items-center gap-1.5">
                <StatusDot status={exception.status} />
                <span className="capitalize">{exception.status}</span>
              </span>
              <span className="hidden sm:inline">{branch?.name ?? "·"}</span>
              <span className="tnum">${exception.revenueAtRisk.toLocaleString()} at risk</span>
              {tech ? (
                <span className="hidden items-center gap-1.5 sm:inline-flex">
                  <AvatarInitials name={tech.name} size={16} />
                  <span className="text-slate-600">{tech.name}</span>
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openDrawer(exception.id);
              }}
              className="relative z-10 inline-flex h-7 w-fit items-center gap-1.5 self-end rounded-full border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label={`Open ${exception.customer} details`}
            >
              Open details
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      ) : (
        <div className="relative mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-2.5">
          <SlaCountdown dueAt={exception.slaDueAt} compact />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openDrawer(exception.id);
            }}
            className="relative z-10 inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={`Open ${exception.customer} details`}
          >
            Open details
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export { branches };
