// Recommended-action panel (Lovable port). Confidence chip + signal count
// instead of the violet surface; the rule-based-stub disclosure stays —
// stubs are labeled, never hidden (CLAUDE.md).

import { cn } from "@/lib/utils";
import type { AiSuggestion, Confidence } from "@/lib/types";

const qualityTone: Record<Confidence, string> = {
  high: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  medium: "bg-amber-50 text-amber-700 ring-amber-200/70",
  low: "bg-slate-100 text-slate-600 ring-slate-200/70",
};

const qualityLabel: Record<Confidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export function AiInsightCard({ suggestion }: { suggestion: AiSuggestion }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <header className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-slate-900">
          Recommended action
        </span>
        <span
          className={cn(
            "tnum ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1",
            qualityTone[suggestion.confidence],
          )}
        >
          {qualityLabel[suggestion.confidence]}
          <span className="text-slate-400">·</span>
          {suggestion.reasons.length} signals
        </span>
      </header>
      <p className="mt-2.5 text-sm leading-snug font-semibold text-slate-900">
        {suggestion.action}
      </p>
      <ul className="mt-2.5 space-y-1.5">
        {suggestion.reasons.map((reason) => (
          <li
            key={reason}
            className="flex gap-2 text-xs leading-relaxed text-slate-700"
          >
            <span
              aria-hidden
              className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-slate-400"
            />
            <span>{reason}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-slate-400">
        Rule-based stub — in production, confidence derives from certification
        match, travel time, and SLA headroom.
      </p>
    </section>
  );
}
