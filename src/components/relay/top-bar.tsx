import { useState } from "react";
import { Bell, ChevronLeft, ChevronRight, ChevronsUpDown, Search } from "lucide-react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRelayStore } from "@/lib/relay/store";
import { cn } from "@/lib/utils";
import { AvatarCluster, AvatarInitials } from "./avatar-initials";
import { MeridianLogo } from "./brand-logo";
import { NotificationPopoverContent } from "./notification-panel";
import { RoleSwitchDialog } from "./role-switch-dialog";

interface Crumb {
  label: string;
  to?: string;
}

const routeMap: Record<string, Crumb[]> = {
  "/dispatcher/today": [{ label: "Dispatcher" }, { label: "Today" }],
  "/dispatcher": [{ label: "Dispatcher" }, { label: "Workbench" }],
  "/dispatcher/assignments": [{ label: "Dispatcher" }, { label: "Assignments" }],
  "/dispatcher/resolved": [{ label: "Dispatcher" }, { label: "Resolved" }],
  "/manager/today": [{ label: "Regional Operations" }, { label: "Today" }],
  "/manager": [{ label: "Regional Operations" }, { label: "Decision Queue" }],
  "/manager/escalations": [{ label: "Regional Operations" }, { label: "Escalations" }],
  "/manager/decisions": [{ label: "Regional Operations" }, { label: "Decisions" }],
};

export function TopBar() {
  const router = useRouter();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const crumbs = routeMap[path] ?? [{ label: "RelayOps" }];
  const { role, currentUser, toggleCommand, notifications } = useRelayStore();
  const [switchOpen, setSwitchOpen] = useState(false);
  const effectiveRole = path.startsWith("/manager") ? "manager" : role;
  const user = effectiveRole === "dispatcher" ? currentUser.dispatcher : currentUser.manager;
  const roleLabel = effectiveRole === "dispatcher" ? "Dispatcher" : "Regional Operations";
  const unread = notifications.filter((n) => !n.read);
  const urgentUnread = unread.some((n) => n.kind === "escalation" || n.kind === "sla");
  const dotClass = urgentUnread ? "bg-violet-600" : "bg-emerald-500";
  const searchButton = (
    <button
      type="button"
      onClick={() => toggleCommand(true)}
      className="flex h-9 w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-[12px] text-slate-500 shadow-sm shadow-slate-950/[0.02] transition-colors hover:bg-slate-50"
      aria-label="Search"
    >
      <Search className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">
        <span className="sm:hidden">Search</span>
        <span className="hidden sm:inline">Search exceptions, technicians, branches</span>
      </span>
      <kbd className="ml-auto hidden rounded border border-slate-200 bg-slate-50 px-1 py-0.5 font-mono text-[10px] text-slate-500 sm:inline">
        ⌘K
      </kbd>
    </button>
  );
  const notificationsButton = (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label={urgentUnread ? "Notifications — urgent items" : "Notifications"}
        >
          <Bell className="h-4 w-4" />
          {unread.length > 0 ? (
            <span
              className={cn(
                "absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ring-2 ring-white",
                dotClass,
                urgentUnread && "animate-pulse",
              )}
            />
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-auto rounded-xl border-slate-200 p-0 shadow-xl"
      >
        <NotificationPopoverContent />
      </PopoverContent>
    </Popover>
  );

  return (
    <>
      <header className="shrink-0 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="flex min-h-12 items-center gap-2 border-b border-slate-50 px-3 py-1.5 md:px-5">
          <button
            type="button"
            onClick={() => router.history.back()}
            aria-label="Back"
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => router.history.forward()}
            aria-label="Forward"
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
          <SidebarTrigger
            aria-label="Toggle sidebar"
            className="h-8 w-8 shrink-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden"
          />
          <nav className="ml-1 flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[11px] [scrollbar-width:none] md:flex-[0_1_auto] [&::-webkit-scrollbar]:hidden">
            <Link
              to="/"
              className="flex h-5 shrink-0 items-center rounded-sm hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Meridian Field Services"
            >
              <MeridianLogo className="h-6 w-auto max-w-[190px]" />
            </Link>
            {crumbs.map((c, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <span key={i} className="flex shrink-0 items-center gap-1.5">
                  <span className="text-slate-300">/</span>
                  <span className={cn(isLast ? "font-medium text-slate-800" : "text-slate-500")}>
                    {c.label}
                  </span>
                </span>
              );
            })}
          </nav>

          <div className="hidden min-w-[240px] max-w-[640px] flex-1 md:flex">{searchButton}</div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <AvatarCluster
              names={[
                user,
                "Jordan Fields",
                "Priya Anand",
                "Marcus Reyes",
                "Dana Whitfield",
                "Sam Okafor",
                "Lena Kowalski",
              ]}
              size={24}
              activeNames={[user]}
            />
            <button
              type="button"
              onClick={() => setSwitchOpen(true)}
              className="hidden h-9 shrink-0 items-center gap-2.5 rounded-full bg-slate-50/80 px-3 text-left transition-colors hover:bg-slate-100 sm:flex"
              aria-label="Switch role"
            >
              <AvatarInitials name={user} size={24} />
              <span className="min-w-0">
                <span className="block whitespace-nowrap text-[13px] font-semibold leading-4 text-slate-900">
                  {roleLabel}
                </span>
                <span className="hidden max-w-28 truncate text-[11.5px] leading-3.5 text-slate-500 lg:block">
                  {user}
                </span>
              </span>
              <ChevronsUpDown className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
            </button>
            {notificationsButton}
          </div>
        </div>

        <div className="border-b border-slate-50 px-3 py-2 md:hidden">{searchButton}</div>
      </header>
      <RoleSwitchDialog open={switchOpen} onOpenChange={setSwitchOpen} />
    </>
  );
}
