import { cn } from "@/lib/utils";

export function QuoteBlock({
  label,
  children,
  className,
}: {
  label?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-slate-200 bg-slate-50 px-3 py-2", className)}>
      {label ? (
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {label}
        </div>
      ) : null}
      <div className="mt-0.5 text-sm text-slate-700">{children}</div>
    </div>
  );
}
