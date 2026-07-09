// Priority pill per docs/design-spec.md: tinted background with darker text
// of the same hue — never solid fills.

import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/types";

const styles: Record<Priority, string> = {
  critical: "bg-red-50 text-red-700 border border-red-200",
  high: "bg-amber-50 text-amber-700 border border-amber-200",
  medium: "bg-slate-100 text-slate-700 border border-slate-200",
};

const labels: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] leading-none font-medium tracking-wide",
        styles[priority],
        className,
      )}
    >
      {labels[priority]}
    </span>
  );
}
