---
adlc: plan
slug: portfolio-storefront
status: approved
source: docs/adlc/portfolio-storefront/spec.md@83e9b44d2a19da386ad35e53e152bb6877e11fa0
---

# Portfolio e-commerce site plan

> Drafted by an agent from the approved spec. Inspected revision: `2f423f4`, an empty repository containing only a licence. Acceptance criterion IDs (AC-nnn) and concern IDs (C1–C8) refer to the spec. Plan decisions are numbered PD-nn so they don't collide with the interview notes' D1–D19.

## Architecture in one paragraph

The system is one deployable unit, a .NET 10 ASP.NET Core application that serves both the JSON API (`/api/v1/*`) and the built React + TypeScript + Vite single-page app from the same origin. Data lives in PostgreSQL through EF Core.

The code is a modular monolith. Each module owns its own tables and exposes a narrow service interface:

| Module | Owns |
|---|---|
| Catalog | products, variants, images |
| Stock | on-hand units, reservations, adjustment log |
| Bag | guest and customer bags |
| Identity | ASP.NET Core Identity with cookie auth and roles |
| Orders | order lifecycle and its timeline |
| Payments | Stripe test mode: PaymentIntents and the webhook |
| Discounts | codes and evaluation |
| Notifications | the demo inbox; nothing is ever sent by SMTP |
| Admin | the admin endpoints |
| Demo | seed data, nightly reset, retention |

Scheduled work runs as in-process hosted services. It runs on Joe's Unraid server under Docker Compose (app, Postgres and `cloudflared`) and is exposed through Cloudflare Tunnel.

## Slices

The repository layout below is used by every slice:
- `src/ECo.Api/`: the ASP.NET Core host and modules, one folder per module.
- `src/ECo.Web/`: the React app. Its build output is copied into the API's `wwwroot` at publish time.
- `tests/ECo.Api.Tests/`: xUnit tests, with Testcontainers for Postgres.
- `tests/e2e/`: Playwright tests.
- `deploy/`: the Compose files and the tunnel config.

**Rules for every slice that adds or changes UI (S2–S13).** Each such slice's check also includes:
- **Axe scans:** of every page and interactive state it adds, as part of the AC-046 gate.
- **Playwright projects:** the slice's specs run in Chromium, Firefox and WebKit, with a mobile WebKit and a mobile Chromium project at 320px for shopper pages, per the C7 browser floor.
- **An `impeccable` critique pass:** with no unresolved blocking item, as the spec's "Always" boundary requires.

### S0 — Walking skeleton and CI
- **Outcome:**
  - `docker compose up` locally serves a placeholder page from the API's origin.
  - `GET /api/v1/health` returns 200, including a check that the database is reachable.
  - CI on every push and pull request runs:
    - the .NET build and tests
    - the web type-check, lint and unit tests
    - the Playwright smoke test with an axe accessibility scan
    - Lighthouse CI (report only)
    - gitleaks, `dotnet list package --vulnerable` and `npm audit`
  - Dependabot is enabled.
- **Produces:**
  - **Solution:** the solution layout above.
  - **API conventions:**
    - Errors are RFC 9457 `application/problem+json`, with `errors` for field validation.
    - Money is `{ amountMinor: int, currency: string }`.
    - Configuration keys are `Store:Currency` and `Store:Locale`.
    - Antiforgery: the SPA reads the `XSRF-TOKEN` cookie and sends `X-XSRF-TOKEN`. Every non-GET `/api/v1/*` endpoint requires it by default, with an explicit opt-out only for the Stripe webhook.
    - Structured logging with a redaction policy: emails, addresses, tokens and anything that looks like a card number are never logged.
  - **Local run:** `deploy/compose.yml` (app plus `postgres:17`).
  - **Browsers:** Playwright projects for Chromium, Firefox, WebKit, mobile WebKit and mobile Chromium.
  - **Test fixtures:** an `AppFactory` integration-test fixture (WebApplicationFactory plus a Testcontainers Postgres) and the Playwright base fixture with an `expectNoA11yViolations(page)` helper.
  - **EF Core:** migrations are applied at startup in development and by an explicit step in production.
- **Consumes:** nothing.
- **Check:**
  - CI is green on a pull request.
  - The smoke test hits `/` and `/api/v1/health`.
  - The axe scan of the placeholder reports zero violations.
  - A deliberately introduced axe violation fails CI. This proves the gate works, and is shown in the PR and then reverted.
  - A POST without the antiforgery header returns 400.
  - A log-redaction unit test passes.
- **Blocked by:** —

### S1 — Deployed skeleton on Unraid
- **Outcome:**
  - The S0 build runs on Unraid behind Cloudflare Tunnel at a public HTTPS hostname.
  - A release is published by GitHub Actions to GHCR on a tag, and applied on Unraid by `deploy/release.sh` (compose pull and up).
  - Forwarded headers are configured. The client IP comes from `CF-Connecting-IP`, trusted only from the `cloudflared` container, so rate limits, HSTS and secure cookies see the real client and scheme.
  - Security headers are set: HSTS, a CSP allowing only self plus Stripe's documented hosts, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy`.
- **Produces:**
  - `deploy/compose.prod.yml` with the app, `postgres:17` and `cloudflared` services, on two networks:
    - `db` (internal: app and Postgres only)
    - `edge` (app and `cloudflared`, with outbound internet for Stripe)
  - A `DOCKER-USER` iptables rule on Unraid that drops traffic from `edge` to LAN ranges.
  - The public base URL, recorded in `progress.md`.
  - A secrets convention: Unraid environment files that are never committed.
- **Consumes:** the S0 image and health check.
- **Check:**
  - The public URL serves the placeholder over HTTPS.
  - An automated header check (curl script in CI against the public URL) confirms every required header.
  - No router port is open, verified by an external port scan showing the server's public IP has no listening HTTP/HTTPS ports.
  - Network isolation holds. From the app container:
    - the Unraid UI and another LAN address are unreachable
    - `api.stripe.com` is reachable
    - Postgres isn't reachable from `cloudflared`
  - A request through the tunnel is logged with the real client IP.
- **Gate:** the spec makes "first public deployment" an "ask first" action, so `/adlc-gate slice S1` records Joe's sign-off before the tunnel route is enabled.
- **Blocked by:** S0, carried items CI-1 (domain) and CI-2 (Cloudflare account and Unraid access).

### S2 — Design foundation (`impeccable`)
- **Outcome:**
  - The visual identity (brand name, palette, type scale, spacing and motion tokens) is shaped with the `impeccable` skill and approved by Joe.
  - Tailwind v4 theme tokens are added.
  - Accessible primitives are built on Radix: Button, TextField with label, hint and error, Select, RadioGroup, Checkbox, Dialog, Toast, Skeleton and ErrorState.
  - Combobox is built on Ariakit, because Radix Primitives has no combobox.
  - The app shell is in place: header with bag count, footer with the privacy note link, skip link and focus styles.
  - A reduced-motion policy is applied.
  - A primitives showcase page is available in development builds only.
- **Produces:**
  - The `@/ui` component exports listed above, each with typed props.
  - Tokens in `src/ECo.Web/src/styles/tokens.css`.
  - The `AppShell` layout.
- **Consumes:** S0.
- **Check:**
  - An axe scan of the showcase in every component state shows zero violations.
  - Keyboard tests cover Dialog focus trap and return, Combobox arrows/Enter/Escape, and RadioGroup arrows.
  - A target-size check passes (24px minimum, 44px for primary actions).
  - With reduced motion emulated, no transition is longer than 0ms.
  - The `impeccable` critique has no unresolved blocking item.
- **Blocked by:** S0. Discovery inside the slice settles CI-3 (visual identity) before any component code.

### S3 — Catalog browsing
- **Outcome:**
  - A home page and a listing with filters (category, size, colour, price) and sort, with state in the URL.
  - Product images are served.
  - The seed catalog (PD-13) loads.
  - Unpublished products are hidden and return 404.
- **Produces:**
  - Endpoints:
    - `GET /api/v1/products?category&size&colour&priceMin&priceMax&sort&page` → `{ items: ProductSummary[], total }`
    - `GET /api/v1/products/{slug}` → `ProductDetail`
  - `ProductDetail` = `{ slug, name, description, priceFromMinor, colours: [{ code, name, images: [{ url, alt }] }], variants: [{ sku, colour, size, priceMinor, available }] }`
  - `IStockQuery.Available(sku)` = on-hand minus active reservations. Stock tables are created here: on-hand per SKU, reservations and an adjustment log.
  - `IDemoSeeder.Seed()`, which is idempotent.
- **Consumes:** S2 primitives and the S0 conventions.
- **Check:**
  - End-to-end tests for AC-001 to AC-004 and AC-007.
  - Integration tests for filter and sort combinations and for unpublished visibility.
  - Axe scans of home and listing.
- **Blocked by:** S2, carried item CI-4 (image source).

### S4 — Search
- **Outcome:** suggestions after 2 or more characters (up to 6), a results view, and a no-results state with alternatives. Matching ignores case and diacritics, via the Postgres `unaccent` extension and trigram similarity (`pg_trgm`).
- **Produces:** `GET /api/v1/search/suggest?q=` → `[{ slug, name, imageUrl }]`, and the `q` parameter on the S3 listing endpoint.
- **Consumes:** S3 endpoints, S2 Combobox.
- **Check:** end-to-end tests for AC-005 (keyboard only) and AC-006; integration tests for diacritics and typos.
- **Blocked by:** S3.

### S5 — Product page and guest bag
- **Outcome:**
  - The product page has a colour and size picker, an unavailable-size state, a low-stock message and a guarded add-to-bag action.
  - The bag has lines, quantity and removal with a 5-second undo, totals with shipping per PD-10, and an empty state.
  - The guest bag is kept by a `bag_id` cookie that is HTTP-only, SameSite=Lax and lasts 30 days.
- **Produces:**
  - Endpoints:
    - `GET /api/v1/bag` → `Bag`
    - `PUT /api/v1/bag/lines/{sku}` with `{ qty }`, which refuses quantities above available with a problem detail of type `stock-exceeded`
    - `DELETE /api/v1/bag/lines/{sku}`
  - `Bag` = `{ lines: [{ sku, name, colour, size, unitMinor, qty, lineMinor, imageUrl, available }], subtotalMinor, discount: null | { code, amountMinor } (always null until S11), shippingOptions: [{ code, minor, freeThresholdRemainingMinor }], totalMinor }`
  - `IBagService` with `Get(bagOwner)`, `Merge(guestBagId, userId)` (used by S6) and `Snapshot(bagOwner)` (used by S7).
- **Consumes:** S3 `ProductDetail` and `IStockQuery`.
- **Check:** end-to-end tests for AC-008 to AC-014, AC-015 (guest reload) and AC-017; axe scans of the product page and bag.
- **Blocked by:** S3.

### S6 — Accounts and demo inbox
- **Outcome:**
  - Sign-up with email verification, sign-in, sign-out and password reset.
  - Rate limits per PD-11.
  - Guest-bag merge on sign-in.
  - The Notifications module writes every message to the demo inbox. A recipient-scoped inbox page shows them.
  - Password policy: at least 8 characters, no composition rules, refused if on the bundled top-100k breached-password list (PD-04). Nothing is sent to an external service.
- **Produces:**
  - Endpoints, all of which require the antiforgery header on state-changing calls:
    - `POST /api/v1/auth/register|login|logout|forgot|reset|verify`
    - `GET /api/v1/me` → `{ id, email, emailVerified, roles[] } | 401`
    - `GET /api/v1/inbox` → messages for the signed-in user, or for the guest order-confirmation token supplied by S7
  - `INotificationSender.Send(DemoMessage { to, subject, html, text, kind, orderId? })`
  - Roles `Customer`, `Admin` and `DemoAdmin`, seeded.
  - Cookie auth with an 8-hour sliding session. Sessions are revoked on password reset by rotating the security stamp, with `SecurityStampValidatorOptions.ValidationInterval = TimeSpan.Zero`, so other sessions end on their next request.
  - An `IAccountGuard` hook that S12 uses to refuse forgot, reset and password change for the `DemoAdmin` account.
- **Consumes:** S2 primitives; S5 `IBagService.Merge`. The merge part is the only piece that waits for S5.
- **Check:**
  - End-to-end tests for AC-030, AC-032 (including a second browser context being signed out on its next request), AC-035, and AC-015 (merge, and the same bag shown in a second browser context for the same customer).
  - Integration tests for AC-031 (generic message and rate limit) and AC-036 (verification and reset kinds).
  - Integration tests for antiforgery rejection and IDOR on `/inbox`.
- **Blocked by:** S2. Bag merge also needs S5.

### S7 — Guest checkout, Stripe payment and stock reservation
- **Outcome:**
  - Guest checkout steps: contact, address, shipping, payment, review, place.
  - Payment uses the Stripe Payment Element in deferred-intent mode: the Element renders from amount and currency, and the PaymentIntent is created when the order is placed. Card is the only payment method, Link is off, and billing details come from the shipping address, so the Element adds only card number, expiry and CVC (AC-019 stays within 14 fields).
  - A privacy-note link appears at the contact step.
  - Placing an order creates an order in `PendingPayment`, reserves stock for 15 minutes (PD-10) and creates a PaymentIntent using an idempotency key derived from the order ID and amount.
  - The order becomes `Paid` only on a verified `payment_intent.succeeded` webhook: reservation committed, confirmation email sent.
  - A declined attempt leaves the order in `PendingPayment` with its PaymentIntent reusable, so the shopper can retry (AC-022).
  - Only the end of the reservation window expires the order. A 1-minute hosted service checks the PaymentIntent's status first, then cancels it and releases the reservation.
  - The confirmation page and a guest order token let the guest open their inbox.
  - The cart price is re-read at checkout, and a changed price is shown before payment.
- **Produces:**
  - Endpoints:
    - `POST /api/v1/checkout` with `{ email, address, shippingCode }` → `{ orderId, clientSecret, totalMinor }`, or problem type `stock-changed` with `{ lines: [{ sku, availableQty }] }`
    - `POST /api/stripe/webhook`, which verifies the signature
    - `GET /api/v1/orders/{id}?token=`
  - `IStockService` with `Reserve(orderId, lines, until)`, `Commit(orderId)`, `Release(orderId)` and `Restore(orderId)`. Each runs in one transaction with row locking on the stock rows, and is idempotent per order.
  - `IOrderLifecycle.Transition(orderId, to, actor, data)`. It enforces the spec's lifecycle table, writes the timeline and is idempotent for webhook replays.
  - `OrderStatus` = `PendingPayment | Paid | Expired | Packed | Shipped | Delivered | Cancelled | Refunded`.
- **Consumes:**
  - S5 `IBagService.Snapshot`, and S3 stock tables and `IStockQuery`.
  - S6 `INotificationSender` and the inbox.
  - S2 primitives.
- **Check:**
  - End-to-end tests against Stripe test mode, via the Stripe CLI forwarding webhooks in CI: AC-018 (guest), AC-020 to AC-024. The tests use cards `4242 4242 4242 4242`, `4000 0000 0000 0002`, `4000 0000 0000 9995` and `4000 0025 0000 3155`.
  - A field-count check for AC-019.
  - Integration tests that replay, duplicate, reorder and tamper with signed webhook events (AC-025).
  - A concurrency test with 20 parallel checkouts for the last unit (AC-027).
  - An expiry test with an injected clock (AC-028).
  - A rate-limit test for checkout (PD-11).
  - A log test confirming that checkout writes no email or address to the logs.
  - The paid-transition stock rule (AC-029, paid part).
  - The confirmation email kind (AC-036).
- **Blocked by:** S5, S6, carried item CI-5 (Stripe account).

### S8 — Signed-in checkout and the customer account area
- **Outcome:**
  - Signed-in checkout with saved and default addresses.
  - Order history and detail with timeline.
  - Address book.
  - Optional account creation after a guest order, which attaches the order.
  - An expired session during checkout keeps the bag and step.
- **Produces:**
  - Endpoints:
    - `GET /api/v1/account/orders`
    - `GET /api/v1/account/orders/{id}`
    - `GET|POST|PUT|DELETE /api/v1/account/addresses`
    - `POST /api/v1/account/claim-order` with `{ orderId, token }`
  - Every account query is scoped to the current user ID on the server.
- **Consumes:** S6 identity and S7 orders.
- **Check:** end-to-end tests for AC-018 (signed in), AC-026, AC-033, AC-034 and AC-035 (checkout return); an integration IDOR test for AC-033.
- **Blocked by:** S7.

### S9 — Admin foundation, catalog and stock
- **Outcome:**
  - An admin area at `/admin`, with role-guarded routes and every `/api/v1/admin/*` endpoint guarded on the server.
  - Product and variant editing, publishing and unpublishing.
  - Image upload per colour:
    - accepts JPEG, PNG and WebP, up to 5 MB
    - re-encoded to WebP with SkiaSharp, stripping metadata
    - stored on the `/data/images` volume
  - Ordering and required alt text.
  - Stock adjustment with a reason and an audit log entry.
- **Produces:**
  - `/api/v1/admin/products*` and `/api/v1/admin/stock/{sku}/adjust` with `{ delta, reason }`.
  - The policy `AdminOrDemoAdmin`, plus a `DemoAdminRestrictions` filter used by S12.
- **Consumes:** S3 catalog and stock, S6 roles, S2 primitives.
- **Check:**
  - End-to-end tests for AC-038 and AC-039.
  - An integration test (AC-037) that enumerates every admin endpoint by reflection and asserts 401/403 for anonymous users and customers.
  - Upload tests with a polyglot file and an oversized file.
  - An axe scan of admin pages at 768px.
- **Blocked by:** S3, S6.

### S10 — Admin order lifecycle, refunds and customers
- **Outcome:**
  - The order list (filter and search) and detail with timeline.
  - Admin actions:
    - pack
    - ship (with an optional tracking reference)
    - deliver
    - cancel: a full Stripe refund and stock restored
    - refund: a full Stripe refund, stock not restored
  - The matching emails are sent.
  - The read-only customer list and detail.
- **Produces:** `/api/v1/admin/orders*`, `/api/v1/admin/orders/{id}/transition` with `{ to, trackingRef? }`, and `/api/v1/admin/customers*`. Refunds go through Stripe with an idempotency key per order.
- **Consumes:** S7 `IOrderLifecycle`, `IStockService` and `INotificationSender`; S9 admin shell.
- **Check:**
  - End-to-end tests for AC-040, AC-041 (ship and refund) and AC-043.
  - Integration tests for every allowed and disallowed transition and the stock rule per transition (AC-029).
  - Email kinds for shipped, cancelled and refunded (AC-036).
- **Blocked by:** S7, S9.

### S11 — Discount codes
- **Outcome:**
  - Admin create, edit, activate and deactivate for percentage and fixed codes, with minimum spend, start and end dates and a use limit.
  - The bag accepts one code, with a reason-specific refusal.
  - The discount flows into the checkout total and the PaymentIntent amount.
  - A use is reserved when an order enters `PendingPayment`, counted against the limit, committed on `Paid` and released on `Expired`. This means concurrent orders can't exceed the use limit. Cancelling a paid order doesn't return the use (the spec doesn't say it should).
- **Produces:**
  - `IDiscountEvaluator.Evaluate(code, bagSnapshot, now)` → `Applied { amountMinor } | Refused { reason: Unknown|Expired|NotStarted|UsedUp|BelowMinimum }`
  - `PUT|DELETE /api/v1/bag/discount`
  - `/api/v1/admin/discounts*`
- **Consumes:** S5 bag, S7 checkout totals, S9 admin shell.
- **Check:** a concurrency test for the last remaining use; a rate-limit test for discount apply (PD-11); integration tests per refusal rule and per boundary (exact minimum, start and end instants in Europe/London across daylight-saving changes); end-to-end tests for AC-016 and AC-042; the AC-013 discount line.
- **Blocked by:** S7, S9.

### S12 — Demo safeguards and reset
- **Outcome:**
  - **Demo admin:** a `demo@…` account with published credentials and the `DemoAdmin` role. It can do every S9 to S11 action. It cannot change its own credentials, manage administrators, export data, or see other users' inboxes. A reset banner is shown.
  - **Nightly reset** at 03:00 Europe/London:
    - Catalog, stock, discounts, orders and admin changes return to seed.
    - Pending Stripe PaymentIntents are cancelled.
    - Customer accounts and inboxes older than 7 days are deleted.
    - Images are restored from the seed set.
  - During the reset (target under 60 seconds) the storefront shows a maintenance state.
- **Produces:** `IDemoResetService.Reset(now)`, a `DemoResetHostedService` and the `DemoAdminRestrictions` rules.
- **Consumes:** S6, S9, S10 and S11 data, and S3 `IDemoSeeder`.
- **Check:**
  - Integration tests for AC-044 (each forbidden action returns 403, and the demo admin's forgot-password, reset and password change are refused through `IAccountGuard` with no email sent) and AC-045 (state after reset equals seed, retention boundary at exactly 7 days, an order in progress during the reset, PaymentIntents cancelled).
  - A manual check of the schedule in production, recorded in `progress.md`.
- **Blocked by:** S6, S10, S11.

### S13 — Release hardening and walkthroughs
- **Outcome:**
  - Accessibility, performance and polish passes:
    - the full `impeccable` audit and polish
    - the manual keyboard and screen-reader pass (desktop with NVDA, phone with VoiceOver on iOS)
    - Lighthouse budgets met or deviations recorded
  - The readme is complete: architecture, UX decisions, test mode and test cards, demo admin credentials and safeguards, reset schedule, limitations and quality gates.
  - A privacy note page.
  - A production release.
  - The AC-047 and AC-048 walkthroughs are observed and recorded.
- **Produces:** the release tag, the readme, and the recorded walkthroughs in `progress.md`.
- **Consumes:** every slice.
- **Check:**
  - Final integration: the full Playwright suite against the production deployment for the combined journey (guest purchase with decline recovery, then the account view, the inbox, and demo admin shipping and refunding the order with stock asserted at each step).
  - AC-046 and AC-049 to AC-051.
  - Zoom to 200% and reflow at 320 CSS px with no loss of content, checked manually and with a Playwright reflow test.
  - The manual pass includes real iOS Safari and Android Chrome devices, per C7.
  - The observed walkthroughs for AC-047 and AC-048.
- **Blocked by:** S1, S4, S8, S12, carried item CI-6 (walkthrough people).

### Dependency graph and frontier

```text
S0 ─┬─ S1 ─────────────────────────────────────────────┐
    └─ S2 ─┬─ S3 ─┬─ S4 ───────────────────────────────┤
           │      ├─ S5 ─┐                             │
           │      │      ├─ S7 ─┬─ S8 ─────────────────┤
           └─ S6 ─┼──────┘      ├─ S10 ─┐              ├─ S13
                  └─ S9 ────────┼───────┤              │
                                └─ S11 ─┴─ S12 ────────┘
```

- **Ready frontier:** S0.
- **After S0:** S1 is externally gated by CI-1 and CI-2, and S2 is ready.
- **After S2:** S3 and S6 can run in parallel. S6's bag-merge part waits for S5.
- **After S3:** S4, S5 and S9 can run in parallel (S9 also needs S6).
- **No cycles.** S7 is the serialising point, because the order, stock and payment contracts are shared by S8, S10, S11 and S12.
- **Integration owner** for parallel work: the root agent running `orchestrate`.

## Review focus

Failure modes no slice check fully exercises yet, ranked by likelihood. Each is assigned to the slice whose check should be extended to cover it.

1. **Money arithmetic.** Discount and free-shipping threshold ordering (PD-10: the threshold applies to the subtotal *after* discount), percentage rounding to minor units, and the total sent to Stripe not matching the displayed total. — S11 (with S7)
2. **A webhook arriving before or without the browser returning.** The shopper closes the tab after paying, or the webhook beats the redirect. The confirmation page must poll the order state rather than assume. — S7
3. **IDOR on token- or ID-addressed resources:** `/orders/{id}?token`, `/inbox`, `/account/*`, the admin transition endpoint. — S6, S7, S8
4. **CSRF and cookie scope** with a same-origin SPA and cookie auth: antiforgery on every state-changing call, including the logout and bag endpoints. — S0 (convention), S5, S6
5. **Price or publish changes between bag and checkout:** a variant unpublished, a price changed, or stock deleted by an admin or the reset. — S7
6. **The reset running during an active checkout or admin edit.** PaymentIntent cancellation and the maintenance state race. — S12
7. **Time zones and daylight saving** for discount windows, reset time and reservation expiry. — S11, S12, S7
8. **Image upload abuse:** polyglot files, decompression bombs, path traversal in file names. — S9
9. **Exposing a home server:** tunnel misconfiguration exposing Postgres or the Unraid UI, or containers reaching the LAN. — S1
10. **Unicode in search and in names and addresses** (diacritics, right-to-left text, emoji), and addresses for the configured locale. — S4, S7

## Decisions

| ID | Decision | Settles | Evidence |
| --- | --- | --- | --- |
| PD-01 | **Backend:** .NET 10 (LTS) ASP.NET Core with EF Core 10 and PostgreSQL 17, built as a modular monolith with one module per bounded area (see Architecture) | Spec open question: stack | Joe chose a React front end with a C#/.NET API. A monolith suits one developer and one host. Modules keep the domain boundaries readable for interviewers |
| PD-02 | **Frontend:** React + TypeScript + Vite single-page app, using React Router, TanStack Query, Radix primitives and Tailwind v4 tokens, served by the API from the same origin | Stack; interview D9 | Same origin keeps the cookie auth and antiforgery simple. SEO isn't a spec requirement |
| PD-03 | **Hosting:** Joe's Unraid server with Docker Compose (app, `postgres:17`, `cloudflared`), public through Cloudflare Tunnel on a Cloudflare-managed domain. Releases are GHCR images applied by `deploy/release.sh`. No backups: demo data is disposable by design (C2) and the seed is in the repo | Stack and hosting; the cost-ceiling assumption | Joe chose self-hosting on Unraid. A tunnel gives HTTPS with no open ports. The running cost is about £0 plus a domain |
| PD-04 | **Identity:** ASP.NET Core Identity with cookie authentication (HTTP-only, Secure, SameSite=Lax, 8-hour sliding session). Antiforgery is required on all state-changing endpoints (from S0). Security-stamp validation runs on every request. The demo admin can't trigger password reset or change. Breached passwords are checked against a bundled offline top-100k list | Spec constraints; the "ask first" rule on dependencies that phone home | An online breached-password API would phone home. The offline list satisfies AC-030 without it |
| PD-05 | **Payments:** Stripe test mode, with the Payment Element and PaymentIntents. State changes come only from signature-verified webhooks. Idempotency keys are used for create and refund. The Stripe CLI forwards webhooks locally and in CI. Startup refuses any Stripe key that isn't a test key: anything containing `_live_` (`sk_`, `rk_`, `pk_`) is rejected. The Payment Element runs in deferred-intent mode, card only, without Link, and with billing details taken from the shipping address | Spec open question: payment provider | Joe chose Stripe. Hosted fields keep card data off the server, as the spec's constraints require |
| PD-06 | **Email:** none is sent. The Notifications module stores messages, and the in-site demo inbox renders them | C3; email provider question | C3 decision. It removes the need for an email provider |
| PD-07 | **Images:** stored on the `/data/images` volume, re-encoded to WebP with SkiaSharp (MIT licence), served with long-cache headers | Image storage | Self-hosted. SkiaSharp has no licensing ambiguity |
| PD-08 | **Testing and CI:** xUnit, WebApplicationFactory and Testcontainers (Postgres); Vitest with Testing Library; Playwright with `@axe-core/playwright` (a hard gate); Lighthouse CI (report only, per AC-050); gitleaks, the vulnerability checks and Dependabot. All on GitHub Actions | Spec open question: test tools and CI | Joe accepted GitHub. These tools cover each "Verify by" in the spec |
| PD-09 | **Currency:** one per deployment, from `Store:Currency` and `Store:Locale`. Defaults are GBP and en-GB. Amounts are stored as integer minor units | Spec open question: currency and locale | Joe answered "configurable", which was clarified as one currency per deployment within the spec's single-currency scope |
| PD-10 | **Thresholds:** standard shipping £3.95, express £7.95, standard free when the subtotal after discount is at least £50. Low stock is 3 or fewer. Reservation window 15 minutes. Verification link 24 hours, reset link 1 hour. Bag-removal undo 5 seconds. Up to 6 search suggestions | Spec open question: threshold values; C5 | These are typical UK apparel values. All are configuration values, not constants |
| PD-11 | **Rate limits** (ASP.NET Core rate limiter), keyed by the client IP from `CF-Connecting-IP` (S1): sign-in 5 per minute per account and per IP, sign-up 3 per hour per IP, forgot-password 3 per hour per email and per IP, discount apply 10 per minute per bag, checkout 5 per minute per bag | C8 | These stop credential stuffing and enumeration while leaving normal shopping untouched |
| PD-12 | **Scheduled jobs** run as in-process hosted services. Reservation expiry every minute. Nightly reset at 03:00 Europe/London | C2; AC-028; AC-045 | A single always-on instance on Unraid, so no external scheduler is needed |
| PD-13 | **Seed data:** 24 products in 4 categories (tops, knitwear, outerwear, trousers), each with 2–4 colours × 5 sizes (XS–XL), stock varied so that every state appears. 5 customers, 20 orders spread across every lifecycle state, 3 discount codes (percentage, fixed, expired) | Spec open question: seed size | Enough to exercise filters, low stock, out of stock and every admin state, without much image work |
| PD-14 | **Sequencing:** deploy early (S1) to remove the home-hosting and tunnel risk first. Design foundation (S2) before any feature UI. S7 (order, stock and payment) as the single serialising contract | — | Uncertain and irreversible pieces go first |

## Carried items

- **CI-1. Public domain name** (registered or moved to Cloudflare DNS; about £10 a year). — owner: Joe — decide by: S1
- **CI-2. Cloudflare account and Unraid access for deployment**, including which Unraid network the containers join and whether the array has space for the images volume. — owner: Joe — decide by: S1
- **CI-3. Visual identity** (brand name, palette, type), shaped with `impeccable` and approved by Joe. — owner: Joe — decide by: S2, before any component code
- **CI-4. Image source and licence**, about 3–5 images per product for each colour (spec open question). — owner: Joe — decide by: S3
- **CI-5. Stripe account** in test mode, with API keys and a webhook signing secret stored as GitHub and Unraid secrets. — owner: Joe — decide by: S7
- **CI-6. Who completes the AC-047 and AC-048 walkthroughs** (spec open question). — owner: Joe — decide by: S13
- **CI-7. Time budget.** The assumption is still "no fixed deadline, delivered in vertical slices". Joe hasn't answered this. It affects ordering only. — owner: Joe — decide by: S1

## Coverage

| Acceptance criterion | Slices | Check |
| --- | --- | --- |
| AC-001 | S3 | Playwright at 375px |
| AC-002 | S3 | Playwright plus a screen-reader check in S13 |
| AC-003 | S3 | Playwright reload and deep link |
| AC-004 | S3 | Playwright |
| AC-005 | S4, S2 | Playwright keyboard only plus S13 screen reader |
| AC-006 | S4 | Playwright |
| AC-007 | S3, S9 | xUnit integration plus Playwright |
| AC-008 | S5 | Playwright |
| AC-009 | S5 | Playwright plus axe |
| AC-010 | S5 | Playwright |
| AC-011 | S5 | Playwright |
| AC-012 | S5 | Playwright plus S13 screen reader |
| AC-013 | S5, S11 | Playwright |
| AC-014 | S5 | Playwright |
| AC-015 | S5, S6 | Playwright: reload (S5); second browser context and merge (S6) |
| AC-016 | S11 | xUnit per rule plus Playwright |
| AC-017 | S5 | Playwright |
| AC-018 | S7, S8 | Playwright, guest and signed in |
| AC-019 | S7 | Automated field-count and attribute check |
| AC-020 | S7 | Playwright plus S13 screen reader |
| AC-021 | S7 | Playwright against Stripe test mode plus xUnit webhook handler |
| AC-022 | S7, S13 | Playwright decline card plus the walkthrough |
| AC-023 | S7 | Playwright insufficient-funds and 3-D Secure cards |
| AC-024 | S7 | xUnit idempotency plus Playwright in-progress state |
| AC-025 | S7 | xUnit replay, duplicate, reorder and tamper |
| AC-026 | S8 | Playwright |
| AC-027 | S7 | xUnit concurrency test plus Playwright message |
| AC-028 | S7 | xUnit with an injected clock |
| AC-029 | S7, S10 | xUnit per transition plus the S13 admin walkthrough |
| AC-030 | S6 | Playwright plus xUnit |
| AC-031 | S6 | xUnit |
| AC-032 | S6 | Playwright plus xUnit |
| AC-033 | S8 | Playwright plus xUnit IDOR |
| AC-034 | S8 | Playwright |
| AC-035 | S6, S8 | Playwright |
| AC-036 | S6, S7, S10 | xUnit per email kind plus manual review in S13 |
| AC-037 | S9 | xUnit reflection over every admin endpoint |
| AC-038 | S9 | Playwright |
| AC-039 | S9 | Playwright plus xUnit audit log |
| AC-040 | S10 | Playwright |
| AC-041 | S10 | xUnit per transition plus Playwright ship and refund |
| AC-042 | S11 | Playwright |
| AC-043 | S10 | Playwright plus xUnit (no edit or export endpoints) |
| AC-044 | S12 | xUnit 403 per forbidden action plus manual review |
| AC-045 | S12 | xUnit reset and retention plus the production schedule check |
| AC-046 | Every UI slice S2–S12 (axe scans per the slice-wide rule), S13 (manual pass) | Axe gate in CI plus the recorded manual pass |
| AC-047 | S13 | Observed walkthrough recorded in `progress.md` |
| AC-048 | S13 | Observed walkthrough recorded in `progress.md` |
| AC-049 | S1, S13 | CI header check plus readme review against the AC list plus CI status |
| AC-050 | S0 (pipeline), S13 (budgets) | Lighthouse CI report |
| AC-051 | S2, S13 | Playwright with reduced motion emulated plus the target-size check |

## Assignment

Agent roles are those of the `orchestrate` skill. The verifier is never the implementer. For every UI slice, the verifier checks that the slice's `impeccable` critique left no blocking item.

| Slice | Implementer | Verifier |
| --- | --- | --- |
| S0 | orchestrate-worker | orchestrate-reviewer |
| S1 | Joe (Unraid and Cloudflare access), with orchestrate-worker writing the Compose, tunnel and release files | orchestrate-tester (header and port checks) |
| S2 | orchestrate-worker using `impeccable` | Joe (identity approval) plus orchestrate-tester (axe, keyboard, target size) |
| S3 | orchestrate-worker | orchestrate-reviewer plus orchestrate-tester |
| S4 | orchestrate-worker | orchestrate-tester |
| S5 | orchestrate-worker | orchestrate-reviewer plus orchestrate-tester |
| S6 | orchestrate-worker | orchestrate-reviewer (security focus) plus orchestrate-tester |
| S7 | orchestrate-worker (the root agent owns integration) | orchestrate-reviewer (security and concurrency focus) plus orchestrate-tester |
| S8 | orchestrate-worker | orchestrate-tester |
| S9 | orchestrate-worker | orchestrate-reviewer (security focus) plus orchestrate-tester |
| S10 | orchestrate-worker | orchestrate-reviewer plus orchestrate-tester |
| S11 | orchestrate-worker | orchestrate-tester |
| S12 | orchestrate-worker | orchestrate-reviewer plus orchestrate-tester |
| S13 | orchestrate-worker (`impeccable` audit and polish, readme) | Joe (the manual accessibility pass and both walkthroughs) plus orchestrate-tester (production suite) |

## Risks and rollback

**How every slice is undone:** each slice merges as its own PR, so the default rollback is a revert of that merge. Schema changes ship as EF Core migrations with a matching down migration. Demo data can always be rebuilt with `IDemoSeeder.Seed()`.

- **Exposing a home server.**
  - Mitigation: Cloudflare Tunnel with no open ports. Containers sit on an isolated Docker network with no LAN route. Postgres isn't published. The Unraid UI is never routed through the tunnel. The S1 port and header checks confirm this.
  - Rollback: stop the `cloudflared` container to take the site offline instantly.
- **Uptime depends on Joe's home power and broadband.**
  - Mitigation: the readme states it is self-hosted. The health endpoint lets an external uptime monitor be added later.
  - Rollback: none needed. The site is simply offline until power and broadband return.
- **Stripe webhooks failing through the tunnel, or tests flaking in CI.**
  - Mitigation: webhook state is reconciled by the expiry job, which checks the PaymentIntent status before expiring. CI runs a small live Stripe test-mode suite and drives the rest from signed fixture events.
  - Rollback: revert the S7 PR. Orders in pending payment simply expire.
- **Concurrency bugs in stock** (overselling).
  - Mitigation: row-locked transactions, the AC-027 parallel test in CI, and the spec's invariant asserted after every integration test.
  - Rollback: revert the S7 PR and reseed.
- **A migration that can't be reversed safely.**
  - Mitigation: the data is disposable (C2), so a production rollback is the previous image plus a reseed.
  - Rollback: `deploy/release.sh <previous-tag>` followed by a reset.
- **Scope size against an unstated time budget** (CI-7).
  - Mitigation: vertical slices. After S7 the site is already a working shop that can be demonstrated. S8 to S12 add depth.
  - Rollback: stop at any slice boundary. Every merged slice is shippable.
- **Visual identity churn delaying feature UI.**
  - Mitigation: CI-3 must be approved before component code in S2, and later slices consume tokens only.
  - Rollback: changing the tokens retheme the app without touching components.
- **The demo admin being abused** (offensive product names, mass deletes).
  - Mitigation: the AC-044 restrictions, the nightly reset, and an admin audit log.
  - Rollback: run `IDemoResetService.Reset` on demand from the Unraid console.

## Handoff

Handoff is to **`orchestrate`**, starting from the ready frontier (S0). S1 needs Joe's action on CI-1 and CI-2. After S2, S3 and S6 can run in parallel, and after S3, S4, S5 and S9 can; the root agent is the integration owner.

At every slice state change, delivery records the following in `progress.md` beside this plan:
- the slice's new state
- its evidence (PR, commit or CI run)
- every decision made during delivery, with who made it

Any sign-off the plan requires goes through `/adlc-gate slice <id>`, as does any carried item due at a slice: S1 (CI-1, CI-2, CI-7), S2 (CI-3), S3 (CI-4), S7 (CI-5) and S13 (CI-6).

## Approvals

| Stage | Decision | Approver | Date | Reviewed revision | Conditions / reasons |
| --- | --- | --- | --- | --- | --- |
| plan | approved | Joe (owner) | 2026-10-05 | 2d3957dadaff23055fc0f28b014ea743620f9693 | — |
