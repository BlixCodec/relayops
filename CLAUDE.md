# RelayOps — build rules

Read docs/decision-doc.md and docs/design-spec.md before any change. They are
the source of truth. If a request conflicts with them, flag it instead of
complying.

## Hard constraints

- Exactly 4 screens: role select, dispatcher workbench, manager decision queue,
  shared exception detail drawer. Never add a screen, page, or nav item.
- No auth, no database, no API routes. Local JSON in /data, React state only.
- Light mode only. No theme toggle. No gradients, glassmorphism, or charts.
- Every visual value must come from docs/design-spec.md tokens (Tailwind
  defaults only — zero custom CSS values).
- Stubs are labeled in the UI as deliberate ("stubbed — see notes"), never
  hidden.
- All copy is hand-written per the microcopy rules in the design spec. No
  placeholder text or filler copy ever. The banned trade acronym must not appear
  anywhere in this repo.

## Definition of done — the 40-second loop

Dispatcher opens the North Ridge exception → Escalate → switch role → Manager
sees it in the decision queue → Approve with note → switch back → Dispatcher's
card shows the decision + updated audit timeline.

If that loop works and feels instant, the app is done. Everything else is
polish.

## Build order (do not reorder)

1. Data — /data JSON is already seeded; wire it up, review before building UI
2. State + role switching (single store, state survives switching)
3. Dispatcher workbench (queue, drawer, Assign, Escalate)
4. Manager decision queue (Approve/Deny with note, three health pills)
5. Close the loop (decisions flow back, audit timeline, toasts) — run the demo
6. Polish only after 5: empty states, microcopy, AI Insight cards, spacing
