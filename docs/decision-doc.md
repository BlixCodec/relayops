# RelayOps — Decision Doc

Field-service exception management for a multi-branch service company.
_Internal planning doc. Wed 7/8 — FINAL. No more revision loops; next step is code._

**Success metric (design target, state it in the write-up):** a dispatcher understands what needs attention within 10 seconds of landing; a manager resolves an escalation in under 30 seconds.

**Build priority if time runs short (cut from the bottom, never the top):**

1. Closed loop works end-to-end (escalate → decide → flows back)
2. Mock data feels real
3. Microcopy: toasts, empty states, button labels
4. Audit-trail timeline styling
5. Everything else

---

## 1. Business problem

Meridian Field Services runs 6 branches, ~140 technicians, doing commercial appliance repair and facilities maintenance. When a job goes sideways — a missed appointment, a parts delay, a repeat-visit callback, a safety flag — that "exception" lives in phone calls, dispatch notes, and manager texts. Nobody owns it, SLAs quietly breach, and customers churn.

Meridian doesn't need another ticket tracker. Each role needs one answer: **"What do I need to decide next?"**

## 2. Roles (both make decisions — nobody just watches)

**Dispatcher (branch level).** Triage today's exceptions, assign the right technician, escalate what exceeds their authority.

- Decisions: assign/reassign tech, set priority, escalate to manager.

**Operations Manager (regional).** Work a queue of escalations that need their sign-off, with branch health as context — not the main event.

- Decisions: approve/deny overtime, approve cross-branch tech transfer, approve goodwill credit, deny with instructions.

## 3. The closed-loop workflow (the core of the app)

```
Exception created
 → Dispatcher triages (priority + assign tech)
 → If it exceeds dispatcher authority → Escalate with reason
 → Lands in Manager's decision queue
 → Manager approves/denies with note
 → Decision flows back to Dispatcher's board (status + instruction)
 → Every action recorded in the exception's audit trail
```

The loop is the differentiator. Same data, two roles, and each role's action changes what the other sees. Not two dashboards over one table.

## 4. Screens (4 total, no more)

1. **Role select** — two cards. Footnote: "Stubbed login for evaluation — no authentication by design."
2. **Dispatcher workbench** — exception queue sorted by SLA urgency; detail drawer (customer, branch, issue, SLA countdown, suggested action + one-line rationale); actions: Assign, Escalate, Resolve.
3. **Manager decision queue** — escalations awaiting decision at top (Approve / Deny with note); compact branch-health strip below for context.
4. **Exception detail** (shared drawer) — includes the audit trail: who did what, when, why.

**AI touch (one, honest):** an "AI Insight" card per exception — no chatbot, no prompt box:

> **Recommended: Reassign to Marcus R.** · Confidence: High
>
> - Certified on refrigeration
> - 8 minutes away
> - Keeps SLA with 42 min headroom
> - Avoids an overtime approval

Rule-based stub, labeled as such. If Jason asks how confidence is computed: "In production it'd be derived from certification match, travel time, and SLA headroom; here it's a labeled stub."

**Manager branch health = exactly three pills, no charts:** `North ● Stable · West ● High load · East ● Critical`

**Audit trail = vertical timeline, not a text log:** timestamp + actor + action per entry (09:12 Dispatcher assigned Marcus → 09:18 Escalated → 09:21 Manager approved transfer → 09:22 Dispatcher notified).

**Microcopy gets care everywhere** — toasts, empty states, buttons. Not "Escalated." but: "Escalation sent to Regional Operations — a manager will review shortly." Jason's bar is software people _enjoy_ using.

## 5. Deliberately stubbed (say so in the UI and the write-up)

- Authentication (per instructions)
- Notifications/SMS ("Notify customer" button → toast: "stubbed")
- Reporting/exports
- Technician mobile view

## 6. Data

Local JSON, no database. Entities: branches (3 shown), technicians (8), exceptions (~12), activity log. Mock data must feel real — exception types: equipment failure, missed appointment window, parts delay, repeat-visit callback, safety flag. Real names, plausible SLA timestamps relative to "today," dollar amounts that make sense. **No placeholder filler copy anywhere. Do not use the banned trade acronym anywhere.**

Quality bar per exception (this level of specificity, every record):

> **North Ridge Medical Center** · Critical
> Walk-in refrigeration compressor failure · SLA: 42 min remaining
> Revenue at risk: $3,200 · 3rd visit this quarter

## 7. Stack

TanStack Start + Vite + TypeScript + Tailwind + shadcn/ui, local seed data, in-memory React/Zustand state, deployed on Vercel (free tier). No Supabase, no CSV, no over-engineering.

## 8. Submission answers (draft now, refine Fri)

**Uniqueness.** Relay is organized around decisions, not records. The dispatcher's screen answers "what needs action now"; the manager's screen is a decision queue, not a dashboard. One role's action changes the other's view, and the audit trail captures the reasoning — the parts an internal tool actually gets judged on.

**AI tools used.** Claude for scaffolding components and generating realistic mock data; Claude Code / Cursor for fast iteration. Product decisions — which workflow, which role sees what, what to stub — were made before prompting anything. AI accelerated the build; it didn't choose what to build.

**First three production improvements.**

1. **Real auth + role-based permissions** — replace the stub with server-enforced RBAC so escalation authority and audit entries are tied to verified identity.
2. **Persistent store with an append-only audit log** — exception decisions are compliance-relevant; the trail must be immutable and queryable, not React state.
3. **SLA-driven escalation routing + notifications** — timers that auto-escalate approaching breaches and notify the on-call manager, so the system surfaces risk instead of waiting to be checked.

## 9. Schedule

- **Wed 7/8** — this doc. Done.
- **Thu 7/9** — one focused build session: role select → dispatcher board → escalate → manager queue → decision flows back → audit trail. Stop there.
- **Fri 7/10** — polish (empty states, copy, spacing), deploy to Vercel, finalize write-up.
- **Sat 7/11** — optional ≤3-min walkthrough video, final read of the email, **submit Saturday**. Not Sunday night.

**Demo/video script = the closed loop, nothing else:** as Dispatcher, open the North Ridge exception → Escalate → switch role → Manager sees it in the decision queue → Approve with note → switch back → Dispatcher's card shows the decision + updated audit timeline. That 40-second sequence is the whole pitch.

## 10. Submission email skeleton (tone: short, calm, zero hype)

> Jason — here's my submission.
>
> **Live app:** [add deployed URL] · **Walkthrough (2 min):** [optional link]
>
> I built Relay, an exception-management workflow for a multi-branch field-service company. Two roles, one closed loop: dispatchers triage and escalate; managers decide; decisions flow back with a full audit trail. [3–4 sentences: uniqueness, AI tools, three improvements — from §8.]
>
> Notes on what I stubbed and why are on the role-select screen. Happy to walk through any decision.
>
> — Bill
