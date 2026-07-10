# RelayOps — build rules

Read `PRODUCT.md`, `DESIGN.md`, and `docs/decision-doc.md` before changing the
product. The closed-loop decision workflow is the source of truth; supporting
routes must never obscure it.

## Product constraints

- Two stubbed roles only: Dispatcher and Operations Manager. No real authentication.
- Local reviewed seed data and browser-local prototype persistence. No database or paid API.
- Role permissions and exception state transitions must be enforced in both UI and store.
- Light mode only. No charts, dark mode, decorative gradients, or glass effects.
- Recommendations are rule-based prototype behavior and must be labeled honestly.
- Stubs are disclosed in the interface or README; no placeholder or filler copy.
- The banned trade acronym must not appear in app code, data, or user-facing copy.

## Definition of done

Dispatcher opens North Ridge Medical Center → escalates a specific decision →
switches to Regional Operations → manager approves or denies with instructions →
switches back → Dispatch sees the returned decision and updated activity trail.

That loop must remain fast, keyboard accessible, role-correct, and reproducible.
The additional Today, history, assignment, and escalation views support the loop;
they are not the submission story.

## Technical expectations

- `npm run build`, `npm run lint`, and `npx tsc --noEmit` must pass before handoff.
- SSR and client output must hydrate without console errors.
- All animation must respect `prefers-reduced-motion`.
- Interactive table rows need keyboard behavior and visible focus.
- Preserve published git history; never force-push or rewrite synced Lovable commits.
