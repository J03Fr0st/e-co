# E-co

A portfolio e-commerce site for a fictional apparel brand: a .NET 10 API with a React single-page app served from the same origin.
Planning artifacts (intent, spec, plan and delivery progress) live in [`docs/adlc/portfolio-storefront`](docs/adlc/portfolio-storefront).

> This readme covers local development. The recruiter-facing readme arrives in slice S13.

## Run it locally

With Docker running:

```bash
docker compose -f deploy/compose.yml up --build
```

The site is at <http://localhost:8080>, and `GET /api/v1/health` reports the database check.

### Develop with hot reload

```bash
docker compose -f deploy/compose.yml up -d postgres   # database only
dotnet run --project src/ECo.Api                      # API on http://localhost:5199, migrates on start
cd src/ECo.Web && npm ci && npm run dev               # SPA on http://localhost:5173, proxies /api
```

## Checks

| What | Command |
| --- | --- |
| API build and tests (integration tests need Docker) | `dotnet test ECo.slnx` |
| API tests without Docker | `dotnet test ECo.slnx --filter "Category!=Integration"` |
| Web type-check, lint, unit tests | `cd src/ECo.Web && npm run typecheck && npm run lint && npm test` |
| End-to-end and axe accessibility gate (site must be running) | `cd tests/e2e && npm ci && npx playwright install && npx playwright test` |

CI runs all of these on every pull request, plus Lighthouse (report only), gitleaks and dependency vulnerability checks.

## Conventions

- **Errors:** RFC 9457 `application/problem+json`. `type` is `/problems/{slug}`; field validation adds an `errors` map.
- **Money:** `{ "amountMinor": 3995, "currency": "GBP" }`. One currency per deployment, set by `Store:Currency` and `Store:Locale`.
- **Antiforgery:** the SPA calls `GET /api/v1/antiforgery`, then sends the `XSRF-TOKEN` cookie value as `X-XSRF-TOKEN` on every state-changing `/api/v1` request (`apiFetch` in `src/ECo.Web/src/api/http.ts` does this).
- **Logging:** structured JSON through Serilog, assembled only in `LoggingSetup`. Before encoding, emails, Luhn-valid card numbers and any property whose name suggests personal or secret data are masked, in properties, template text and exceptions. Add sinks in `LoggingSetup`, never through `Serilog:WriteTo` configuration, which would bypass redaction.
- **Data-protection keys:** set `DataProtection:KeysPath` to a persistent folder (the image uses `/data/keys`, a volume in Compose) so antiforgery and auth cookies survive restarts.
- **Migrations:** applied on start when `Database:MigrateOnStartup` is true (development and local Compose). In production, run `dotnet ECo.Api.dll --migrate` as an explicit step.
