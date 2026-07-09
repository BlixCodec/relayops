"use client";

// Top bar, matched to the Lovable prototype's crumb treatment: company /
// role area / surface in 11px, white bar over the canvas. The prototype's
// search field and notification bell are deliberately absent — search
// doesn't exist and notifications are stubbed by design (CLAUDE.md).

import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRelay } from "@/lib/store";
import { cn } from "@/lib/utils";

const crumbsFor = {
  dispatcher: ["Dispatcher", "Workbench"],
  manager: ["Regional Ops", "Decision Queue"],
} as const;

const roleLabels = {
  dispatcher: "Dispatcher",
  manager: "Operations Manager",
} as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { role, switchRole } = useRelay();
  const crumbs = role ? crumbsFor[role] : [];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-1.5 border-b border-slate-100 bg-white/95 px-4 backdrop-blur md:px-6">
        <nav className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
          <span className="shrink-0 font-medium text-slate-800">
            Meridian Field Services
          </span>
          {crumbs.map((label, i) => (
            <span key={label} className="flex shrink-0 items-center gap-1.5">
              <span className="text-slate-300">/</span>
              <span
                className={cn(
                  i === crumbs.length - 1
                    ? "font-medium text-slate-800"
                    : "text-slate-500",
                )}
              >
                {label}
              </span>
            </span>
          ))}
        </nav>
        {role && (
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] leading-none font-medium text-indigo-700">
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
