import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/relay/page-header";
import { PriorityBadge } from "@/components/relay/priority-badge";
import { StatusPill } from "@/components/relay/status-pill";
import { SlaCountdown } from "@/components/relay/sla-countdown";
import { AvatarInitials, PersonMentionText } from "@/components/relay/avatar-initials";
import { EmptyState, emptyStateIllustrations } from "@/components/relay/empty-state";
import { FacilityPhoto } from "@/components/relay/location-badge";
import { Input } from "@/components/ui/input";
import { useRelayStore, branchById } from "@/lib/relay/store";
import { cn } from "@/lib/utils";
import type { ExceptionStatus } from "@/lib/relay/types";

export const Route = createFileRoute("/_app/manager/escalations")({
  component: AllEscalations,
});

const filters: { key: "all" | ExceptionStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "escalated", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "denied", label: "Denied" },
  { key: "resolved", label: "Resolved" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function AllEscalations() {
  const { exceptions, openDrawer } = useRelayStore();
  const [filter, setFilter] = useState<"all" | ExceptionStatus>("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const withEsc = exceptions.filter((e) => e.escalation);
    const byStatus = filter === "all" ? withEsc : withEsc.filter((e) => e.status === filter);
    if (!q.trim()) return byStatus;
    const needle = q.toLowerCase();
    return byStatus.filter(
      (e) =>
        e.customer.toLowerCase().includes(needle) ||
        e.issueType.toLowerCase().includes(needle) ||
        e.escalation?.reason.toLowerCase().includes(needle),
    );
  }, [exceptions, filter, q]);

  return (
    <>
      <PageHeader
        title="All escalations"
        guidance="Full history of escalations across every branch."
        className="bg-slate-50/85 backdrop-blur-md"
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-md border border-slate-200 bg-white p-0.5">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded px-2.5 py-1 text-[12px] transition-colors",
                  filter === f.key ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative ml-auto">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              name="escalation-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search customer, reason…"
              className="h-8 w-[240px] pl-7 text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/60 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <Th>Customer</Th>
                <Th>Branch</Th>
                <Th>Priority</Th>
                <Th>Escalation reason</Th>
                <Th>Status</Th>
                <Th>SLA</Th>
                <Th>Escalated at</Th>
                <Th>Escalated by</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((e) => {
                const branch = branchById(e.branchId);
                return (
                  <tr
                    key={e.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => openDrawer(e.id)}
                  >
                    <Td>
                      <div className="flex min-w-[230px] items-center gap-3">
                        <FacilityPhoto name={e.customer} size={38} className="rounded-full" />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900">{e.customer}</div>
                          <div className="text-[11px] text-slate-400">{e.id}</div>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-slate-700">
                      <span className="inline-flex min-w-[160px] items-center gap-2">
                        <FacilityPhoto
                          name={branch?.name ?? "Branch"}
                          size={24}
                          className="rounded-full"
                        />
                        <span>{branch?.name}</span>
                      </span>
                    </Td>
                    <Td>
                      <PriorityBadge priority={e.priority} />
                    </Td>
                    <Td className="max-w-[320px] truncate text-slate-600">
                      {e.escalation?.reason ? (
                        <PersonMentionText text={e.escalation.reason} />
                      ) : null}
                    </Td>
                    <Td>
                      <StatusPill status={e.status} />
                    </Td>
                    <Td>
                      <SlaCountdown dueAt={e.slaDueAt} />
                    </Td>
                    <Td className="tnum text-slate-600">{formatDate(e.escalation!.at)}</Td>
                    <Td className="text-slate-700">
                      <span className="inline-flex min-w-[150px] items-center gap-2">
                        <AvatarInitials name={e.escalation?.by ?? "Dispatcher"} size={24} />
                        <span>{e.escalation?.by}</span>
                      </span>
                    </Td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8">
                    <EmptyState
                      framed={false}
                      illustration={emptyStateIllustrations.noSearchResults}
                      artworkLabel="No escalations matched the current filters."
                      message="No escalations match your filters."
                      className="py-8"
                      imageClassName="max-w-[620px]"
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
  return <td className={`px-4 py-3 align-middle ${className ?? ""}`}>{children}</td>;
}
