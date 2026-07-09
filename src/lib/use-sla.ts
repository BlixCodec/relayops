"use client";

// Live SLA countdown. slaMinutesRemaining in the seed data is anchored to
// page load; one shared module-level ticker (single setInterval, no matter
// how many readouts subscribe) advances elapsed seconds so every SLA readout
// counts down visibly. Display math only — store state never mutates.

import { useSyncExternalStore } from "react";
import type { Exception } from "@/lib/types";

const loadedAt = Date.now();

let elapsedSeconds = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function tick() {
  const next = Math.floor((Date.now() - loadedAt) / 1000);
  if (next !== elapsedSeconds) {
    elapsedSeconds = next;
    listeners.forEach((notify) => notify());
  }
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  if (intervalId === null) intervalId = setInterval(tick, 1000);
  return () => {
    listeners.delete(notify);
    if (listeners.size === 0 && intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

export function useSecondsElapsed(): number {
  return useSyncExternalStore(
    subscribe,
    () => elapsedSeconds,
    () => 0, // server snapshot — SLA readouts only render client-side
  );
}

// Urgency thresholds in minutes (single source of truth).
export const SLA_THRESHOLDS = {
  critical: 15, // red + pulse
  warning: 60, // amber
};

export type SlaTone = "met" | "breached" | "critical" | "warning" | "calm";

export interface SlaInfo {
  /** Seconds left, clamped at 0. Null when the exception is resolved. */
  seconds: number | null;
  tone: SlaTone;
  met: boolean;
  breached: boolean;
}

export function slaInfo(e: Exception, elapsed: number): SlaInfo {
  if (e.status === "resolved")
    return { seconds: null, tone: "met", met: true, breached: false };
  const seconds = Math.max(0, e.slaMinutesRemaining * 60 - elapsed);
  const tone: SlaTone =
    seconds === 0
      ? "breached"
      : seconds < SLA_THRESHOLDS.critical * 60
        ? "critical"
        : seconds < SLA_THRESHOLDS.warning * 60
          ? "warning"
          : "calm";
  return { seconds, tone, met: false, breached: seconds === 0 };
}

// "41m 52s" under an hour, "1h 33m 20s" above (Lovable port).
export function formatSlaClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  return `${m}m ${pad(s)}s`;
}
