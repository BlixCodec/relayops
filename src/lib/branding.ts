// Venue glyph mapping (Lovable port), extended for our seed customers.
// Plain icons in currentColor — no tinted tiles (their plan.md §1).

import {
  Beer,
  Building2,
  Dumbbell,
  Flame,
  GraduationCap,
  Hotel,
  Landmark,
  MapPin,
  ShoppingCart,
  Stethoscope,
  Truck,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";

const rules: Array<{ match: RegExp; icon: LucideIcon }> = [
  { match: /medical|hospital|clinic|health|dental/i, icon: Stethoscope },
  { match: /restaurant|table|dining|kitchen/i, icon: Utensils },
  { match: /senior|assisted|living/i, icon: Building2 },
  { match: /grocery|market|fields/i, icon: ShoppingCart },
  { match: /elementary|school|academy|district/i, icon: GraduationCap },
  { match: /brewing|brewery|ironworks/i, icon: Beer },
  { match: /hotel|resort|inn/i, icon: Hotel },
  { match: /fitness|gym|athletic/i, icon: Dumbbell },
  { match: /credit union|bank|financial/i, icon: Landmark },
  { match: /generator|electric|power/i, icon: Zap },
  { match: /boiler|refriger|thermal/i, icon: Flame },
  { match: /distribution|warehouse|logistics|freight/i, icon: Truck },
];

export function iconFor(name: string): LucideIcon {
  for (const r of rules) if (r.match.test(name)) return r.icon;
  return MapPin;
}
