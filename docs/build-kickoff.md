# RelayOps — Claude Code kickoff

## Setup (do this before prompting)

1. Create the repo, drop both docs in the root: `DECISION-DOC.md` and `DESIGN-SPEC.md` (rename from the files I gave you).
2. Add a `CLAUDE.md` with the guardrails below so every session inherits them — don't rely on re-pasting.

## CLAUDE.md contents (paste as-is)

```
# RelayOps — build rules

Read DECISION-DOC.md and DESIGN-SPEC.md before any change. They are the source
of truth. If a request conflicts with them, flag it instead of complying.

Hard constraints:
- Exactly 4 screens: role select, dispatcher workbench, manager decision queue,
  shared exception detail drawer. Never add a screen, page, or nav item.
- No auth, no database, no API routes. Local JSON in /data, React state only.
- Light mode only. No theme toggle. No gradients, glassmorphism, or charts.
- Every visual value must come from DESIGN-SPEC.md tokens (Tailwind defaults only).
- Stubs are labeled in the UI as deliberate ("stubbed — see notes"), never hidden.
- All copy is hand-written per the microcopy rules. No placeholder text ever.

Definition of done = the 40-second loop:
Dispatcher opens North Ridge exception → Escalate → switch role → Manager sees
it in decision queue → Approve with note → switch back → Dispatcher's card
shows the decision + updated audit timeline. If that loop works and feels
instant, the app is done. Everything else is polish.
```

## Build order (one prompt per step, verify before moving on)

1. **Scaffold + data.** TanStack Start/TS/Tailwind/shadcn. Generate `/data/*.json` first — branches, technicians, exceptions, activity log — to the North Ridge quality bar in the decision doc §6. Review the JSON yourself before any UI exists. Bad data poisons every screen after it.
2. **State + role switching.** Single store (Context or Zustand), role switch in top bar, state survives switching. Test this alone.
3. **Dispatcher workbench** — queue, drawer, Assign, Escalate.
4. **Manager decision queue** — escalation rows, Approve/Deny with note, three health pills.
5. **Close the loop** — decisions flow back, audit timeline renders, toasts fire. Run the 40-second demo. STOP when it works.
6. **Polish pass only after 5:** empty states, microcopy, AI Insight cards, spacing audit against the spec.

## Claude Design warning

Claude Design will happily hand you extra screens, a settings page, a dark mode,
and charts. Use it for component styling within the 4 screens only. Anything it
generates that isn't in the decision doc gets deleted, not adapted.

## Time honesty for the write-up

Track your actual keyboard time loosely. The write-up should truthfully say
thinking/planning happened up front and the build was a tight AI-assisted
session — that's the story Jason designed the challenge to surface.
