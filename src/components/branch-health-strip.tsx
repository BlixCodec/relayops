"use client";

// Branch health per docs/decision-doc.md: exactly three pills, no charts.
// Dot + label, with live open-exception counts computed from the store so
// the strip always agrees with the board.

import { branches } from "@/lib/data";
import { useRelay } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { BranchHealth } from "@/lib/types";

const healthStyles: Record<BranchHealth, { pill: string; dot: string; label: string }> = {
  stable: {
    pill: "bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-600",
    label: "Stable",
  },
  "high-load": {
    pill: "bg-amber-50 text-amber-600",
    dot: "bg-amber-600",
    label: "High load",
  },
  critical: {
    pill: "bg-red-50 text-red-600",
    dot: "bg-red-600",
    label: "Critical",
  },
};

export function BranchHealthStrip() {
  const { exceptions } = useRelay();

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {branches.map((branch) => {
        const style = healthStyles[branch.health];
        const openCount = exceptions.filter(
          (e) => e.branch === branch.id && e.status !== "resolved",
        ).length;
        return (
          <div
            key={branch.id}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {branch.name}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                  style.pill,
                )}
              >
                <span
                  aria-hidden
                  className={cn("size-1.5 rounded-full", style.dot)}
                />
                {style.label}
              </span>
            </div>
            <p className="mt-2 text-xs tabular-nums text-slate-500">
              {openCount} open · {branch.techsAvailable} of {branch.techsTotal}{" "}
              techs free
            </p>
          </div>
        );
      })}
    </div>
  );
}
