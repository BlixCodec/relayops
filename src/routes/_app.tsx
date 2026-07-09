import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/relay/app-sidebar";
import { TopBar } from "@/components/relay/top-bar";
import { ExceptionDrawer } from "@/components/relay/exception-drawer";
import { CommandSearch } from "@/components/relay/command-search";
import { MobileBottomNav } from "@/components/relay/mobile-bottom-nav";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <SidebarInset className="flex min-h-0 min-w-0 flex-col bg-background">
          <div className="min-h-0 flex-1 p-0 sm:p-3">
            <div className="flex h-full min-h-0 flex-col overflow-hidden border-0 bg-white sm:rounded-2xl sm:border sm:border-slate-200/70 sm:shadow-panel">
              {/* Pinned header cluster: breadcrumbs + search stay fixed while content scrolls. */}
              <div className="z-30 shrink-0 bg-white">
                <TopBar />
              </div>
              <main className="min-h-0 flex-1 overflow-y-auto pb-20 md:pb-0">
                <Outlet />
              </main>
            </div>
          </div>
        </SidebarInset>
      </div>
      <ExceptionDrawer />
      <CommandSearch />
      <MobileBottomNav />
    </SidebarProvider>
  );
}
