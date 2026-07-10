# RelayOps

Decision-first exception management for a multi-branch field-service company.
Dispatchers triage and escalate; regional operations managers decide; the
decision returns to the floor with a complete audit trail.

**Live app:** https://relayops-delta.vercel.app

## The problem

Meridian Field Services operates six branches and roughly 140 technicians.
When a job goes sideways—an equipment failure, missed appointment, repeat
callback, safety flag, or parts delay—the exception is scattered across calls,
dispatch notes, and manager texts. Ownership is unclear and SLAs quietly breach.

Meridian does not need another ticket tracker. Each role needs one answer:
**What do I need to decide next?**

## Roles and workflow

| Role                   | Primary decisions                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| **Dispatcher**         | Triage urgency, assign a technician, escalate work beyond branch authority, resolve the exception |
| **Operations Manager** | Approve or deny overtime, cross-branch transfers, and customer credits with instructions          |

The core loop is intentionally small:

1. A dispatcher opens the highest-risk exception.
2. The dispatcher escalates a specific approval request.
3. The request appears in the manager's decision queue.
4. The manager approves or denies it with instructions.
5. Dispatch sees the decision and the complete reasoning in the activity trail.

## What makes it different

RelayOps is organized around decisions, not records. The dispatcher experience
prioritizes SLA risk and the next operational action. The manager experience is
a decision queue—not a chart wall—and keeps branch health as supporting context.
One role's action changes what the other role sees immediately.

**Design target:** a dispatcher understands what needs attention within 10
seconds; a manager resolves an escalation in under 30 seconds.

## Deliberately stubbed

- Authentication: the two predefined role profiles are a stubbed login, as the brief requests.
- Notifications, SMS, exports, and technician mobile delivery.
- Server persistence and real-time collaboration. Prototype state is stored only in the current browser.
- The recommendation is a labeled, rule-based prototype. Production confidence would use certification match, travel time, branch load, and SLA headroom.

## AI tools used

I used Lovable for rapid visual prototyping, Claude Code/Cursor for implementation
iteration, and ChatGPT/Codex for product review, hardening, and final QA. AI
accelerated component scaffolding, realistic seed-data iteration, responsive
polish, and edge-case testing. The product decisions came first: the business
problem, role boundaries, closed-loop workflow, and what to leave deliberately
stubbed were defined before implementation.

## First three production improvements

1. **Real authentication and role-based permissions** — server-enforced RBAC so authority and audit events are tied to verified identities.
2. **Durable storage with an append-only audit log** — decisions are operationally significant and must be immutable, queryable, and safe across concurrent users.
3. **SLA-driven routing and notifications** — automatically route approaching breaches and notify the on-call manager instead of waiting for someone to check a queue.

## Prototype behavior

State persists in browser `localStorage`, including role, exception decisions,
notifications, and favorites. A fresh browser profile or private window starts
from the reviewed seed data. No external APIs, paid services, or model calls are
required to run the prototype.

## Stack

TanStack Start · React · TypeScript · Vite · Tailwind CSS · shadcn/ui · Zustand · Vercel

## Local development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run build
npm run lint
npx tsc --noEmit
```

## Product documentation

- [`docs/decision-doc.md`](docs/decision-doc.md) — business problem, roles, scope, and workflow decisions
- [`docs/design-spec.md`](docs/design-spec.md) — current visual and interaction system
- [`SUBMISSION_CHECKLIST.md`](SUBMISSION_CHECKLIST.md) — challenge-requirement coverage
