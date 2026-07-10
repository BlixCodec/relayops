import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/relay/page-header";
import { StatusPill } from "@/components/relay/status-pill";
import { SlaCountdown } from "@/components/relay/sla-countdown";
import { EmptyState, emptyStateIllustrations } from "@/components/relay/empty-state";
import { useRelayStore, branchById, techById } from "@/lib/relay/store";
import { AvatarWithTooltip } from "@/components/relay/avatar-initials";
import { FacilityPhoto } from "@/components/relay/location-badge";

export const Route = createFileRoute("/_app/dispatcher/assignments")({
  component: MyAssignments,
});

function nextAction(status: string): string {
  switch (status) {
    case "open":
      return "Assign a technician";
    case "assigned":
      return "Monitor SLA";
    case "escalated":
      return "Wait for decision";
    case "approved":
      return "Dispatch and confirm";
    case "denied":
      return "Follow denial instruction";
    default:
      return "·";
  }
}

function MyAssignments() {
  const { exceptions, currentUser, openDrawer } = useRelayStore();
  const [tab, setTab] = useState<"mine" | "team">("mine");

  const mine = useMemo(
    () =>
      exceptions.filter(
        (e) => e.ownerDispatcher === currentUser.dispatcher && e.status !== "resolved",
      ),
    [exceptions, currentUser],
  );
  const team = useMemo(() => exceptions.filter((e) => e.status !== "resolved"), [exceptions]);

  const rows = tab === "mine" ? mine : team;

  return (
    <>
      <PageHeader
        title="Assignments"
        guidance="Track active assignments across the team."
        actions={
          <Tabs value={tab} onValueChange={(v) => setTab(v as "mine" | "team")}>
            <TabsList className="h-8">
              <TabsTrigger value="mine" className="text-xs">
                My assignments
              </TabsTrigger>
              <TabsTrigger value="team" className="text-xs">
                Team assignments
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="p-4 sm:p-6">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
          <table className="w-full min-w-[960px] table-fixed text-sm">
            <colgroup>
              <col className="w-[270px]" />
              <col className="w-[250px]" />
              <col className="w-[140px]" />
              <col className="w-[160px]" />
              <col className="w-[120px]" />
              <col className="w-[180px]" />
            </colgroup>
            <thead className="border-b border-slate-200 bg-slate-50/60 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <Th>Customer</Th>
                <Th>Issue</Th>
                <Th>SLA</Th>
                <Th>Technician</Th>
                <Th>Status</Th>
                <Th>Next action</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((e) => {
                const branch = branchById(e.branchId);
                const tech = techById(e.assignedTech);
                return (
                  <tr
                    key={e.id}
                    tabIndex={0}
                    aria-label={`Open ${e.customer} assignment`}
                    onClick={() => openDrawer(e.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openDrawer(e.id);
                      }
                    }}
                    className="cursor-pointer transition-colors hover:bg-slate-50/80 focus:outline-none focus-visible:bg-indigo-50/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        <FacilityPhoto name={e.customer} size={42} />
                        <div className="min-w-0">
                          <div className="text-[13.5px] font-semibold leading-snug text-slate-900">
                            {e.customer}
                          </div>
                          <div className="mt-1 text-[11px] leading-tight text-slate-400">
                            {branch?.name} · {e.id}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-[13px] leading-snug text-slate-600">{e.issueType}</Td>
                    <Td className="text-[12px]">
                      <SlaCountdown dueAt={e.slaDueAt} />
                    </Td>
                    <Td className="text-[13px] text-slate-700">
                      {tech ? (
                        <span className="inline-flex items-center gap-2">
                          <AvatarWithTooltip name={tech.name} size={20} />
                          <span>{tech.name}</span>
                        </span>
                      ) : (
                        "·"
                      )}
                    </Td>
                    <Td>
                      <StatusPill status={e.status} />
                    </Td>
                    <Td className="text-[13px] leading-snug text-slate-600">
                      {nextAction(e.status)}
                    </Td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      framed={false}
                      illustration={emptyStateIllustrations.noAssignments}
                      artworkLabel="No assignments have been given yet. New work will appear here automatically."
                      className="py-8"
                      imageClassName="max-w-[520px]"
                    />
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left font-medium">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-4 align-middle ${className ?? ""}`}>{children}</td>;
}
