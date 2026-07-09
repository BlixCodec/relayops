import { technicians } from "./seed";
import type { Exception, Technician } from "./types";

// Derives the Issue / Impact / Timeline / Recommended columns the
// RecommendationTree renders. Everything comes from real seed fields —
// the issue sentence, customer history, revenue, audit trail, and the
// referenced technician — so nothing is invented copy.

export interface TreeItem {
  text: string;
  /** Second line, e.g. a relative time under a timeline entry. */
  sub?: string;
  tone?: "default" | "critical" | "success";
}

export interface RecommendationTreeData {
  action: string;
  issue: TreeItem[];
  impact: TreeItem[];
  timeline: TreeItem[];
  tech: Technician | null;
  /** Fallback shown in the Recommended column when no technician applies. */
  recommendedFallback: TreeItem[];
}

function relative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function sentences(text: string): string[] {
  return text
    .split(/[;·]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const cap = s.charAt(0).toUpperCase() + s.slice(1);
      return /[.!?]$/.test(cap) ? cap : `${cap}.`;
    });
}

function namedTechnician(action: string): Technician | null {
  return technicians.find((t) => action.includes(t.name.split(" ")[0])) ?? null;
}

export function recommendationTree(ex: Exception): RecommendationTreeData {
  const rec = ex.recommendation;

  // Issue — the observable symptoms, straight from the issue sentence.
  const issue: TreeItem[] = sentences(ex.issue)
    .slice(0, 2)
    .map((text) => ({ text }));

  // Impact — money plus what the account history says is at stake.
  const impact: TreeItem[] = [
    { text: `$${ex.revenueAtRisk.toLocaleString()} revenue at risk` },
    ...ex.customerHistory
      .split("·")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 1)
      .map((text) => ({ text })),
  ];

  // Timeline — live SLA state plus the most recent trail entry.
  const slaMs = new Date(ex.slaDueAt).getTime() - Date.now();
  const timeline: TreeItem[] = [
    slaMs < 0
      ? { text: "SLA breached", tone: "critical" as const }
      : { text: "SLA window open", tone: "default" as const },
  ];
  const lastEvent = ex.audit[ex.audit.length - 1];
  if (lastEvent) {
    timeline.push({ text: lastEvent.action, sub: relative(lastEvent.at) });
  }

  // Recommended — the technician the action names, with live seed facts.
  const tech = namedTechnician(rec.action);
  const recommendedFallback: TreeItem[] = rec.bullets.slice(0, 2).map((text) => ({ text }));

  return {
    action: rec.action,
    issue,
    impact,
    timeline,
    tech,
    recommendedFallback,
  };
}
