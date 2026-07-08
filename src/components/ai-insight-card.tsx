// AI Insight card per docs/design-spec.md: violet surface, small
// "AI SUGGESTION" label, bold recommended action, reasoning bullets,
// confidence tag. Rule-based stub — labeled as such, never hidden.

import { Sparkles } from "lucide-react";
import type { AiSuggestion } from "@/lib/types";

const confidenceLabels = {
  high: "Confidence: High",
  medium: "Confidence: Medium",
  low: "Confidence: Low",
} as const;

export function AiInsightCard({ suggestion }: { suggestion: AiSuggestion }) {
  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-violet-700">
          <Sparkles className="size-3.5" aria-hidden />
          AI suggestion
        </span>
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
          {confidenceLabels[suggestion.confidence]}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">
        {suggestion.action}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
        {suggestion.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-violet-700">
        Rule-based stub — in production, confidence derives from certification
        match, travel time, and SLA headroom.
      </p>
    </div>
  );
}
