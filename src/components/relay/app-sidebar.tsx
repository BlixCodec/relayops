import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  ClipboardList,
  FileCheck2,
  Home,
  LifeBuoy,
  ListChecks,
  Radar,
  Star,
  Sun,
} from "lucide-react";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRelayStore } from "@/lib/relay/store";
import { branches } from "@/lib/relay/seed";
import { BrandLockup, BrandMark } from "./brand-logo";
import { FacilityPhoto } from "./location-badge";
import { ProductGuide } from "./product-guide";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/relay/types";

const dispatcherNav = [
  { title: "Today", to: "/dispatcher/today", icon: Sun },
  { title: "Workbench", to: "/dispatcher", icon: Radar },
  { title: "My Assignments", to: "/dispatcher/assignments", icon: ClipboardList },
  { title: "Resolved", to: "/dispatcher/resolved", icon: FileCheck2 },
] as const;

const managerNav = [
  { title: "Today", to: "/manager/today", icon: Sun },
  { title: "Decision Queue", to: "/manager", icon: ListChecks },
  { title: "All Escalations", to: "/manager/escalations", icon: ClipboardList },
  { title: "Decisions", to: "/manager/decisions", icon: FileCheck2 },
] as const;

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const { exceptions, openDrawer, toggleFavorite, activeBranchId, setBranch } = useRelayStore();
  const [guideOpen, setGuideOpen] = useState(false);

  const isActive = (to: string) => {
    if (to === "/dispatcher" || to === "/manager") return currentPath === to;
    return currentPath === to || currentPath.startsWith(to + "/");
  };

  const effectiveRole: Role = currentPath.startsWith("/manager") ? "manager" : "dispatcher";
  const nav = effectiveRole === "dispatcher" ? dispatcherNav : managerNav;
  const navLabel = effectiveRole === "dispatcher" ? "Dispatcher" : "Regional Operations";

  const favorites = exceptions.filter((e) => (e.favoritedBy ?? []).includes(effectiveRole));

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r border-slate-200 transition-[width] duration-300 ease-out"
      >
        <SidebarHeader className="gap-2 border-b border-slate-200 px-3 py-3 group-data-[collapsible=icon]:px-2">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1.5">
            <BrandMark className="hidden h-6 w-6 group-data-[collapsible=icon]:block" />
            <BrandLockup className="h-7 w-auto group-data-[collapsible=icon]:hidden" />
            <SidebarTrigger
              className="ml-auto h-6 w-6 shrink-0 text-slate-500 hover:text-slate-900 group-data-[collapsible=icon]:ml-0"
              aria-label="Toggle sidebar"
            />
          </div>
          {currentPath === "/dispatcher/today" ? (
            <div className="group-data-[collapsible=icon]:hidden">
              <Select value={activeBranchId} onValueChange={setBranch}>
                <SelectTrigger
                  aria-label="Active dispatcher branch"
                  className="h-8 w-full border-slate-200 bg-slate-50 text-[12px] font-medium text-slate-700"
                >
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id} className="text-[12px]">
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </SidebarHeader>

        <SidebarContent className="gap-0 overflow-x-hidden px-2 py-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
          <SidebarGroup className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:py-2">
            <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              {navLabel}
            </SidebarGroupLabel>
            <SidebarGroupContent className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
              <SidebarMenu className="relative ml-1 gap-0 before:absolute before:bottom-4 before:left-[17px] before:top-4 before:w-px before:bg-slate-200 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:before:hidden">
                {nav.map((item) => (
                  <NavRow key={item.title} item={item} active={isActive(item.to)} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              <Star className="h-3 w-3" /> Favorites
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {favorites.length === 0 ? (
                <div className="px-2 py-1.5 text-[11px] text-slate-400">
                  Star an exception to pin it here.
                </div>
              ) : (
                <SidebarMenu className="relative ml-1 gap-0 before:absolute before:bottom-4 before:left-[17px] before:top-4 before:w-px before:bg-slate-200">
                  {favorites.map((ex) => (
                    <SidebarMenuItem key={ex.id}>
                      <div className="group/fav relative flex items-center gap-1 py-0.5 before:absolute before:left-[17px] before:top-1/2 before:h-3 before:w-4 before:-translate-y-3 before:rounded-bl-lg before:border-b before:border-l before:border-slate-200">
                        <SidebarMenuButton
                          onClick={() => openDrawer(ex.id)}
                          title={`Open ${ex.customer}`}
                          className="relative z-10 ml-5 h-9 flex-1 gap-2 rounded-lg px-1.5 text-[13px] text-slate-700 hover:bg-slate-100"
                        >
                          <FacilityPhoto name={ex.customer} size={22} className="rounded-full" />
                          <span className="truncate">{ex.customer}</span>
                        </SidebarMenuButton>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(ex.id);
                            toast(`${ex.customer} removed from favorites.`);
                          }}
                          aria-label="Remove favorite"
                          className="mr-1 rounded p-1 text-amber-500 opacity-0 transition-opacity hover:bg-slate-100 group-hover/fav:opacity-100"
                        >
                          <Star className="h-3 w-3 fill-current" />
                        </button>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-1 border-t border-slate-200 px-2 py-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
          <SidebarMenu className="group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:items-center">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Role selector"
                className="h-8 gap-2 px-2 text-[13px] text-slate-700 hover:bg-slate-100 group-data-[collapsible=icon]:!flex group-data-[collapsible=icon]:!items-center group-data-[collapsible=icon]:!justify-center"
              >
                <Link to="/">
                  <Home className="h-3.5 w-3.5" />
                  <span className="group-data-[collapsible=icon]:sr-only">Role selector</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setGuideOpen(true)}
                tooltip="Need Help"
                className="h-8 gap-2 px-2 text-[13px] text-slate-700 hover:bg-slate-100 group-data-[collapsible=icon]:!flex group-data-[collapsible=icon]:!items-center group-data-[collapsible=icon]:!justify-center"
              >
                <LifeBuoy className="h-3.5 w-3.5" />
                <span className="group-data-[collapsible=icon]:sr-only">Need Help</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <ProductGuide open={guideOpen} onOpenChange={setGuideOpen} />
    </>
  );
}

function NavRow({
  item,
  active,
}: {
  item: { title: string; to: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <SidebarMenuItem className="relative py-0.5 before:absolute before:left-[17px] before:top-1/2 before:h-3 before:w-4 before:-translate-y-3 before:rounded-bl-lg before:border-b before:border-l before:border-slate-200 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:before:hidden">
      <SidebarMenuButton
        asChild
        tooltip={item.title}
        className={cn(
          "relative z-10 ml-5 h-8 gap-2 rounded-lg px-2 text-[13px] group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:!flex group-data-[collapsible=icon]:!h-8 group-data-[collapsible=icon]:!w-8 group-data-[collapsible=icon]:!items-center group-data-[collapsible=icon]:!justify-center",
          active
            ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-50"
            : "text-slate-700 hover:bg-slate-100",
        )}
      >
        <Link to={item.to}>
          <Icon className={cn("h-3.5 w-3.5", active ? "text-indigo-600" : "text-slate-500")} />
          <span className="group-data-[collapsible=icon]:sr-only">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
