"use client";

// Live SLA countdown. slaMinutesRemaining in the seed data is anchored to
// page load; this hook ticks elapsed seconds forward so every SLA readout
// counts down visibly (mm:ss). Display math only — store state never mutates.

import { useEffect, useState } from "react";
import type { Exception } from "@/lib/types";

const loadedAt = Date.now();

export function useSecondsElapsed(): number {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const update = () =>
      setElapsed(Math.floor((Date.now() - loadedAt) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return elapsed;
}

export interface SlaInfo {
  /** Seconds left, clamped at 0. Null when the exception is resolved. */
  seconds: number | null;
  met: boolean;
  breached: boolean;
  /** Under an hour (or breached) — render red. */
  urgent: boolean;
}

export function slaInfo(e: Exception, elapsedSeconds: number): SlaInfo {
  if (e.status === "resolved")
    return { seconds: null, met: true, breached: false, urgent: false };
  const seconds = Math.max(0, e.slaMinutesRemaining * 60 - elapsedSeconds);
  const breached = seconds === 0;
  return { seconds, met: false, breached, urgent: breached || seconds < 3600 };
}

/** 2512 -> "41:52" (minutes:seconds, tabular-nums friendly). */
export function formatSlaClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
