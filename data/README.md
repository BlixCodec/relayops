# Seed data

Reviewed mock data for RelayOps. After scaffolding TanStack Start, keep these under
`/data` (or move to `/src/data`) and import directly — no fetch, no API route.

- `branches.json` — 3 branches matching the health pills: North ● Stable,
  West ● High load, East ● Critical
- `technicians.json` — 8 techs; skills/ETAs consistent with the AI suggestions
- `exceptions.json` — 10 exceptions. Notable records:
  - **EX-1042 (North Ridge Medical Center)** — the hero record for the
    40-second demo loop. Starts `open`; the demo escalates it live.
  - **EX-1039, EX-1036** — start in `awaiting-decision` so the manager queue
    is never empty on first load.
  - **EX-1021** — a fully resolved loop (escalated → approved → resolved) so
    the audit timeline has one complete story to show.

Consistency rules if you edit: every `aiSuggestion.reasons` claim must be
backed by the tech/branch data (skills, ETA, availability). SLA minutes,
priorities, and statuses must agree with each other. Do not use the banned trade acronym anywhere.
