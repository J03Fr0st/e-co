---
adlc: spec
slug: portfolio-storefront
status: approved
source: docs/adlc/portfolio-storefront/intent.md@a36081bf13609d841a4166b6914ef29badde9036
---

# Portfolio e-commerce site: full store loop for a fictional apparel brand

> Drafted by an agent from the approved intent and the interview notes beside it; decisions marked with an owner await a human. This replaces an earlier, never-gated frontend-only draft.

## Behavior

The system is a public e-commerce site for a fictional apparel brand. It has a server-side system of record for catalog, stock, customers, orders, discounts and payments. It is used in a browser, primarily on a phone for shoppers and on desktop or tablet for administrators. Payments go through a real payment provider in **test mode only**.

Transactional email is generated for every event below. It is never delivered to real mailboxes; it is captured into a **demo inbox** that the recipient can view (see C3).

**Shopper**
1. **Home** introduces the brand and leads into the catalog.
2. **Listing**:
   - Filtering by category, size, colour and price.
   - Sorting by featured, price both ways, and newest.
   - Active filters are reflected in the URL, so a view survives reload and can be shared.
3. **Search** gives suggestions while typing and shows a results view. A no-results state offers ways forward.
4. **Product page**:
   - Shows images, price, description, a colour picker and a size picker.
   - Choosing a colour switches the images.
   - Sizes that are out of stock for the chosen colour are shown but marked unavailable.
   - Low stock is signalled.
   - "Add to bag" requires a valid in-stock variant.
5. **Bag**:
   - Lists line items with quantity controls and removal.
   - Accepts one discount code.
   - Shows subtotal, discount, shipping (or the amount remaining to qualify for free shipping) and total *before* checkout.
   - A guest's bag survives reload in the same browser.
   - A signed-in customer's bag follows them across devices. A guest bag merges into the account bag on sign-in.
6. **Checkout**, as a guest or signed in, with no forced account creation:
   - contact email
   - shipping address (a signed-in customer can pick a saved one)
   - shipping method
   - payment through the provider's hosted card fields
   - review
   - place order

   The total is visible at every step. Errors are shown inline next to the field and summarised for assistive technology. What the shopper entered is kept when they move between steps and when a payment is declined.
7. **Confirmation** shows the order reference, items, total, address and method, and sends the confirmation email. A guest is offered an optional "create an account from this order" step.

**Customer account**
- Sign-up, with email verification by a link in the demo inbox.
- Sign-in, sign-out, and password reset by emailed link.
- Order history, with order detail and current status.
- Saved addresses: add, edit, remove, and set a default.

**Order lifecycle** (states and who moves them)

| From | To | Trigger |
|---|---|---|
| — | pending payment | The shopper places the order. Stock is reserved |
| pending payment | paid | The payment provider confirms payment. The reservation is converted to a stock decrement and the confirmation email is sent |
| pending payment | expired | Payment fails or isn't completed within the reservation window. The reservation is released |
| paid | packed | Admin action |
| packed | shipped | Admin action, with an optional tracking reference. The shipped email is sent |
| shipped | delivered | Admin action |
| paid or packed | cancelled | Admin action. A full refund is issued through the provider, stock is restored, and a cancellation email is sent |
| shipped or delivered | refunded | Admin action. A full refund is issued through the provider, stock is not restored (see C6), and a refund email is sent |

Every transition is recorded in an order timeline (who, when, from, to). Transitions that aren't in this table are refused.

**Administrator**
- A separate admin area reached by sign-in with an administrator role.
- **Catalog:**
  - Products are created, edited, published and unpublished.
  - Each product has variants (size × colour), each with its own SKU, price and stock.
  - Images are uploaded per colour, ordered, and given alt text.
- **Stock:** adjusted per variant, with a reason recorded.
- **Orders:**
  - Listed with filters by status, date, and search by reference or email.
  - The detail view shows the timeline.
  - Lifecycle actions are available per the table above.
- **Discount codes:**
  - Percentage or fixed amount.
  - Optional minimum spend, start and end dates, and total-use limit.
  - Can be activated and deactivated.
- **Customers:** a read-only list with order count and total spent, and a detail view with their orders.
- **Public demo admin login** (see C1): reviewers can sign in with published credentials and do everything above, within the demo safeguards.

**States designed deliberately throughout:**
- loading, without layout shift
- empty
- validation error
- service failure, with retry
- stock changing between bag and payment
- payment declined
- payment slow
- session expired
- forbidden

**Readme for recruiters:**
- the architecture and key decisions
- the UX decisions
- what runs in test mode and how to use the provider's test cards
- the demo admin credentials and the demo safeguards
- the demo-data reset schedule
- known limitations
- how quality is enforced

## Acceptance criteria

**Storefront and discovery**

- **AC-001** — Given the home page on a 375px-wide viewport, when it loads, then the brand, a primary call to action into the catalog and at least one featured product are visible without horizontal scrolling.
  Verify by: automated end-to-end test at phone viewport.
- **AC-002** — Given the listing, when the shopper applies a filter (category, size, colour or price range) or changes the sort, then only matching published products are shown in the chosen order, the result count updates and is announced to assistive technology, and the URL reflects the state.
  Verify by: automated end-to-end test; announcement checked in the manual screen-reader pass.
- **AC-003** — Given a filtered or sorted listing URL, when it is opened fresh or reloaded, then the same filters, sort and results are restored.
  Verify by: automated end-to-end test.
- **AC-004** — Given filters that match nothing, when they are applied, then a no-results state names the active filters and offers one action to clear them.
  Verify by: automated end-to-end test.
- **AC-005** — Given the search field, when two or more characters are typed, then suggestions appear. They can be navigated and chosen by keyboard, and are exposed with the combobox pattern.
  Verify by: automated end-to-end test, keyboard only; manual screen-reader pass.
- **AC-006** — Given a search with no matches, when it is submitted, then a no-results state repeats the term, offers alternatives where they exist, and links back to the catalog.
  Verify by: automated end-to-end test.
- **AC-007** — Given an unpublished product, when a shopper requests it by listing, search or direct URL, then it is not shown, and the direct URL returns a not-found page.
  Verify by: automated integration and end-to-end tests.

**Product page and variants**

- **AC-008** — Given a product with several colours, when a colour is chosen, then the gallery shows that colour's images and the size picker shows availability for that colour.
  Verify by: automated end-to-end test.
- **AC-009** — Given a size with zero available stock for the chosen colour, when the picker is shown, then that size is visibly and programmatically marked unavailable, and can't be added.
  Must not: hide the size. Verify by: automated end-to-end test plus automated accessibility scan.
- **AC-010** — Given no size is chosen, when "Add to bag" is activated, then nothing is added, an inline message asks for a size, and focus moves to the size picker.
  Verify by: automated end-to-end test.
- **AC-011** — Given a variant at or below the low-stock threshold, when it is chosen, then a low-stock message shows the remaining available quantity.
  Verify by: automated end-to-end test.
- **AC-012** — Given a valid in-stock variant, when it is added, then the bag count updates, the change is announced, and a confirmation offers a route to the bag.
  Verify by: automated end-to-end test; announcement checked in the manual pass.

**Bag and discounts**

- **AC-013** — Given items in the bag, when it is viewed, then each line shows image, name, colour, size, unit price, quantity and line total, and the bag shows subtotal, discount, shipping (or the amount remaining for free shipping) and total. Prices are tax-inclusive (see C4).
  Verify by: automated end-to-end test.
- **AC-014** — Given a line item, when its quantity is changed or it is removed, then totals update. A quantity above available stock is refused with an inline explanation. A removal can be undone for a short period.
  Verify by: automated end-to-end test.
- **AC-015** — Given a guest bag, when the page is reloaded in the same browser, then the bag is restored. Given a signed-in customer, when they sign in on another device, then the same bag is shown. Given a guest bag at sign-in, when sign-in completes, then the guest lines merge into the account bag without duplicating a variant line.
  Verify by: automated end-to-end tests.
- **AC-016** — Given a valid, active discount code whose conditions are met, when it is applied, then the discount line and total update. Given a code that is unknown, expired, not yet active, used up, or below its minimum spend, when it is applied, then it is refused with a message naming the specific reason.
  Must not: apply more than one code. Verify by: automated integration tests per rule; end-to-end test for the happy path and one refusal.
- **AC-017** — Given an empty bag, when it is viewed, then an empty state routes back to the catalog.
  Verify by: automated end-to-end test.

**Checkout and payment**

- **AC-018** — Given a non-empty bag, when checkout starts, then it can be completed as a guest with no account prompt, and a signed-in customer can choose a saved address. In both cases the total, including shipping and discount, is visible at every step.
  Must not: require account creation. Verify by: automated end-to-end tests, guest and signed-in.
- **AC-019** — Given the checkout, when its visible input fields are counted for a guest, then there are no more than 14, including the provider's card fields. Fields have visible labels, correct input types and autocomplete hints.
  Verify by: automated check of field count and attributes; manual review.
- **AC-020** — Given invalid or missing input, when the shopper continues, then each error is shown inline in plain language, an error summary receives focus, and what was entered is kept. Moving back and forward between steps keeps all values.
  Verify by: automated end-to-end test; manual screen-reader pass.
- **AC-021** — Given the provider's success test card, when the order is placed, then the order becomes **paid** only after the provider's server-side confirmation is received. The shopper sees the confirmation page, the bag is emptied, and the confirmation email appears in the recipient's demo inbox.
  Verify by: automated end-to-end test against the provider's test mode; integration test of the confirmation handler.
- **AC-022** — Given the provider's decline test card, when the order is placed, then a recoverable, plain-language decline message appears on the payment step. Every other entered value is kept, the bag is kept, and the shopper can retry with another card and complete the same checkout.
  Must not: mark the order paid, or create a second order on retry. Verify by: automated end-to-end test; phone walkthrough (AC-047).
- **AC-023** — Given the provider's insufficient-funds and authentication-required test cards, when the order is placed, then each produces its distinct, recoverable outcome. Authentication-required completes after the provider's challenge.
  Verify by: automated end-to-end tests.
- **AC-024** — Given a slow or repeated submission, when "Place order" is activated more than once or the network retries, then at most one order and one successful charge result. The control shows a visible, announced in-progress state.
  Verify by: automated integration test of idempotency; end-to-end test of the in-progress state.
- **AC-025** — Given the provider's confirmation is delivered late, twice, or out of order, when it is processed, then the order reaches **paid** exactly once and stock is decremented exactly once. A confirmation that fails verification is rejected and changes nothing.
  Verify by: automated integration tests that replay, duplicate, reorder and tamper with confirmation events.
- **AC-026** — Given a guest completed an order, when the confirmation page is shown, then they are offered an optional account creation that attaches this order to the new account.
  Verify by: automated end-to-end test.

**Stock integrity**

- **AC-027** — Given a variant with available stock N, when orders are placed, then the sum of reserved and decremented units never exceeds N. Concurrent attempts for the last unit result in exactly one paid order. The others see a clear out-of-stock message naming the line and the quantity now available, and can adjust and continue without re-entering details.
  Verify by: automated concurrency integration test; end-to-end test of the shopper message.
- **AC-028** — Given an order in **pending payment**, when the reservation window passes without payment, then the order becomes **expired** and its reserved units become available again.
  Verify by: automated integration test with a controllable clock.
- **AC-029** — Given each lifecycle transition, when it completes, then available stock matches the rule in the lifecycle table: decrement on paid, restore on cancel, no restore on refund after shipping.
  Verify by: automated integration test per transition; the admin-loop walkthrough (AC-048).

**Accounts**

- **AC-030** — Given sign-up with an email and password, when it is submitted, then the account is created as unverified and a verification link appears in the demo inbox. The link verifies the account, expires after a set period, and works once. Password rules follow current guidance: a minimum of 8 characters, no composition rules, and common or breached passwords refused.
  Verify by: automated end-to-end and integration tests.
- **AC-031** — Given sign-in, when credentials are wrong, then a generic message is shown that doesn't reveal whether the email exists, and repeated failures are rate-limited.
  Verify by: automated integration tests.
- **AC-032** — Given "forgot password", when an email is submitted, then the response is identical whether or not an account exists. An existing account gets a single-use, time-limited reset link in its demo inbox. Using the link sets a new password and ends the account's other sessions.
  Verify by: automated integration and end-to-end tests.
- **AC-033** — Given a signed-in customer, when they open order history, then they see only their own orders, newest first, with status, and can open an order's detail and timeline.
  Must not: expose another customer's order by changing an identifier. Verify by: automated end-to-end test; integration test for access control.
- **AC-034** — Given a signed-in customer, when they add, edit, remove or set a default address, then the change persists and the default is preselected at checkout.
  Verify by: automated end-to-end test.
- **AC-035** — Given a signed-in session, when the customer signs out or the session expires, then protected pages require sign-in again. An expired session at checkout keeps the bag and returns the shopper to their step after sign-in.
  Verify by: automated end-to-end test.

**Email (demo inbox)**

- **AC-036** — Given each email-triggering event (verification, password reset, order confirmation, shipped, cancelled, refunded), when it occurs, then a correctly addressed message with the right order or link details appears in the recipient's demo inbox within one minute.
  Must not: deliver to any external mailbox. Verify by: automated integration tests per event; manual review of the rendered messages.

**Administration**

- **AC-037** — Given a non-administrator, or no session, when any admin page or admin operation is requested, then access is refused server-side.
  Must not: rely only on hiding links. Verify by: automated integration tests over every admin operation.
- **AC-038** — Given an administrator, when they create or edit a product with variants (size × colour, each with SKU, price and stock), upload and order images per colour with alt text, and publish it, then it appears on the storefront as specified. Unpublishing removes it (AC-007). Required alt text is enforced.
  Verify by: automated end-to-end test.
- **AC-039** — Given an administrator, when they adjust a variant's stock with a reason, then available stock updates on the storefront and the adjustment is recorded with who, when and why.
  Verify by: automated end-to-end and integration tests.
- **AC-040** — Given the order list, when an administrator filters by status or date or searches by reference or email, then matching orders are shown, and the order detail shows items, totals, addresses, payment status and the timeline.
  Verify by: automated end-to-end test.
- **AC-041** — Given an order, when an administrator applies an allowed transition (packed, shipped with an optional tracking reference, delivered, cancelled, refunded), then the order moves, the timeline records it, stock follows AC-029, any refund is issued through the provider in test mode and reflected in the payment status, and the matching email is sent. A disallowed transition is refused with a reason.
  Verify by: automated integration test per transition; end-to-end test of ship and refund.
- **AC-042** — Given the discount screens, when an administrator creates, edits, activates or deactivates a code (percentage or fixed, minimum spend, start and end dates, use limit), then the storefront honours it per AC-016.
  Verify by: automated end-to-end test.
- **AC-043** — Given the customer list, when an administrator opens it, then each customer shows email, sign-up date, order count and total spent, and opens to a detail view with their orders.
  Must not: allow editing or exporting customer data. Verify by: automated end-to-end test.

**Demo safeguards**

- **AC-044** — Given the published demo admin credentials, when a reviewer signs in with them, then they can perform every action in AC-038 to AC-043 on demo data. They cannot change the demo admin's credentials, create or promote administrators, or view any demo inbox other than one addressed to them. A banner states that changes are reset on schedule.
  Verify by: automated integration tests; manual review.
- **AC-045** — Given the scheduled demo reset (see C2), when it runs, then catalog, stock, discounts, orders and admin changes return to the seed state, and accounts and demo inboxes older than the retention period are deleted. The storefront stays available during the reset, or shows a short maintenance state.
  Verify by: automated integration test of the reset; check of the schedule in the deployed environment.

**Quality and success signal**

- **AC-046** — Given every storefront, account and admin page and their main interactive states, when an automated accessibility scan runs in CI, then it reports zero WCAG 2.2 A or AA violations. A recorded manual keyboard and screen-reader pass, covering the shopper journey including decline recovery (desktop and phone) and the admin ship-and-refund journey, finds no blocking issue.
  Verify by: automated scan in CI on the main branch (a hard gate); manual pass recorded before release.
- **AC-047** — Given someone who has never seen the project, using a phone, when they are asked to buy one item using the decline test card first, then without help from Joe they complete the purchase, find the order in their account (or create one from the order), and read the confirmation email in their demo inbox.
  Verify by: observed walkthrough recorded before release (intent success signal 2).
- **AC-048** — Given the order from AC-047, when a reviewer uses the demo admin login to move it to shipped and then refund it, then the customer's demo inbox shows the shipped and refund emails, the order history shows each status, and stock is correct after each step.
  Verify by: observed walkthrough recorded before release (intent success signal 3).
- **AC-049** — Given the public URL, when the site and readme are reviewed, then it is served over HTTPS with security headers. The readme covers architecture, UX decisions, what runs in test mode, test cards, demo admin credentials and safeguards, the reset schedule, known limitations, and how quality is enforced. The CI on the main branch runs and passes the accessibility gate, the end-to-end suite (including failure states) and the integration suite.
  Verify by: manual review against this list; CI status on the main branch (intent success signal 1).
- **AC-050** — Given the home, listing, product and checkout pages on an emulated mid-range phone, when lab performance is measured in CI, then each meets the plan's budget, which targets Core Web Vitals "good" thresholds (LCP ≤ 2.5s, CLS ≤ 0.1, and a lab proxy for INP ≤ 200ms).
  Verify by: lab performance audit in CI (a target, reported but not blocking).
- **AC-051** — Given the user's reduced-motion preference, and interactive controls on a phone, when they are checked, then non-essential motion is reduced, controls meet the WCAG 2.2 target size minimum (24×24 CSS px), and primary actions are at least 44×44 CSS px.
  Verify by: automated end-to-end test with reduced motion emulated; automated target-size check.

## Constraints

**Payment security**
- Card data is entered only into the payment provider's hosted fields and never touches this system's servers, logs or storage.
- Payment state changes only on verified provider confirmations (AC-025).
- Test-mode keys only. Live keys must never be configured.

**Authentication and authorisation**
- Passwords are stored with a modern adaptive hash.
- Sessions use secure, HTTP-only, same-site cookies.
- State-changing requests are protected against cross-site request forgery.
- Every authorisation check is enforced on the server (AC-033, AC-037).
- Sign-in, sign-up, password reset, discount application and checkout are rate-limited.

**Application security**
- Mitigates the OWASP Top 10.
- Security headers, including a content security policy compatible with the payment provider.
- Dependency and secret scanning in CI.
- Uploaded images are validated by type and size and served without executable content.

**Privacy**
- No analytics, tracking or advertising cookies.
- Emails are captured into the demo inbox and never delivered externally.
- Personal data (emails, addresses, order data) is limited to what checkout needs, deleted on the retention schedule (AC-045), and described in a short privacy note linked from the footer and checkout.
- The demo admin cannot export customer data (AC-043).

**Accessibility**
- WCAG 2.2 AA is a release gate across storefront, account and admin (AC-046).
- Respects reduced motion (AC-051) and zoom to 200% without loss of content.

**Performance**
- Mobile Core Web Vitals "good" thresholds are a target, not a gate (AC-050).

**Compatibility**
- Current and previous major versions of Chrome, Edge, Firefox and Safari, plus iOS Safari and Android Chrome (see C7).
- Shopper layouts work from 320px wide; admin layouts from 768px.

**Operability**
- A single deployed environment for the public demo, plus local development.
- Errors are logged server-side without personal or payment data.
- Running costs follow the intent's near-free-tier assumption, settled in the plan.

## Boundaries

- Always:
  - enforce authorisation on the server
  - move order and payment state only through the lifecycle table and verified provider confirmations
  - keep stock arithmetic transactional
  - design loading, empty, error and success states for every view
  - keep the accessibility gate and the end-to-end and integration suites green on the main branch
  - run `impeccable` critique, audit and polish passes before signing off a UI slice
  - state clearly where behavior is in test mode or reset on schedule
- Ask first:
  - adding a dependency that phones home or tracks
  - adding a page or flow beyond this spec
  - changing an acceptance threshold
  - changing the reset schedule or retention period
  - first public deployment
  - any change that would require live payment keys or real email delivery
- Never:
  - configure live payment keys
  - handle raw card data
  - deliver email to external mailboxes
  - let the demo admin create administrators or export customer data
  - skip or disable the accessibility, end-to-end or integration gates to get a build green
  - commit secrets

## Out of scope

Carried from the intent:
- taking real money or real orders, and going live (a possible future intent)
- multiple currencies or languages
- AI or agentic checkout
- marketplace or multi-vendor selling
- a hosted commerce platform as the system of record

Deferred to a later intent:
- wishlist
- social login
- returns and exchanges
- a sales dashboard and reports
- reviews and ratings
- newsletter signup
- admin-editable content pages

Added while specifying:
- partial refunds and per-line refunds (full refunds only, see C6)
- more than one discount code per order
- gift cards
- customer data editing or export by administrators
- multiple administrator roles or permissions
- inventory across several warehouses
- carrier integrations or label printing (tracking is a free-text reference)
- a real tax engine (see C4)
- delivery of email to real mailboxes

## Areas of concern

- **C1. Public demo admin login.** This settles the intent assumption, which is due by spec. Published credentials give reviewers the full admin, within the safeguards in AC-044: it can't manage administrators, can't export customer data, and is subject to a scheduled reset. — owner: Joe — decide by: spec
  Decision: accepted, with the AC-044 safeguards. Decided by Joe (owner), 2026-10-05, replying "accept recommendations".
- **C2. Keeping shared demo data usable.** This settles the intent open question, which is due by spec. A nightly reset returns catalog, stock, discounts, orders and admin changes to seed. Reviewer accounts and demo inboxes older than 7 days are deleted. — owner: Joe — decide by: spec
  Decision: accepted: a nightly reset with 7-day retention, not isolated sandboxes per reviewer. Decided by Joe (owner), 2026-10-05, replying "accept recommendations".
- **C3. How reviewers see emails.** Messages are captured into a demo inbox viewable inside the site, limited to the signed-in recipient, or to the guest's order confirmation session. No message is ever delivered externally. — owner: Joe — decide by: spec
  Decision: accepted: an in-site demo inbox, with nothing delivered externally. Decided by Joe (owner), 2026-10-05, replying "accept recommendations".
- **C4. Tax.** Prices are tax-inclusive with no separate tax line or tax engine. — owner: Joe — decide by: spec
  Decision: accepted as written. Decided by Joe (owner), 2026-10-05, replying "accept recommendations".
- **C5. Shipping.** Standard and express at flat rates, with standard free above a threshold shown in the bag. The values are set in the plan. — owner: Joe — decide by: spec
  Decision: accepted as written. Decided by Joe (owner), 2026-10-05, replying "accept recommendations".
- **C6. Refund and stock rules.** Full refunds only. Cancelling before shipping restores stock. Refunding after shipping doesn't, because there is no returns flow. — owner: Joe — decide by: spec
  Decision: accepted: full refunds only, with partial refunds deferred. Decided by Joe (owner), 2026-10-05, replying "accept recommendations".
- **C7. Browser support floor.** Current and previous major versions plus mobile Safari and Chrome. Shopper layouts from 320px, admin from 768px. — owner: Joe — decide by: spec
  Decision: accepted as written. Decided by Joe (owner), 2026-10-05, replying "accept recommendations".
- **C8. Abuse of public sign-up and checkout.** Rate limits only (see Constraints), with no CAPTCHA unless abuse appears. — owner: Joe — decide by: spec
  Decision: accepted: rate limits only, no CAPTCHA. Decided by Joe (owner), 2026-10-05, replying "accept recommendations".

## Open questions

- What are the stack, hosting, database, payment provider, email-capture approach, test tools and CI? — owner: Joe — decide by: plan
- Is there a running-cost ceiling per month? (intent assumption) — owner: Joe — decide by: plan
- Is there a time budget, or is it really "no fixed deadline, delivered in vertical slices"? (intent assumption) — owner: Joe — decide by: plan
- What are the display currency and locale? — owner: Joe — decide by: plan
- What are the shipping rates, free-shipping threshold, low-stock threshold, reservation window, link expiry periods, undo period and suggestion count? — owner: plan author — decide by: plan
- What is the visual identity (brand name, palette, type), shaped with `impeccable`? — owner: Joe — decide by: plan (before the first UI slice)
- What is the image source and licence for about 3–5 images per product? (intent assumption) — owner: Joe — decide by: plan
- What seed catalog size, and how many seed customers and orders? — owner: plan author — decide by: plan
- Who completes the walkthroughs for AC-047 and AC-048? (intent assumption) — owner: Joe — decide by: plan

## Source material

None was pasted to this stage. Inputs were the approved intent and the interview notes beside it. The 14-field checkout ceiling (AC-019), tax-inclusive pricing and up-front shipping cost follow the published Baymard checkout research cited during the interview. The password rules in AC-030 follow current NIST digital identity guidance.

~~~text
none
~~~

## Approvals

| Stage | Decision | Approver | Date | Reviewed revision | Conditions / reasons |
| --- | --- | --- | --- | --- | --- |
| spec | approved | Joe (owner) | 2026-10-05 | 83e9b44d2a19da386ad35e53e152bb6877e11fa0 | — |
