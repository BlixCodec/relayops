import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, FileCheck2, Gauge, ListChecks, Sun } from "lucide-react";
import { useRelayStore } from "@/lib/relay/store";
import { AvatarInitials } from "./avatar-initials";
import { RoleSwitchDialog } from "./role-switch-dialog";
import { cn } from "@/lib/utils";

const dispatcherNav = [
  { title: "Today", to: "/dispatcher/today", icon: Sun },
  { title: "Work", to: "/dispatcher", icon: Gauge },
  { title: "Mine", to: "/dispatcher/assignments", icon: ClipboardList },
  { title: "Done", to: "/dispatcher/resolved", icon: FileCheck2 },
] as const;

const managerNav = [
  { title: "Today", to: "/manager/today", icon: Sun },
  { title: "Queue", to: "/manager", icon: ListChecks },
  { title: "Escs", to: "/manager/escalations", icon: ClipboardList },
  { title: "Log", to: "/manager/decisions", icon: FileCheck2 },
] as const;

export function MobileBottomNav() {
  const { role, currentUser } = useRelayStore();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const effectiveRole = path.startsWith("/manager") ? "manager" : role;
  const nav = effectiveRole === "dispatcher" ? dispatcherNav : managerNav;
  const user = effectiveRole === "dispatcher" ? currentUser.dispatcher : currentUser.manager;
  const [switchOpen, setSwitchOpen] = useState(false);

  const isActive = (to: string) => {
    if (to === "/dispatcher" || to === "/manager") return path === to;
    return path === to || path.startsWith(to + "/");
  };

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Primary"
      >
        {nav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 text-[10.5px]",
                active ? "text-indigo-600" : "text-slate-500",
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-indigo-600")} />
              <span className={cn(active && "font-medium")}>{item.title}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setSwitchOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 py-2 text-[10.5px]",
            switchOpen ? "text-indigo-600" : "text-slate-500",
          )}
          aria-label="Switch profile"
        >
          <AvatarInitials name={user} size={20} />
          <span className={cn(switchOpen && "font-medium")}>{user.split(" ")[0]}</span>
        </button>
      </nav>
      <RoleSwitchDialog open={switchOpen} onOpenChange={setSwitchOpen} />
    </>
  );
}
