import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/relay/page-header";
import { PriorityBadge } from "@/components/relay/priority-badge";
import { StatusPill } from "@/components/relay/status-pill";
import { useRelayStore, branchById, techById } from "@/lib/relay/store";
import { AvatarWithTooltip } from "@/components/relay/avatar-initials";
import { FacilityPhoto } from "@/components/relay/location-badge";

export const Route = createFileRoute("/_app/dispatcher/resolved")({
  component: Resolved,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Resolved() {
  const exceptions = useRelayStore((s) => s.exceptions);
  const openDrawer = useRelayStore((s) => s.openDrawer);
  const rows = exceptions.filter((e) => e.status === "resolved");

  return (
    <>
      <PageHeader
        title="Resolved exceptions"
        guidance="Review completed work and operational outcomes."
      />
      <div className="p-4 sm:p-6">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
          <table className="w-full min-w-[980px] table-fixed text-sm">
            <colgroup>
              <col className="w-[270px]" />
              <col className="w-[250px]" />
              <col className="w-[130px]" />
              <col className="w-[110px]" />
              <col className="w-[120px]" />
              <col className="w-[150px]" />
              <col className="w-[120px]" />
            </colgroup>
            <thead className="border-b border-slate-200 bg-slate-50/60 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <Th>Customer</Th>
                <Th>Issue</Th>
                <Th>Branch</Th>
                <Th>Priority</Th>
                <Th>Resolved at</Th>
                <Th>Resolved by</Th>
                <Th>Outcome</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((e) => {
                const branch = branchById(e.branchId);
                const tech = techById(e.assignedTech);
                const resolvedAudit =
                  [...e.audit].reverse().find((a) => a.action.toLowerCase().includes("resolved")) ??
                  e.audit[e.audit.length - 1];
                return (
                  <tr
                    key={e.id}
                    onClick={() => openDrawer(e.id)}
                    className="cursor-pointer transition-colors hover:bg-slate-50/80"
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        <FacilityPhoto name={e.customer} size={42} />
                        <div className="min-w-0">
                          <div className="text-[13.5px] font-semibold leading-snug text-slate-900">
                            {e.customer}
                          </div>
                          <div className="mt-1 text-[11px] leading-tight text-slate-400">
                            {e.id}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-[13px] leading-snug text-slate-600">{e.issueType}</Td>
                    <Td className="text-[13px] text-slate-700">
                      <span className="inline-flex items-center gap-2">
                        <FacilityPhoto
                          name={branch?.name ?? "Branch"}
                          size={24}
                          className="rounded-full"
                        />
                        {branch?.name}
                      </span>
                    </Td>
                    <Td>
                      <PriorityBadge priority={e.priority} />
                    </Td>
                    <Td className="tnum text-[13px] leading-snug text-slate-600">
                      <span suppressHydrationWarning>
                        {formatDate(resolvedAudit?.at ?? e.createdAt)}
                      </span>
                    </Td>
                    <Td className="text-[13px] text-slate-700">
                      <span className="inline-flex items-center gap-2">
                        <AvatarWithTooltip name={tech?.name ?? e.ownerDispatcher} size={20} />
                        <span>{tech?.name ?? e.ownerDispatcher}</span>
                      </span>
                    </Td>
                    <Td>
                      <StatusPill status="resolved" />
                    </Td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    No resolved exceptions yet.
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
