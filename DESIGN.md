# RelayOps Design System

## Register

Calm enterprise operations software. The interface serves an eight-hour workday:
soft neutral canvas, white work surfaces, restrained semantic color, compact Geist
type, and borders before shadows. Familiarity and speed matter more than spectacle.

## Core principles

1. **Decisions before records.** The next operational decision is visible before supporting analysis.
2. **Role context is real.** Dispatchers and managers never receive each other's mutation controls.
3. **The loop is the product.** Escalate → decide → return to Dispatch → audit trail.
4. **Honest prototypes.** Authentication, integrations, and rule-based recommendations are labeled.
5. **Microcopy supplies the next step.** Feedback explains what happened and who acts next.

## Visual system

- Light mode only.
- Geist for interface and data text; compact fixed type scale.
- Slate canvas and surfaces, indigo for links/focus/active navigation only.
- Dark-neutral primary actions; semantic tinted states for critical, warning, success, and decision outcomes.
- Eight-pixel spacing rhythm, rounded work surfaces, and minimal functional shadow.
- No charts, decorative gradients, glassmorphism, or marketing-style hero treatment.

The CSS variables in `src/styles.css` are the implementation source for theme,
radius, font, and shadow tokens. Tailwind utilities provide component-level color
and spacing.

## Application shell

- Desktop: collapsible left navigation plus pinned top bar and contextual search.
- Mobile: compact top bar plus five-item bottom navigation.
- The branch selector appears only on Dispatcher Today, where it actually scopes work.
- Favorites open the saved exception directly; they never apply a hidden queue filter.

Supporting routes are grouped by role:

- Dispatcher: Today, Workbench, My Assignments, Resolved.
- Operations Manager: Today, Decision Queue, All Escalations, Decisions.
- Shared exception drawer: content is shared; mutation controls change by active role and state.

## Signature components

- **Exception card:** priority, customer, SLA, status, branch, revenue at risk, and progressive recommendation context.
- **Decision row:** dispatcher request and Approve/Deny appear before expandable recommendation reasoning.
- **Recommendation tree:** Issue → Impact → Timeline → Recommended, labeled `Rule-based prototype`.
- **Activity trail:** chronological actor/action/note story with semantic decision emphasis.
- **Branch health:** exactly three supporting status pills on the manager queue; no chart wall.
- **Role selector:** two role choices and no-auth disclosure are above the fold; the workspace preview is secondary.

## Interaction rules

- Local mutations are optimistic and immediate; no artificial loading states.
- Escalate, Approve, Deny, Assign, and Resolve append an audit event and provide next-step feedback.
- Invalid state transitions are unavailable in the UI and rejected by the store.
- Denial requires a specific instruction.
- Manager decisions remain visible before detailed recommendation analysis.
- Motion is brief and functional; `prefers-reduced-motion` disables animation and transition duration.

## Accessibility

- Visible indigo focus rings on every interactive control.
- Keyboard access for clickable rows and dialogs.
- Status meaning is expressed by text and icon, never color alone.
- Meaningful metadata uses at least slate-500 contrast on white.
- Dynamic time text hydrates safely and uses tabular numerals.
