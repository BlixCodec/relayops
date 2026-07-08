"use client";

// Live SLA countdown. slaMinutesRemaining in the seed data is anchored to
// page load; this hook ticks elapsed minutes forward so every SLA readout
// counts down in real time. Display math only — store state never mutates.

import { useEffect, useState } from "react";
import type { Exception } from "@/lib/types";

const loadedAt = Date.now();

export function useMinutesElapsed(): number {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const update = () =>
      setElapsed(Math.floor((Date.now() - loadedAt) / 60_000));
    update();
    const id = setInterval(update, 15_000); // recheck often, re-render per minute
    return () => clearInterval(id);
  }, []);
  return elapsed;
}

export interface SlaInfo {
  /** Minutes left, clamped at 0. Null when the exception is resolved. */
  minutes: number | null;
  met: boolean;
  breached: boolean;
  /** Under an hour (or breached) — render red. */
  urgent: boolean;
}

export function slaInfo(e: Exception, elapsedMinutes: number): SlaInfo {
  if (e.status === "resolved")
    return { minutes: null, met: true, breached: false, urgent: false };
  const minutes = Math.max(0, e.slaMinutesRemaining - elapsedMinutes);
  const breached = minutes === 0;
  return { minutes, met: false, breached, urgent: breached || minutes < 60 };
}
