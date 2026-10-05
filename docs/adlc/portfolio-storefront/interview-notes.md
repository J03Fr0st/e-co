# Interview notes: portfolio-storefront

Ungated input to `/adlc-spec`. These are the solution-level decisions Joe confirmed while being grilled on 2026-10-05. The intent stays about the problem and the outcome. The spec carries these decisions as settled, or reopens them with evidence.

## Decisions

| # | Decision |
|---|---|
| D1 | Type: a portfolio/learning build with a fictional catalog, no real customers and no real money |
| D2 | Audience: recruiters and hiring managers. Needs a public URL and a readme that tells the UX story |
| D3 | Standout: frontend and UX craft |
| D4 | Catalog: a fictional apparel brand. Physical goods with size and colour variants, per-variant stock, and shipping costs |
| D5 | ~~Backend: a typed mock API in the browser with simulated latency and failures, behind a contract that could be swapped for a real API~~ **Superseded by D13.** |
| D6 | ~~Stack: React + TypeScript + Vite single-page app, static hosting~~ **Superseded.** With a real backend, the stack and hosting are reopened (D16) |
| D7 | Flows (extended by D14): home → listing (filters, sort) → product page (variants) → cart → guest checkout → confirmation, plus search with suggestions and a no-results state |
| D8 | ~~Payment: a mocked card form whose documented test numbers trigger success, decline, insufficient funds and slow processing. It never accepts real card details~~ **Superseded by D15.** |
| D9 | UI: own design tokens on unstyled accessible components, plus utility CSS |
| D10 | Quality: **gates** are WCAG 2.2 AA (automated in CI plus a manual keyboard and screen-reader pass) and end-to-end tests including failure states. **Targets** are a mobile Core Web Vitals budget and mobile-first checkout |
| D11 | The `impeccable` skill shapes the visual identity before the first UI slice, guides UI slices, and runs critique, audit and polish passes before UI slices are signed off |

## Scope revision (2026-10-05)

Joe: "i want a full e-com website. not just frontend. all functionality". He accepted the agent's recommendations on each of the following.

| # | Decision |
|---|---|
| D12 | Premise: portfolio now, real later. Built to production standard, with no real money or customers. Going live is a possible future intent |
| D13 | A real backend and database with persistent data, replacing the in-browser simulation |
| D14 | Version 1 scope: storefront; guest and signed-in checkout; discount codes; accounts (sign-up, sign-in, reset, verification, order history, saved addresses); the order lifecycle with stock reservation; transactional emails to a test inbox; admin (catalog, variants, images, stock, orders, refunds, discounts, customers) |
| D15 | Payments go through a real provider integration in test mode, including declines and webhooks |
| D16 | Stack, hosting, payment provider, email provider, database and CI are reopened, to be decided in the plan |
| D17 | Standout: full-stack breadth, keeping the UX-craft quality bar (D9, D10, D11 still apply) |
| D18 | Deferred: wishlist, social login, returns, a sales dashboard, reviews, newsletter, and admin-editable content pages. Out: multi-currency and multi-language, agentic checkout, marketplace, live payments |
| D19 | A time budget isn't fixed. The assumption is no deadline, with delivery in vertical slices (owner: Joe) |

The spec draft written before this revision (`spec.md`, never gated) is obsolete. `/adlc-spec` will rewrite it against the re-approved intent.

## Research input

A `/last30days` run on "ecommerce | ecommerce UX | ecommerce functionality" (2026-10-05) informed the interview. Its raw output is in Joe's Last30Days library as `ecommerce-ux-and-functionality-raw-v3.md`.
