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
| S0 | done | Squash-merged to `main` as `b85c1b0` ([PR #1](https://github.com/J03Fr0st/e-co/pull/1)); CI green on `main` (run 37316534944). Verification evidence: [PR #1](https://github.com/J03Fr0st/e-co/pull/1) at `71ba429`. CI run 37314990161 all green: 49/49 .NET tests including the Testcontainers health test, web type-check/lint/8 tests, Playwright 10/10 with axe across 5 browsers, Lighthouse report, gitleaks. Gate proof: `f785dd1` (run 37312754222) failed only the end-to-end job on `color-contrast`, reverted in `c3eabc0`. Local `docker compose up` on the same tree: health 200, page served, migration applied, non-root, antiforgery token valid across an app restart, Playwright 10/10 against the container. Code review: approve with fixes, all findings fixed in `71ba429` | 2026-10-05 |
| S1 | blocked | Waits for S0, CI-1, CI-2 | 2026-10-05 |
| S2 | in-progress | Branch `s2-design-foundation`. CI-3 proposal ready for sign-off: brand **Long Cycle**, world **The Launderette** (chosen by Joe on the impeccable decision page, seed d4d63287), palette roles contrast-checked, Archivo typeface; recorded in `PRODUCT.md` and `.impeccable/surfaces/src-eco-web-src-app-tsx.md`. No component code yet | 2026-10-05 |
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
| Persist data-protection keys on Unraid: mount a volume at `/data/keys` in `compose.prod.yml` | S0 review | implementer | S1 | open |
| CI-7 Time budget (assumed: no fixed deadline, vertical slices) | intent assumption | Joe | S1 | open |
