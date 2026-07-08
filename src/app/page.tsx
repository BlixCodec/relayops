"use client";

// Single route. Which of the four screens renders is driven by store state,
// never by navigation (see CLAUDE.md: no extra pages or nav items).

import { AppShell } from "@/components/app-shell";
import { RoleSelect } from "@/components/role-select";
import { Button } from "@/components/ui/button";
import { useRelay } from "@/lib/store";

export default function Home() {
  const { role } = useRelay();

  return (
    <AppShell>
      {role === null && <RoleSelect />}
      {role === "dispatcher" && <DispatcherPlaceholder />}
      {role === "manager" && <ManagerPlaceholder />}
    </AppShell>
  );
}

// TEMPORARY placeholders below — replaced by the real dispatcher workbench
// (build step 3) and manager decision queue (build step 4). The test control
// exists only to prove state survives role switching.

function DispatcherPlaceholder() {
  const { exceptions, escalate } = useRelay();
  const hero = exceptions.find((e) => e.id === "EX-1042");

  return (
    <main className="p-6">
      <p className="mb-4 inline-block rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
        Temporary placeholder — the dispatcher workbench lands in build step 3.
      </p>
      <h1 className="text-lg font-semibold">Dispatcher workbench</h1>
      <p className="mt-1 text-slate-500">
        {exceptions.filter((e) => e.status !== "resolved").length} exceptions on
        the board.
      </p>
      {hero && (
        <div className="mt-4 max-w-md rounded-lg border border-slate-200 bg-white p-4">
          <p className="font-semibold">{hero.customer}</p>
          <p className="text-slate-500">{hero.issue}</p>
          <p className="mt-2 text-slate-500">
            Status: <span className="font-medium text-slate-900">{hero.status}</span>
            {" · "}audit entries:{" "}
            <span className="font-medium tabular-nums text-slate-900">
              {hero.auditTrail.length}
            </span>
          </p>
          {hero.status === "open" && (
            <Button
              size="sm"
              onClick={() =>
                escalate(
                  hero.id,
                  "Vaccine storage at risk and no certified tech free without overtime. Requesting overtime approval.",
                  "overtime",
                )
              }
              className="mt-3 bg-slate-900 text-white hover:bg-slate-800"
            >
              Test: escalate {hero.id}
            </Button>
          )}
        </div>
      )}
    </main>
  );
}

function ManagerPlaceholder() {
  const { exceptions } = useRelay();
  const waiting = exceptions.filter(
    (e) => e.status === "awaiting-decision" && !e.escalation?.decision,
  );

  return (
    <main className="p-6">
      <p className="mb-4 inline-block rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
        Temporary placeholder — the manager decision queue lands in build step 4.
      </p>
      <h1 className="text-lg font-semibold">Decision queue</h1>
      <p className="mt-1 text-slate-500">
        {waiting.length} escalation{waiting.length === 1 ? "" : "s"} waiting on
        you.
      </p>
      <ul className="mt-4 max-w-md space-y-2">
        {waiting.map((e) => (
          <li
            key={e.id}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <p className="font-semibold">
              {e.id} · {e.customer}
            </p>
            <p className="mt-1 text-slate-500">{e.escalation?.reason}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
