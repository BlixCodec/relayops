# Design

Source of truth: docs/design-spec.md (final). This file restates it in
DESIGN.md format for tooling; where they differ, the spec wins.

## Theme

Attio-style calm enterprise ops tooling. Soft neutrals, generous whitespace,
small refined type, borders over shadows. Light mode only — no theme toggle.
No gradients, no glassmorphism, no hero sections, no illustrations, no charts.

The three Attio signatures:

1. Primary action buttons are dark neutral (`slate-900` bg, white text,
   hover `slate-800`) — not colored. Indigo is reserved for links, active
   nav, and focus states only.
2. Soft gray hover states on every clickable row/card (`hover:bg-slate-50`).
3. Pills and badges use tinted backgrounds with darker text of the same hue —
   never solid fills.

## Colors

All values are Tailwind defaults — zero custom CSS values.

| Role | Value |
|---|---|
| Background | `slate-50` |
| Surface (cards) | `white`, border `slate-200` |
| Text primary | `slate-900` |
| Text secondary | `slate-500` |
| Accent (links, active nav, focus) | `indigo-600`, hover `indigo-700` |
| Critical | `red-600` text, `red-50` bg, `red-200` border |
| Warning / High load | `amber-600` text, `amber-50` bg |
| Stable / Resolved | `emerald-600` text, `emerald-50` bg |
| AI Insight surface | `violet-50` bg, `violet-200` border, `violet-700` label |

One accent color (indigo). Everything else is neutral + semantic status.

## Typography

- Font: Geist (Inter-class), `text-sm` base
- Page titles: `text-lg font-semibold` — nothing bigger anywhere
- Numbers (SLA timers, dollar amounts): `tabular-nums font-medium`

## Spacing & Layout

- 8px grid: `p-4` cards, `gap-3` lists, `p-6` page gutter
- Radius: `rounded-lg` cards, `rounded-full` pills/badges
- Borders over shadows: `border-slate-200`; shadow only on the detail drawer
  and toasts
- App shell: slim top bar (product name left, role badge + "Switch role"
  right). No sidebar — four screens don't need one.

## Components

All shadcn/ui primitives, styled with the tokens above.

- **Exception card:** priority badge + customer name (semibold) → issue
  one-liner (secondary) → footer: SLA countdown (tabular, red under 60 min)
  · branch · revenue at risk. Entire card clickable → drawer.
- **Priority badge:** pill, semantic colors. Critical / High / Medium.
- **Status pill (branch health):** dot + label. `● Stable` `● High load`
  `● Critical`. Exactly three, no charts.
- **AI Insight card:** violet surface, small "AI SUGGESTION" label, bold
  recommended action, 3–4 reasoning bullets, confidence tag. Reads as "the
  platform thought about this" — visually distinct from everything else.
- **Audit timeline:** vertical line, dot per event, `time + actor + action`.
  Newest at bottom (reads like a story).
- **Decision queue row (manager):** exception summary left, dispatcher's
  escalation reason in a quote block, Approve (indigo) / Deny (ghost) right.
  Deny requires a note.
- **Toast:** bottom-right, icon + sentence with a next-step.
- **Empty states:** one icon, one sentence, one suggested action. Written,
  not defaulted.
- **Role select:** two cards centered, role name + one-line description of
  what the role decides + stub disclosure footnote.

## Motion

From the interaction rules (docs/design-spec.md): role switch is instant;
optimistic updates, no artificial spinners — data is local. Escalate /
Approve / Deny each follow the same pattern: update state → append audit
event → toast. Any added motion must serve that feeling of immediacy —
subtle, fast, functional; respect `prefers-reduced-motion`.

## Anti-patterns

- Colored primary buttons (indigo is not a button color here)
- Solid-fill badges or pills
- Custom CSS values outside Tailwind defaults
- New screens, pages, or nav items (exactly four screens)
- Charts of any kind; dark mode; gradients; glassmorphism
- Placeholder copy; unlabeled stubs; the word "HVAC"
