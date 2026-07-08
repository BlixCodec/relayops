"use client";

// Single route. Which of the four screens renders is driven by store state,
// never by navigation (see CLAUDE.md: no extra pages or nav items).

import { AppShell } from "@/components/app-shell";
import { DecisionQueue } from "@/components/decision-queue";
import { DispatcherWorkbench } from "@/components/dispatcher-workbench";
import { RoleSelect } from "@/components/role-select";
import { useRelay } from "@/lib/store";

export default function Home() {
  const { role } = useRelay();

  return (
    <AppShell>
      {role === null && <RoleSelect />}
      {role === "dispatcher" && <DispatcherWorkbench />}
      {role === "manager" && <DecisionQueue />}
    </AppShell>
  );
}
