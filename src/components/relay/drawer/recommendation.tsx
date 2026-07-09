import { cn } from "@/lib/utils";
import { PersonMentionText } from "../avatar-initials";
import type { Recommendation } from "@/lib/relay/types";

const qualityTone: Record<Recommendation["quality"], string> = {
  "High Confidence": "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  "Medium Confidence": "bg-amber-50 text-amber-700 ring-amber-200/70",
  "Low Confidence": "bg-slate-100 text-slate-600 ring-slate-200/70",
};

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <header className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-slate-900">Recommended action</span>
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1",
            qualityTone[rec.quality],
          )}
        >
          {rec.quality}
          {rec.signalsCount > 0 ? (
            <>
              <span className="text-slate-400">·</span>
              <span className="tnum">{rec.signalsCount} signals</span>
            </>
          ) : null}
        </span>
      </header>
      <p className="mt-2.5 text-[14px] font-semibold leading-snug text-slate-900">
        <PersonMentionText text={rec.action} />
      </p>
      {rec.bullets.length > 0 ? (
        <ul className="mt-2.5 space-y-1.5">
          {rec.bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-slate-700">
              <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-slate-400" />
              <span>
                <PersonMentionText text={b} />
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
