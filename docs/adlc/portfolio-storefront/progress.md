---
adlc: progress
slug: portfolio-storefront
plan: docs/adlc/portfolio-storefront/plan.md
---

# Portfolio e-commerce site progress

> Living delivery record; never hashed or gated.

## Slices

| Slice | State | Evidence | Updated |
| --- | --- | --- | --- |
| S0 | in-progress | Uncommitted on local branch `s0-walking-skeleton`. Local: Release build 0 warnings; 45 xUnit tests pass (integration excluded, no Docker); web typecheck, lint, 6 Vitest tests, build; Playwright Chromium smoke and axe pass, and fail on an injected `image-alt` violation. Independent review: approve with fixes, both P2s fixed. Not yet run: Testcontainers health test, `docker compose up`, 5-browser run, CI | 2026-10-05 |
| S1 | blocked | Waits for S0, CI-1, CI-2 | 2026-10-05 |
| S2 | blocked | Waits for S0 (CI-3 is settled inside the slice) | 2026-10-05 |
| S3 | blocked | Waits for S2, CI-4 | 2026-10-05 |
| S4 | blocked | Waits for S3 | 2026-10-05 |
| S5 | blocked | Waits for S3 | 2026-10-05 |
| S6 | blocked | Waits for S2 (bag merge also waits for S5) | 2026-10-05 |
| S7 | blocked | Waits for S5, S6, CI-5 | 2026-10-05 |
| S8 | blocked | Waits for S7 | 2026-10-05 |
| S9 | blocked | Waits for S3, S6 | 2026-10-05 |
| S10 | blocked | Waits for S7, S9 | 2026-10-05 |
| S11 | blocked | Waits for S7, S9 | 2026-10-05 |
| S12 | blocked | Waits for S6, S10, S11 | 2026-10-05 |
| S13 | blocked | Waits for S1, S4, S8, S12, CI-6 | 2026-10-05 |

## Decisions

| Date | Slice | Decision | Approver | Evidence | Conditions |
| --- | --- | --- | --- | --- | --- |

## Carried items

| Item | Source | Owner | Decide by | State |
| --- | --- | --- | --- | --- |
| CI-1 Public domain name on Cloudflare DNS | plan | Joe | S1 | open |
| CI-2 Cloudflare account, Unraid access, network and volume | plan | Joe | S1 | open |
| CI-3 Visual identity (brand name, palette, type), shaped with `impeccable` | spec open question | Joe | S2 | open |
| CI-4 Image source and licence | spec open question | Joe | S3 | open |
| CI-5 Stripe test-mode account, keys and webhook secret | plan | Joe | S7 | open |
| CI-6 Walkthrough people for AC-047 and AC-048 | spec open question | Joe | S13 | open |
| S6 auth wiring: run `UseAuthentication` before the antiforgery middleware, and re-issue `XSRF-TOKEN` after sign-in and sign-out (the token is bound to the user) | S0 review | implementer | S6 | open |
| CI-7 Time budget (assumed: no fixed deadline, vertical slices) | intent assumption | Joe | S1 | open |
