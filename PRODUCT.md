# Product

## Register

product

## Users

Two roles at Meridian Field Services (6 branches, ~140 technicians, commercial
appliance repair and facilities maintenance) — both make decisions; nobody
just watches a dashboard (docs/decision-doc.md §2):

- **Dispatcher (branch level).** Lives in this tool for an 8-hour shift.
  Triages today's exceptions, assigns the right technician, escalates what
  exceeds their authority. Job to be done: "what needs action now?"
- **Operations Manager (regional).** Works a queue of escalations needing
  sign-off, with branch health as context — not the main event. Job to be
  done: approve/deny overtime, cross-branch transfers, and goodwill credits,
  with instructions.

Their shared context: exceptions currently live in phone calls, dispatch
notes, and manager texts. Nobody owns them; SLAs quietly breach.

## Product Purpose

Exception management organized around **decisions, not records**. One closed
loop: dispatchers triage and escalate; managers decide; decisions flow back
to the floor with a full audit trail. Success metric (docs/decision-doc.md):
a dispatcher understands what needs attention within 10 seconds of landing;
a manager resolves an escalation in under 30 seconds. The 40-second
escalate→decide→flow-back demo loop is the definition of done.

## Brand Personality

Calm, decisive, trustworthy. "Calm enterprise ops tooling" (docs/design-spec.md):
soft neutrals, generous whitespace, small refined type, borders over shadows.
If a choice makes it feel like a landing page, it's wrong; if it makes it feel
like software a dispatcher lives in for 8 hours, it's right. Microcopy gets
care everywhere — the bar is software people _enjoy_ using.

## Anti-references

- Dribbble-glossy anything; hero sections, illustrations, gradients,
  glassmorphism
- Chart-wall dashboards — the manager screen is a decision queue, not a
  chart wall; branch health is exactly three pills, no charts
- "Two dashboards over one table" — same data with no closed loop
- Generic ticket trackers; this is not another ticket tracker
- Placeholder text of any kind; the banned trade acronym anywhere

## Design Principles

1. **Organized around decisions, not records.** Every screen answers "what do
   I need to decide next?" — queue sorted by SLA urgency, actions up front.
2. **The loop is the product.** One role's action changes the other role's
   view in real time; the audit trail captures who decided what, and why.
3. **Work software, not marketing.** Attio-calibrated restraint: dark-neutral
   primary buttons, one accent used sparingly, tinted pills, borders over
   shadows.
4. **Honest by design.** Stubs are labeled in the UI as deliberate, never
   hidden; the AI Insight is a rule-based stub and says so.
5. **Microcopy carries the next step.** Not "Escalated." but "Escalation sent
   to Regional Operations — a manager will review shortly."

## Accessibility & Inclusion

No formal WCAG target stated in the source docs. In force from the design
spec and build: visible keyboard focus (indigo focus states, reserved for
links/active/focus only), light mode only by scope, `tabular-nums` for
scannable timers and dollar amounts, semantic status colors paired with text
labels (never color alone: pills say "Stable / High load / Critical").
Motion must stay subtle and functional — optimistic updates, no artificial
spinners; respect reduced-motion preferences in any polish work.
