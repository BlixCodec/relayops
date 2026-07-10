import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useMemo } from "react";
import { AvatarInitials } from "@/components/relay/avatar-initials";
import { BrandLockup, MeridianLogo } from "@/components/relay/brand-logo";
import { FacilityPhoto } from "@/components/relay/location-badge";
import { useRelayStore } from "@/lib/relay/store";
import { branches } from "@/lib/relay/seed";

export const Route = createFileRoute("/")({
  component: RoleSelect,
});

function RoleSelect() {
  const { currentUser, exceptions, setRole } = useRelayStore();
  const navigate = useNavigate();

  const metrics = useMemo(() => {
    const active = exceptions.filter((e) => !["resolved", "denied", "approved"].includes(e.status));
    return {
      active: active.length,
      escalated: active.filter((e) => e.status === "escalated").length,
      critical: active.filter((e) => e.priority === "critical").length,
      assignedToAlicia: active.filter((e) => e.ownerDispatcher === currentUser.dispatcher).length,
    };
  }, [currentUser.dispatcher, exceptions]);

  const enter = (role: "dispatcher" | "manager") => {
    setRole(role);
    navigate({ to: role === "dispatcher" ? "/dispatcher/today" : "/manager" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="relative flex min-h-16 items-center justify-end gap-4 border-b border-slate-200/80 bg-white px-4 sm:px-8">
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-4">
          <BrandLockup className="h-7 w-auto max-w-[120px]" />
          <span className="hidden h-7 w-px bg-slate-200 sm:block" aria-hidden />
          <MeridianLogo className="h-7 w-auto max-w-[150px]" />
        </div>
        <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 sm:inline-flex">
          Prototype build
        </span>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
          <div className="mb-5 text-center">
            <h1 className="text-xl font-semibold tracking-tight text-slate-950">
              Choose your role
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Enter the workspace with the decisions that belong to you.
            </p>
          </div>

          <div className="space-y-3">
            <BranchSummary active={metrics.active} critical={metrics.critical} />

            <div className="grid gap-3 sm:grid-cols-2">
              <RoleCard
                title="Dispatcher"
                account={currentUser.dispatcher}
                cta="Continue"
                meta={`${metrics.assignedToAlicia} assignments · ${metrics.critical} critical`}
                onClick={() => enter("dispatcher")}
              />
              <RoleCard
                title="Operations Manager"
                account={currentUser.manager}
                cta="Continue"
                meta={`${metrics.escalated} decisions · ${branches.length} branches`}
                onClick={() => enter("manager")}
              />
            </div>

            <p className="text-center text-[11px] text-slate-500">
              Stubbed role login for evaluation · no authentication by design
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Dispatcher workspace preview
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  SLA-first triage with the next decision kept in view.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                Prototype
              </span>
            </div>
            <picture className="block max-h-[420px] overflow-hidden">
              <source media="(max-width: 639px)" srcSet="/teasers/dispatcher-mobile.png" />
              <img
                src="/teasers/dispatcher-dashboard.png"
                alt="RelayOps dispatcher workspace showing SLA-prioritized exceptions"
                loading="lazy"
                className="h-full w-full object-cover object-top sm:object-contain"
              />
            </picture>
          </div>
        </section>
      </main>

      <footer className="flex items-center justify-center gap-2 border-t border-slate-200 bg-white px-4 py-4 text-[11px] text-slate-500">
        <MeridianLogo className="h-5 w-auto max-w-[150px]" />
        <span>Meridian Field Services · connected prototype workspace</span>
      </footer>
    </div>
  );
}

function BranchSummary({ active, critical }: { active: number; critical: number }) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex -space-x-2">
            <FacilityPhoto name="North Ridge Medical Center" size={38} />
            <FacilityPhoto name="Lakeside Grocery Distribution" size={38} />
            <FacilityPhoto name="Riverside Office Park" size={38} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-slate-950">North Ridge branch</p>
            <p className="text-[12px] text-slate-500">
              {active} active exceptions · {critical} critical
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
          <span>Connected workspace</span>
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  title,
  account,
  cta,
  meta,
  onClick,
}: {
  title: string;
  account: string;
  cta: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-card transition-colors hover:border-indigo-200 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
    >
      <div className="flex items-center gap-3">
        <AvatarInitials name={account} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-[13.5px] font-semibold text-slate-950">{account}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-medium text-emerald-700 ring-1 ring-emerald-100">
              <CheckCircle2 className="h-3 w-3" />
              Logged in
            </span>
          </div>
          <p className="mt-0.5 text-[12px] font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-[11px] text-slate-500">{meta}</p>
        </div>
        <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 transition-colors group-hover:border-indigo-200 group-hover:text-indigo-700">
          {cta}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}
