import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const emptyStateIllustrations = {
  noCriticalExceptions: "/empty-states/no-critical-exceptions.png",
  noAssignments: "/empty-states/no-assignments.png",
  noSearchResults: "/empty-states/no-search-results.png",
  noActivity: "/empty-states/no-activity.png",
  noNotifications: "/empty-states/no-notifications.png",
  regionalOperationsClear: "/empty-states/regional-operations-clear.png",
} as const;

export function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  message,
  action,
  className,
  imageClassName,
  artworkLabel,
  framed = true,
}: {
  icon?: LucideIcon;
  illustration?: string;
  title?: string;
  description?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
  imageClassName?: string;
  artworkLabel?: string;
  framed?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-white px-6 py-10 text-center",
        framed && "rounded-lg border border-dashed border-slate-200",
        className,
      )}
    >
      {illustration ? (
        <div className={cn("mb-3 aspect-[3/2] w-full max-w-[640px]", imageClassName)}>
          <img
            src={illustration}
            alt={artworkLabel ?? ""}
            aria-hidden={artworkLabel ? undefined : true}
            className="h-full w-full object-contain"
          />
        </div>
      ) : Icon ? (
        <Icon className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
      ) : null}

      {title ? (
        <h2 className="mt-2 max-w-2xl text-balance text-2xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
      ) : message ? (
        <p className={cn("text-sm text-slate-600", !illustration && Icon && "mt-3")}>{message}</p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
