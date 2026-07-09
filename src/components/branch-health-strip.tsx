"use client";

// Branch health (Lovable prototype): inline label + exactly three white
// pills — dot, branch name, tone label. No charts, no cards.

import { branches } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { BranchHealth } from "@/lib/types";

const healthTone: Record<BranchHealth, { dot: string; text: string; label: string }> = {
  stable: { dot: "bg-emerald-500", text: "text-emerald-700", label: "Stable" },
  "high-load": { dot: "bg-amber-500", text: "text-amber-700", label: "High load" },
  critical: { dot: "bg-red-500", text: "text-red-700", label: "Critical" },
};

export function BranchHealthStrip() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {branches.map((branch) => {
        const t = healthTone[branch.health];
        return (
          <span
            key={branch.id}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs shadow-card"
          >
            <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
            <span className="font-medium text-slate-900">{branch.name}</span>
            <span className={cn("text-[11px]", t.text)}>{t.label}</span>
          </span>
        );
      })}
    </div>
  );
}
