"use client";

// SLA readout (Lovable port): Timer glyph + tone dot (pulsing when urgent)
// + live countdown. Tones: calm / warning <60m / critical <15m / breached.

import { Timer } from "lucide-react";
import {
  formatSlaClock,
  slaInfo,
  useSecondsElapsed,
  type SlaTone,
} from "@/lib/use-sla";
import { cn } from "@/lib/utils";
import type { Exception } from "@/lib/types";

const toneClass: Record<
  SlaTone,
  { text: string; dot: string | null; pulse?: boolean }
> = {
  met: { text: "text-slate-500", dot: null },
  calm: { text: "text-slate-600", dot: "bg-slate-300" },
  warning: { text: "text-amber-600", dot: "bg-amber-500" },
  critical: { text: "text-red-600", dot: "bg-red-500", pulse: true },
  breached: { text: "text-red-700", dot: "bg-red-600", pulse: true },
};

export function SlaCountdown({
  exception,
  className,
  showIcon = true,
}: {
  exception: Exception;
  className?: string;
  showIcon?: boolean;
}) {
  const sla = slaInfo(exception, useSecondsElapsed());
  const t = toneClass[sla.tone];

  const label = sla.met
    ? "SLA met"
    : sla.breached
      ? "SLA breached"
      : formatSlaClock(sla.seconds ?? 0);

  return (
    <span
      className={cn(
        "tnum inline-flex items-center gap-1.5 text-xs font-medium",
        t.text,
        className,
      )}
    >
      {showIcon ? <Timer className="h-3 w-3" strokeWidth={2} aria-hidden /> : null}
      {t.dot ? (
        <span
          aria-hidden
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            t.dot,
            t.pulse && "animate-pulse",
          )}
        />
      ) : null}
      {label}
    </span>
  );
}
