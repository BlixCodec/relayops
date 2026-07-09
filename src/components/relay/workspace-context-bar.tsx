import { useEffect, useMemo, useState } from "react";
import { MeridianLogo } from "@/components/relay/brand-logo";
import { useRelayStore, branchById } from "@/lib/relay/store";

export function WorkspaceContextBar() {
  const { exceptions, activeBranchId } = useRelayStore();
  const branch = branchById(activeBranchId);

  const { active, pending } = useMemo(() => {
    const active = exceptions.filter(
      (e) => e.status !== "resolved" && e.status !== "denied" && e.status !== "approved",
    ).length;
    const pending = exceptions.filter((e) => e.status === "escalated").length;
    return { active, pending };
  }, [exceptions]);

  const [today, setToday] = useState<string>("");
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    );
  }, []);

  const sep = <span className="mx-3 text-slate-300">·</span>;

  return (
    <div className="flex h-8 items-center overflow-x-auto px-5 text-[11px] text-slate-500">
      <MeridianLogo className="h-5 w-auto max-w-[160px]" />
      {sep}
      <span>{branch?.name ?? "All branches"} Branch</span>
      {sep}
      <span className="tnum" suppressHydrationWarning>
        {today || "\u00A0"}
      </span>
      {sep}
      <span>
        <span className="tnum font-medium text-slate-700">{active}</span> Active Exceptions
      </span>
      {sep}
      <span>
        <span className="tnum font-medium text-slate-700">{pending}</span> Awaiting Decisions
      </span>
    </div>
  );
}
