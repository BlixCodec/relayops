import { useState } from "react";
import { cn } from "@/lib/utils";
import { iconFor, toneFor, monogram, logoDomainFor } from "@/lib/relay/branding";

export function LocationBadge({
  name,
  size = 22,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = iconFor(name);
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center text-slate-500", className)}
      style={{ width: size, height: size }}
      aria-hidden
      title={name}
    >
      <Icon style={{ width: size * 0.7, height: size * 0.7 }} strokeWidth={1.75} />
    </span>
  );
}

/**
 * CompanyLogo: prefers a real brand mark (via Clearbit's public logo endpoint,
 * no auth) as a visual placeholder for fictional customers. Falls back to a
 * tinted 2-letter monogram if no domain mapping exists or the image fails.
 */
export function CompanyLogo({
  name,
  size = 24,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const domain = logoDomainFor(name);
  const [failed, setFailed] = useState(false);

  if (domain && !failed) {
    return (
      <img
        src={`https://logo.clearbit.com/${domain}?size=${size * 2}`}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn(
          "inline-block shrink-0 rounded-md bg-white object-contain ring-1 ring-slate-200/70",
          className,
        )}
        style={{ width: size, height: size }}
        title={name}
      />
    );
  }

  const tone = toneFor(name + "|logo");
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-semibold leading-none ring-1 ring-black/5",
        tone.bg,
        tone.text,
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, Math.floor(size * 0.42)),
      }}
      aria-label={name}
      title={name}
    >
      {monogram(name)}
    </span>
  );
}

const facilityPhotos: Array<{ match: RegExp; url: string }> = [
  {
    match: /north ridge/i,
    url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    match: /west harbor/i,
    url: "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    match: /east meadow/i,
    url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    match: /central yard/i,
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    match: /southbrook/i,
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    match: /medical|hospital|clinic|health/i,
    url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    match: /grocery|distribution|warehouse|logistics/i,
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    match: /elementary|school|academy|college/i,
    url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    match: /tower|corporate|plaza/i,
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    match: /office|park|riverside/i,
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    match: /harbor|freight|terminal|port/i,
    url: "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    match: /assisted|living|care/i,
    url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    match: /retail|fairmont/i,
    url: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=160&h=160&q=80",
  },
];

function facilityPhotoFor(name: string) {
  return facilityPhotos.find((photo) => photo.match.test(name))?.url;
}

export function FacilityPhoto({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const url = facilityPhotoFor(name);
  const [failed, setFailed] = useState(false);

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn(
          "inline-block shrink-0 rounded-xl bg-slate-100 object-cover ring-1 ring-slate-200/70",
          className,
        )}
        style={{ width: size, height: size }}
      />
    );
  }

  return <CompanyLogo name={name} size={size} className={cn("rounded-xl", className)} />;
}
