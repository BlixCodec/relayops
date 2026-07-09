import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  guidance,
  actions,
  className,
  actionsClassName,
}: {
  title: string;
  guidance: string;
  actions?: React.ReactNode;
  className?: string;
  actionsClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-b border-slate-100 bg-white/95 px-4 pt-4 pb-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:px-6 sm:pt-5 sm:pb-4",
        className,
      )}
    >
      <div className="min-w-0 text-center sm:text-left">
        <h1 className="text-[15px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[19px]">
          {title}
        </h1>
        <p className="mt-1 text-[12px] text-slate-500 sm:text-[13px]">{guidance}</p>
      </div>
      {actions ? (
        <div
          className={cn("flex items-center justify-center gap-2 sm:justify-end", actionsClassName)}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}
