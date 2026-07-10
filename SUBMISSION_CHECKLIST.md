# Submission Checklist

## Challenge coverage

| Requirement                         | RelayOps evidence                                                                                       | Status |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- | ------ |
| Small web application               | Focused exception-management workflow for one fictional multi-branch company                            | ✅     |
| At least two roles                  | Dispatcher and Operations Manager                                                                       | ✅     |
| Role-specific context               | SLA-first dispatcher views; authorization-first manager views; role-aware drawer controls               | ✅     |
| No authentication implementation    | Two predefined role profiles with an explicit no-auth disclosure                                        | ✅     |
| At least one workflow               | Escalate → manager decision → returned instruction → audit trail                                        | ✅     |
| Intuitive experience                | Highest-risk work and blocking decisions are prioritized; detailed reasoning is progressively disclosed | ✅     |
| Hosted or short video               | Vercel deployment plus planned sub-three-minute closed-loop walkthrough                                 | ✅     |
| No paid services                    | Local seed data, browser-local state, no external model/API calls                                       | ✅     |
| Unique app explanation              | README explains the decision-first model                                                                | ✅     |
| AI tools and influence              | README names the tools and separates AI acceleration from product judgment                              | ✅     |
| First three production improvements | RBAC, durable append-only storage, SLA routing/notifications                                            | ✅     |

## Submission QA

- [x] Production URL reflects the final commit.
- [x] `npm run build` passes.
- [x] `npx tsc --noEmit` passes.
- [x] `npm audit --omit=dev` reports no vulnerabilities.
- [x] `npm run lint` has no errors (13 non-blocking Fast Refresh warnings remain).
- [x] Final local browser pass has no hydration or console errors.
- [x] Dispatcher can escalate North Ridge Medical Center.
- [x] The new escalation appears first in the manager queue.
- [x] Manager drawer shows Approve/Deny, never dispatcher actions.
- [x] Approval returns to Dispatch with an updated activity trail.
- [x] Approved exceptions cannot be escalated again.
- [x] Deny requires an instruction.
- [x] Role selector shows both roles without scrolling at desktop and mobile review sizes.
- [ ] Final video is under three minutes and demonstrates only the closed loop.
- [ ] Submission email matches the final README wording and names the actual AI tools used.

## Deliberate prototype boundaries

- Authentication, server persistence, real-time collaboration, notifications/SMS,
  exports, and technician delivery are stubbed or local by design.
- Browser state persists in `localStorage`; a fresh browser profile starts from seed data.
- Recommendations and draft polishing are labeled prototype behavior and do not call an external model.
