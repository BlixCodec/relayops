import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/brand/relayops-mark.svg"
      alt="RelayOps"
      className={cn("block shrink-0 object-contain", className)}
    />
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <img
      src="/brand/relayops-lockup.svg"
      alt="RelayOps"
      className={cn("block shrink-0 object-contain", className)}
    />
  );
}

export function MeridianLogo({ className }: { className?: string }) {
  return (
    <img
      src="/brand/meridian-field-services.svg"
      alt="Meridian Field Services"
      className={cn("block shrink-0 object-contain", className)}
    />
  );
}
