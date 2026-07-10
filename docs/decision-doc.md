# RelayOps — Product Decision Record

## Business problem

Meridian Field Services operates six branches and roughly 140 field technicians.
Operational exceptions are currently scattered across calls, dispatch notes, and
manager messages. Nobody has a reliable view of ownership, SLA risk, requested
authority, or the final decision.

The product is therefore organized around **decisions, not records**.

## Users

### Dispatcher

Works an eight-hour branch shift. Needs to understand what requires action now,
assign the right technician, and escalate work that exceeds branch authority.

### Operations Manager

Works a regional authorization queue. Needs the dispatcher request, business
impact, and recommendation context necessary to approve or deny quickly.

Both roles make decisions; neither role is a passive dashboard viewer.

## Core workflow

```text
Exception opened
  → Dispatcher triages and assigns
  → Dispatcher requests a specific approval
  → Request enters the manager decision queue
  → Manager approves or denies with instructions
  → Decision returns to Dispatch
  → Every action remains in the activity trail
```

Success targets:

- Dispatcher understands the next priority within 10 seconds.
- Manager resolves an escalation within 30 seconds.
- The complete role-to-role demonstration fits comfortably inside 60 seconds.

## Scope decisions

### Built

- Stubbed role selection for Dispatcher and Operations Manager.
- Dispatcher Today, Workbench, Assignments, and Resolved views.
- Manager Today, Decision Queue, escalation history, and decision history.
- Shared role-aware exception drawer.
- Local optimistic mutations, notifications, favorites, and activity trail.
- Rule-based recommendation context using certifications, travel, risk, and SLA signals.

### Deliberately local or stubbed

- Authentication and server-enforced authorization.
- Database, append-only server audit log, and concurrent-user conflict handling.
- SMS, email, technician delivery, reporting exports, and external integrations.
- External AI/model calls. Recommendation and draft-polish behavior are labeled prototypes.

## Product judgment

- Branch health is supporting context, not the center of the manager experience.
- Manager actions appear before detailed reasoning.
- Favorites open a record; they do not silently filter another role's queue.
- Role permissions and exception transitions are enforced in UI and state.
- The supporting routes make the prototype inspectable, but the submission story remains the closed loop.

## Technology

TanStack Start, React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand
`localStorage` persistence, reviewed local TypeScript seed data, and Vercel.

No paid services or external runtime APIs are required.

## Production roadmap

1. Server-enforced identity and role permissions.
2. Durable data with an immutable, queryable audit log.
3. SLA-based escalation routing and real notifications.
