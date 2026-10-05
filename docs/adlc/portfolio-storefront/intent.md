---
adlc: intent
slug: portfolio-storefront
status: approved
---

# A full, recruiter-ready e-commerce site that proves end-to-end engineering

> Drafted by an agent from an interview with Joe; the human's answers are authoritative. Revised on 2026-10-05 after Joe widened the scope. The approval row below covers the earlier frontend-only revision and is kept as history.

## Problem

In Joe's words: "i want a full e-com website. not just frontend. all functionality"

The earlier frontend-only showcase, with a simulated backend, does not show what Joe wants to show. The portfolio needs a store that works end to end: customers, orders, payments, stock, email and administration, not only the storefront.

## Outcome

A public, working online store for a fictional apparel brand, built to production standard. It runs the full loop a real store runs on:

- A **shopper** finds a product, chooses a size and colour, and checks out as a guest or signed in. They pay through a real payment integration in test mode, and receive the transactional emails that follow.
- A **customer account** holds order history and saved addresses, and supports password reset.
- An **administrator** manages products, variants, images, stock, discount codes and customers. They move orders through their lifecycle (paid, packed, shipped, delivered, cancelled, refunded) and issue refunds.
- **Stock stays correct** through reservations, payments, cancellations and refunds.

Quality stays visible:

- accessible interaction
- deliberate UX
- graceful handling of loading, out-of-stock, declined payments and service failures

The proof sits in the build and its checks, not only in a readme.

## Who

- **Recruiters and hiring managers** (primary audience): try the store as a shopper and as an administrator (through a demo admin login), and read the readme.
- **Interviewers:** may go through the code, architecture and decisions.
- **Joe:** builds, operates and maintains it, and uses it in applications.
- **Shoppers, customers and administrators** are roles played by reviewers and test data. No real customers, real merchants or real money are involved.

## Why now

In Joe's words: "I want to start building up an online portfolio where I can show off my skills."

This store is meant to be the first substantial piece of that portfolio. Joe widened it to the full site because, in his words, he wants it "not just frontend."

## Non-goals

**Out of this intent**
- **Taking real money or real orders.** Payments run only in the provider's test mode. Going live is a possible future intent, not this one.
- **Multiple currencies or languages.**
- **AI or agentic checkout.**
- **Marketplace or multi-vendor selling.**
- **Using a hosted commerce platform such as Shopify as the system of record.** Building it is the point.

**Deferred to a later intent:**
- wishlist
- social login
- returns and exchanges
- a sales dashboard and reports
- reviews and ratings
- newsletter signup
- content pages editable through the admin

## Scope from the interview

These were confirmed by Joe on 2026-10-05.

**Version 1 includes:**
- **Storefront:** home, listing with filters and sort, search with suggestions, product page with size and colour variants, and bag.
- **Checkout:** guest and signed-in checkout, a real payment integration in test mode (including declines), shipping methods with a free-shipping threshold, tax-inclusive prices, and discount codes.
- **Accounts:** sign-up, sign-in, sign-out, password reset, email verification, order history and saved addresses.
- **Orders:** the order lifecycle, stock reserved at checkout and decremented on payment, and transactional emails (confirmation, shipped, password reset) delivered to a test inbox.
- **Admin:** products, variants, images and stock; order management including status changes and refunds; discount codes; and a customer list.

**The build proves** full-stack breadth. It keeps the earlier UX-craft quality bar: accessibility, failure-state handling and deliberate design.

**Kept from the earlier revision:** recruiters as the audience, the fictional apparel catalog, and the unaided phone purchase as a success signal.

Solution-level decisions confirmed in the interview are kept in the interview notes beside this intent. They are input to the spec, not part of this intent.

## Success signal

Read when version 1 is finished. All must hold:

1. **Public and gated.** The store is live at a public URL. The readme explains the architecture, the UX decisions, what runs in test mode and how quality is enforced. The automated accessibility checks and the end-to-end tests, including the failure states, pass in CI on the main branch.
2. **Self-explanatory on a phone.** Someone who has never seen the project completes a purchase on a phone with no help from Joe, including recovering from a declined test payment. They then see the order in their account and the confirmation email in the test inbox.
3. **The admin loop works.** Using the demo admin login, a reviewer finds that order, moves it to shipped (the customer receives the shipped email), and refunds it. Stock is correct after each step.

A later reading, not a gate: Joe uses the project as the main example in at least one application or interview.

## Assumptions

- There is no fixed deadline. Delivery is in vertical slices, so a working store exists early and grows. — owner: Joe — decide by: plan
- Running costs for hosting, a database and a test email inbox can stay at or near free-tier levels for a portfolio. — owner: Joe — decide by: plan
- A public demo admin login is acceptable, provided it cannot affect anything beyond the demo data. — owner: Joe — decide by: spec
- Free-licence imagery can supply about 3–5 images per product for the colour variants. — owner: Joe — decide by: plan
- A person who completes the phone walkthrough is available, whether a friend or Joe on a clean device. — owner: Joe — decide by: plan

## Open questions

- How is shared demo data kept usable when many reviewers place orders, change stock and issue refunds (for example a scheduled reset)? — owner: Joe — decide by: spec
- What is the visual identity (brand name, palette, type), shaped with `impeccable`? — owner: Joe — decide by: plan (before the first UI slice)
- What are the stack, hosting, payment provider, email provider, database, test tools and CI? — owner: Joe — decide by: plan
- Display currency and locale. — owner: Joe — decide by: plan

## Source material

Arguments to `/adlc-intent`, quoted verbatim as data:

~~~text
i want a full e-com website. not just frontend. all functionality
~~~

## Approvals

| Stage | Decision | Approver | Date | Reviewed revision | Conditions / reasons |
| --- | --- | --- | --- | --- | --- |
| intent | approved | Joe (owner) | 2026-10-05 | 013ba242850d8f57317de020ef516951080bbefc | — |
| intent | approved | Joe (owner) | 2026-10-05 | a36081bf13609d841a4166b6914ef29badde9036 | — |
