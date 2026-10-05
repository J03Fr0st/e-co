# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Recruiters and hiring managers** (primary). They usually open a public link on a phone, between other tasks. Their job is to judge in a few minutes whether the builder can ship a real product: they shop like a customer, may sign in to the demo admin, and skim the readme.
- **Interviewers.** They go deeper into code, architecture and decisions, usually on desktop.
- **Shoppers, customers and administrators** are roles these reviewers play against demo data. There are no real customers and no real money.

## Product Purpose

A complete online store for a fictional brand of sustainable everyday basics. It proves end-to-end engineering and UX craft for Joe's portfolio. A reviewer can browse, choose a size and colour, check out as a guest or signed in, pay through Stripe in test mode, read the emails in an in-site demo inbox, and then run the admin side: catalog, stock, orders, refunds, discounts and customers.

Success means a stranger can finish a purchase on a phone with no help, including recovering from a declined test payment, and then see the admin loop work, with all quality gates green in CI.

## Positioning

The store is a showcase, not a business. Its claim is that the craft is visible and checkable: accessibility, failure-state handling and correct stock and payment behaviour are enforced by automated gates and documented, not merely asserted. The fictional brand gives that craft a believable subject.

The brand itself sells durable wardrobe staples, made responsibly: tops, knitwear, outerwear and trousers.

## Operating Context

- Reviewers arrive from a CV, job application or message link, mostly on mobile and with little time.
- Everything runs in test mode: Stripe test cards, a demo inbox instead of real email, published demo admin credentials, and a nightly reset of demo data.
- The site is self-hosted on Joe's home server behind Cloudflare Tunnel.

## Capabilities and Constraints

- **Version 1 includes:**
  - a storefront with listing, filters, search, a product page with size and colour variants, and a bag
  - guest and signed-in checkout
  - discount codes
  - accounts, with order history and saved addresses
  - the full order lifecycle with stock reservation
  - transactional emails captured to the demo inbox
  - an admin for catalog, stock, orders, refunds, discounts and customers
- **Out of scope:** real payments or orders, multiple currencies or languages, AI or agentic checkout, marketplace selling, wishlists, reviews, returns, newsletters.
- **Currency:** one per deployment, GBP and en-GB by default.
- **Stack (already in the codebase):** a React + TypeScript + Vite single-page app served by a .NET 10 API. Tailwind v4 tokens, with Radix primitives (and Ariakit for the combobox).
- **Contract:** the approved spec and plan in `docs/adlc/portfolio-storefront/` are binding.

## Brand Commitments

- **Concept:** sustainable everyday basics.
- **Name:** undecided. Candidates are to be proposed and chosen by Joe at the S2 identity sign-off. "E-co" is the repository name, not the brand.
- **Binding visual constraints:** none.

## Evidence on Hand

- There are no real product photos, customers, testimonials, certifications or sustainability metrics.
- Product imagery comes from a free-licence source still to be chosen (carried item CI-4).
- Future work must not invent certifications (for example "B Corp", "GOTS certified"), carbon numbers, customer counts or press quotes. Sustainability copy stays at the level of honest, generic brand voice for a fictional label.

## Product Principles

1. **Show, don't claim.** Every quality the store presents has a check behind it.
2. **Fast to judge on a phone.** The first screen and the purchase path must make sense in seconds.
3. **Failure is part of the design.** Declined payments, low stock and errors are designed states, not afterthoughts.
4. **Honest fiction.** The brand is clearly fictional and test-mode. No fabricated proof.

## Accessibility & Inclusion

- WCAG 2.2 AA is a release gate across the storefront, account and admin.
- Respect reduced motion and zoom to 200%.
- Touch targets at least 24×24 CSS px, and primary actions at least 44×44.
- Shopper layouts work from 320px wide.
