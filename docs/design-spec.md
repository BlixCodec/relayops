# RelayOps — Implementation Design Spec

`DESIGN.md` is the canonical design-system document. This file records the
implementation-level rules used during submission QA.

## Direction

Calm enterprise operations software: slate canvas, white work surfaces, Geist,
compact hierarchy, semantic tinted states, borders over shadows, and immediate
feedback. The interface should disappear into the operational task.

## Shell

- Desktop uses collapsible role navigation and a pinned top bar.
- Mobile uses a compact top bar and bottom navigation.
- Branch selection appears only on Dispatcher Today.
- Favorites open saved exceptions directly.
- Role switching clears transient drawers and controls while preserving the workflow state.

## Decision hierarchy

### Dispatcher

1. SLA urgency and customer risk.
2. Recommended next action.
3. Assign, escalate, or resolve according to current state.
4. Supporting activity and business context.

### Operations Manager

1. Dispatcher request.
2. Approve or deny.
3. Expandable recommendation reasoning.
4. Branch health and historical context.

## State transitions

| Current state   | Dispatcher actions                     | Manager actions            |
| --------------- | -------------------------------------- | -------------------------- |
| Open / Assigned | Assign, Escalate, Resolve              | Read only                  |
| Escalated       | Add context while waiting              | Approve, Deny, add context |
| Approved        | Assign/proceed, Resolve                | Read only                  |
| Denied          | Assign/rework, Escalate again, Resolve | Read only                  |
| Resolved        | Read only                              | Read only                  |

The Zustand store rejects the same invalid transitions that the UI hides.

## Recommendation disclosure

The recommendation tree is a **rule-based prototype**, not a live model result.
Its visible evidence is Issue → Impact → Timeline → Recommended. On the manager
queue, detailed reasoning is collapsed until requested so decision controls stay
inside the first viewport.

## Accessibility and motion

- All controls have visible focus.
- Clickable table rows support Enter and Space.
- Status always includes a text label.
- Meaningful secondary text uses slate-500 or darker on white.
- `prefers-reduced-motion` reduces animation and transition duration globally.
- Server/client time strings use hydration-safe rendering.

## Feedback copy

- Escalate: “Escalation sent to Regional Operations — a manager will review shortly.”
- Approve: identify who can proceed or that Dispatch has instructions.
- Deny: require and return a specific instruction.
- Resolve: name the customer and confirm the final state.

## Explicit exclusions

No dark mode, chart wall, decorative gradient, glassmorphism, external AI call,
database, authentication implementation, or paid service.
