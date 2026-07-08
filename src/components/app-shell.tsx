"use client";

// Slim top bar per docs/design-spec.md: product name left, role badge +
// "Switch role" right. No sidebar — four screens don't need one.

import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRelay } from "@/lib/store";

const roleLabels = {
  dispatcher: "Dispatcher",
  manager: "Operations Manager",
} as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { role, switchRole } = useRelay();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50">
      <header className="flex h-12 items-center justify-between border-b border-slate-200 bg-white px-6">
        <span className="text-sm font-semibold text-slate-900">RelayOps</span>
        {role && (
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              {roleLabels[role]}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={switchRole}
              className="gap-1.5 border-slate-200 text-slate-900 hover:bg-slate-50"
            >
              <ArrowLeftRight className="size-3.5" />
              Switch role
            </Button>
          </div>
        )}
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
