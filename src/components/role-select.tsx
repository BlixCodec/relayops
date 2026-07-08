"use client";

// Screen 1 of 4: role select. Two cards, one-line description of what each
// role decides, and the stub disclosure footnote (per docs/decision-doc.md).

import { ClipboardList, Radio } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRelay } from "@/lib/store";
import type { Role } from "@/lib/types";

const roles: {
  role: Role;
  title: string;
  decides: string;
  icon: typeof Radio;
}[] = [
  {
    role: "dispatcher",
    title: "Dispatcher",
    decides:
      "Triage today's exceptions, assign the right technician, escalate what exceeds your authority.",
    icon: Radio,
  },
  {
    role: "manager",
    title: "Operations Manager",
    decides:
      "Work the queue of escalations that need your sign-off — approve or deny with instructions.",
    icon: ClipboardList,
  },
];

export function RoleSelect() {
  const { selectRole } = useRelay();

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <h1 className="text-lg font-semibold text-slate-900">
        Who's working right now?
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Pick a role to open its workspace. You can switch anytime from the top
        bar.
      </p>

      <div className="mt-8 grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        {roles.map(({ role, title, decides, icon: Icon }) => (
          <Card
            key={role}
            role="button"
            tabIndex={0}
            onClick={() => selectRole(role)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") selectRole(role);
            }}
            className="cursor-pointer gap-3 rounded-lg border-slate-200 p-4 shadow-none transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <Icon className="size-5 text-indigo-600" aria-hidden />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{decides}</p>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-xs text-slate-500">
        Stubbed login for evaluation — no authentication by design.
      </p>
    </main>
  );
}
