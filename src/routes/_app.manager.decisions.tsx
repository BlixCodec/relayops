import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/relay/page-header";
import { StatusPill } from "@/components/relay/status-pill";
import { AvatarInitials } from "@/components/relay/avatar-initials";
import { EmptyState, emptyStateIllustrations } from "@/components/relay/empty-state";
import { FacilityPhoto } from "@/components/relay/location-badge";
import { useRelayStore, branchById } from "@/lib/relay/store";
import type { Exception } from "@/lib/relay/types";

export const Route = createFileRoute("/_app/manager/decisions")({
  component: Decisions,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function decisionLabel(e: Exception) {
  const reason = e.escalation?.reason ?? "";
  if (/transfer|cross-branch/i.test(reason)) return "Cross-branch transfer";
  if (/overtime/i.test(reason)) return "Overtime authorization";
  if (/credit|goodwill/i.test(reason)) return "Goodwill credit";
  return "Operational decision";
}

function Decisions() {
  const { exceptions, decisionHistory } = useRelayStore();

  const rows = useMemo(() => {
    const live = exceptions.filter((e) => e.decision);
    return [...live, ...decisionHistory].sort(
      (a, b) => new Date(b.decision!.at).getTime() - new Date(a.decision!.at).getTime(),
    );
  }, [exceptions, decisionHistory]);

  return (
    <>
      <PageHeader
        title="Decisions"
        guidance="Every approval and denial, with the decision-maker on record."
        className="bg-slate-50/85 backdrop-blur-md"
      />
      <div className="p-4 sm:p-6">
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[1040px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/60 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <Th>Decision</Th>
                <Th>Customer</Th>
                <Th>Branch</Th>
                <Th>Decided by</Th>
                <Th>Date &amp; time</Th>
                <Th>Outcome</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((e) => {
                const branch = branchById(e.branchId);
                return (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <Td>
                      <div className="flex min-w-[230px] items-center gap-3">
                        <FacilityPhoto name={e.customer} size={38} className="rounded-full" />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900">
                            {decisionLabel(e)}
                          </div>
                          <div className="text-[11px] text-slate-400">{e.id}</div>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-slate-800">
                      <span className="inline-flex min-w-[210px] items-center gap-2">
                        <FacilityPhoto name={e.customer} size={24} className="rounded-full" />
                        <span>{e.customer}</span>
                      </span>
                    </Td>
                    <Td className="text-slate-700">
                      <span className="inline-flex min-w-[150px] items-center gap-2">
                        <FacilityPhoto
                          name={branch?.name ?? "Branch"}
                          size={24}
                          className="rounded-full"
                        />
                        <span>{branch?.name}</span>
                      </span>
                    </Td>
                    <Td className="text-slate-700">
                      <span className="inline-flex min-w-[150px] items-center gap-2">
                        <AvatarInitials name={e.decision?.by ?? "Regional Operations"} size={24} />
                        <span>{e.decision?.by}</span>
                      </span>
                    </Td>
                    <Td className="tnum text-slate-600">{formatDate(e.decision!.at)}</Td>
                    <Td>
                      <StatusPill
                        status={e.decision?.outcome === "approved" ? "approved" : "denied"}
                      />
                    </Td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <EmptyState
                      framed={false}
                      illustration={emptyStateIllustrations.regionalOperationsClear}
                      artworkLabel="No manager decisions have been recorded yet."
                      message="No decisions have been recorded yet."
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
