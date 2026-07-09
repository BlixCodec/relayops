import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/brand/relayops-logo.png"
      alt="RelayOps"
      className={cn("block shrink-0 object-contain", className)}
    />
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <img
      src="/brand/relayops-logo.png"
      alt="RelayOps"
      className={cn("block shrink-0 object-contain", className)}
    />
  );
}

export function MeridianLogo({ className }: { className?: string }) {
  return (
    <img
      src="/brand/meridian-logo.png"
      alt="Meridian Field Services"
      className={cn("block shrink-0 object-contain", className)}
    />
  );
}
