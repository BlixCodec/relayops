"use client";

// Screen 2 of 4: the dispatcher workbench. Queue sorted by SLA urgency —
// the screen answers "what needs action now" (docs/decision-doc.md).

import { useState } from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExceptionCard } from "@/components/exception-card";
import { ExceptionDrawer } from "@/components/exception-drawer";
import { useRelay } from "@/lib/store";

export function DispatcherWorkbench() {
  const { exceptions, switchRole } = useRelay();
  const [openId, setOpenId] = useState<string | null>(null);

  const active = exceptions
    .filter((e) => e.status !== "resolved")
    .sort((a, b) => a.slaMinutesRemaining - b.slaMinutesRemaining);
  const resolved = exceptions.filter((e) => e.status === "resolved");
  const selected = exceptions.find((e) => e.id === openId) ?? null;

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-slate-900">
          Today&apos;s exceptions
        </h1>
        <p className="text-xs text-slate-500">
          Sorted by SLA urgency — most at-risk first.
        </p>
      </div>

      {active.length === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center">
          <Inbox
            className="size-5 text-slate-400"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="mt-2 text-sm text-slate-900">
            Nothing needs action — new exceptions land here the moment
            they&apos;re created.
          </p>
          {resolved.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                document
                  .getElementById("resolved-today")
                  ?.scrollIntoView({ block: "start" })
              }
              className="mt-3 border-slate-200 text-slate-900 hover:bg-slate-50"
            >
              Review resolved today
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={switchRole}
              className="mt-3 border-slate-200 text-slate-900 hover:bg-slate-50"
            >
              See the manager view
            </Button>
          )}
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {active.map((e) => (
            <li key={e.id}>
              <ExceptionCard exception={e} onOpen={setOpenId} />
            </li>
          ))}
        </ul>
      )}

      {resolved.length > 0 && (
        <>
          <h2
            id="resolved-today"
            className="mt-8 text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Resolved today
          </h2>
          <ul className="mt-3 space-y-3">
            {resolved.map((e) => (
              <li key={e.id} className="opacity-70">
                <ExceptionCard exception={e} onOpen={setOpenId} />
              </li>
            ))}
          </ul>
        </>
      )}

      <ExceptionDrawer exception={selected} onClose={() => setOpenId(null)} />
    </main>
  );
}
