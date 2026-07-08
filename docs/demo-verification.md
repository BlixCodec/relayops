# RelayOps — 40-second loop verification

*Run: Wed 7/8, against commit `9a0b66b`, `next dev` (Turbopack), Chrome preview.
Driven end-to-end in the browser via scripted user interactions; latencies
measured `performance.now()` from click to DOM update.*

## Verdict

**The definition of done is met.** The full loop — dispatcher escalates
EX-1042 → manager approves with note → decision + timeline back on the
dispatcher's card — completed from a cold start with every UI action landing
in **under 65 ms** (sum of all nine steps: ~281 ms). No spinners, no console
errors or warnings. Per CLAUDE.md: feature building stops here; everything
after is polish.

## Step-by-step results

| # | Step (demo script) | Result | Latency |
|---|---|---|---|
| 1 | Cold start → pick **Dispatcher** | Workbench renders | 17 ms |
| 2 | EX-1042 first in queue (SLA 42 min, red) | ✅ sorted by urgency | — |
| 3 | Open EX-1042 | Drawer: meta grid, AI Insight (High), 2 audit entries | 60 ms |
| 4 | Click **Escalate** | Dialog opens; Send disabled until type + reason filled | 40 ms |
| 5 | Send escalation (overtime + reason) | "Waiting on Regional Operations" banner; actions hide | 30 ms |
| 6 | **Switch role** (top bar) | Decision queue renders | 17 ms |
| 7 | EX-1042 at top of queue | ✅ reason shown verbatim in quote block | 20 ms |
| 8 | **Approve** with note | Row leaves queue (2 remain) | 18 ms |
| 9 | **Switch role** back | Workbench renders | 17 ms |
| 10 | EX-1042 card | "Approved — see note" pill; drawer shows decision block + full timeline | 62 ms |

Final audit trail on EX-1042 (newest at bottom, reads as a story):

```
08:47 · System               Exception created from inbound customer call
08:49 · System               Priority set to Critical — refrigerated medical storage flagged
04:35 · Dispatcher           Escalated to Regional Operations — overtime approval requested
04:35 · Operations Manager   Approved with note: Approved — vaccine storage doesn't wait.
                             Cap overtime at 3 hours and flag me if the compressor needs
                             full replacement.
```

Toasts fired with the hand-written microcopy at each mutation:

- Escalate: *"Escalation sent to Regional Operations — a manager will review shortly."*
- Approve: *"Approved — the branch will see your note on the exception."*
- (Assign, verified in an earlier session: *"Marcus Reid is on it — added to the exception's timeline."*)

## Constraint compliance

| Constraint (CLAUDE.md) | Status |
|---|---|
| Exactly 4 screens, no nav items | ✅ single route; role select / workbench / decision queue / shared drawer, all state-driven |
| No auth, DB, or API routes | ✅ `/data` JSON imported directly; React state only |
| Light mode only | ✅ no `prefers-color-scheme` in `src/`; sonner pinned to light |
| Tailwind defaults only | ✅ zero custom CSS values in components |
| Stubs labeled, never hidden | ✅ role-select footnote; AI card carries "Rule-based stub…" line |
| No placeholder text / lorem ipsum | ✅ all copy hand-written with next-steps |
| "HVAC" nowhere | ✅ zero occurrences in app code, data, and UI copy (the word appears only inside the three docs that state the ban) |
| Deny requires a note | ✅ submit disabled until instructions typed |
| Three health pills, no charts | ✅ dot + label; open counts computed live from the store |

Also verified along the way: queue sort 42→60→95→130→180→300→420→510→660 with
resolved last; SLA red only *under* 60 (60 itself stays neutral); branch strip
shows East at 2 open (live count) rather than the stale seeded 5.

## Observations & polish notes (not blockers)

1. **Audit timestamps can read out of order.** ~~Seed entries carry fictional
   morning times (08:47…09:25) while live actions stamp the real local clock —
   this run produced "08:49 → 04:35".~~ **Fixed** in `src/lib/time.ts`: seeded
   clock times are normalized at store init (latest seeded event anchors to
   ~10 minutes ago; "yesterday …" entries pass through). Re-verified at 04:42
   local: seed entries rendered 03:54/03:56 and a live escalation stamped
   04:43 — chronological at any hour. Remaining edge: within ~2h after
   midnight the earliest seed times can wrap and read as late evening.
2. **Actions reappear after approval (by design).** An approved exception
   returns to `assigned`, so Assign/Escalate/Resolve come back — that's the
   dispatcher acting on the instruction and eventually resolving. Noting it
   here so it isn't mistaken for a bug.
3. **Dev-only:** while files are being written, Turbopack full-reloads can eat
   the first click (pre-hydration). Doesn't exist in production builds.
4. **Testing artifact:** Radix selects/dialogs only respond to trusted input
   events — synthetic `dispatchEvent` clicks won't open them. Irrelevant to
   real users.

## Addendum: live SLA countdown

The spec's "SLA countdown" now actually counts down (`src/lib/use-sla.ts`):
displayed minutes derive from page-load elapsed time, ticking once per minute
across cards, drawer, and decision rows — store state never mutates. At zero
the readout clamps to **"SLA breached"** in red. Verified live: 81 s after
load, readings moved 42→41, 60→59, 95→94, and the 59-minute row crossed the
under-60 threshold and turned red.

## What's deliberately untested

Resolve-from-drawer round trip (exercised ad hoc, not scripted), deny→deny-note
flow beyond validation gating, and the EX-1021 pre-resolved story card — all
low-risk, all candidates for the Friday polish pass.
