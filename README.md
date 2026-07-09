# RelayOps

Exception management for a multi-branch field-service company. Two roles, one
closed loop: dispatchers triage and escalate; operations managers decide;
decisions flow back to the floor with a full audit trail.

**Live app:** https://relayops-delta.vercel.app

## The problem

Meridian Field Services (6 branches, ~140 technicians) loses revenue and
customer trust when jobs go sideways — missed appointment windows, parts
delays, repeat-visit callbacks, safety flags. These "exceptions" live in phone
calls and manager texts. Nobody owns them, SLAs quietly breach.

Meridian doesn't need another ticket tracker. Each role needs one answer:
**"What do I need to decide next?"**

## Roles

| Role                              | Decides                                                                                |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| **Dispatcher** (branch)           | Priority, technician assignment, when to escalate                                      |
| **Operations Manager** (regional) | Overtime, cross-branch transfers, goodwill credits — approve or deny with instructions |

Both roles make decisions. Nobody just watches a dashboard.

## What makes it different

RelayOps is organized around decisions, not records. The dispatcher's screen
answers "what needs action now"; the manager's screen is a decision queue, not
a chart wall. One role's action changes the other role's view in real time,
and the audit trail captures who decided what, and why.

**Design target:** a dispatcher understands what needs attention within 10
seconds of landing; a manager resolves an escalation in under 30 seconds.

## Deliberately stubbed

Authentication (per the brief — role selection is a stubbed login),
notifications/SMS, reporting exports, and the technician mobile view. Each stub
is labeled in the UI. The AI "Suggested action" is rule-based and labeled as
such — in production, confidence would derive from certification match, travel
time, and SLA headroom.

## AI tools used

I used ChatGPT/Codex as an AI pair-programmer to scaffold React components,
iterate on UI polish, generate realistic seed data, and run QA checks quickly.
The product decisions came first: the business problem, two-role workflow,
what each role should decide, what to stub, and the 40-second closed loop were
defined before implementation. AI accelerated the build; it did not choose the
problem or the workflow.

## First three production improvements

1. **Real authentication with role-based permissions** — server-enforced RBAC
   so escalation authority and audit entries are tied to verified identity.
2. **Persistent store with an append-only audit log** — exception decisions
   are compliance-relevant; the trail must be immutable and queryable, not
   React state.
3. **SLA-driven escalation routing and notifications** — timers that
   auto-escalate approaching breaches and notify the on-call manager, so the
   system surfaces risk instead of waiting to be checked.

## Stack

TanStack Start · Vite · TypeScript · Tailwind · shadcn/ui · Zustand · local
seed data · Vercel

## Prototype notes

RelayOps intentionally uses stubbed role login and in-memory exception state
for the evaluation. The workflow persists while switching roles in the same
session; refreshing the page resets exception decisions back to the seed data,
which is acceptable for the prototype and called out here so review behavior is
predictable.

## Docs

- [`docs/decision-doc.md`](docs/decision-doc.md) — problem, roles, workflow, scope decisions
- [`docs/design-spec.md`](docs/design-spec.md) — tokens, components, interaction rules
