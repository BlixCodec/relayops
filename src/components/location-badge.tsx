// Venue glyph (Lovable port): a bare lucide icon keyed off the customer
// name — what kind of place this is, at a glance. No background tile.

import { createElement } from "react";
import { iconFor } from "@/lib/branding";
import { cn } from "@/lib/utils";

export function LocationBadge({
  name,
  size = 22,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center text-slate-500",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
      title={name}
    >
      {createElement(iconFor(name), {
        style: { width: size * 0.7, height: size * 0.7 },
        strokeWidth: 1.75,
      })}
    </span>
  );
}
