# PLAN

## M0 Bootstrap + Registry

- [x] Monorepo scaffold (`apps/web`, `packages/core`)
- [x] Add root docs (`README.md`, `PLAN.md`, `STATUS.md`)
- [x] Add schemas:
  - [x] `schemas/startupshop.schema.json`
  - [x] `schemas/offer.schema.json`
- [x] Add sample listings and index:
  - [x] `listings/*.yaml` (3 examples)
  - [x] `index.yaml`
- [x] Implement core listing loader + AJV validation
- [x] Add `pnpm validate:listings` script
- [x] Add CI workflow to run listing validation

## M1 API + Scoring

- [x] Add scoring model in `packages/core`
- [x] `GET /api/startups`
- [x] `GET /api/startups/:id`
- [x] `GET /api/startups/:id/validation`
- [x] Update `agents/openapi.yaml`

## M2 UI

- [x] Catalog page with search/filter/sort
- [x] Startup detail page
- [x] Offer submission page

## M3 Offers

- [x] Prisma + SQLite in `apps/web`
- [x] `POST /api/offers`
- [x] Admin offers page with `ADMIN_TOKEN`

## M4 Metrics + Verified Badge

- [x] `GET /api/startups/:id/metrics` proxy + caching
- [x] UI metrics display + verified badge

## v0.1.1 Hardening

- [x] API tests for offers and metrics routes
- [x] Offer API rate limit + payload size limit
- [x] Structured API logging + `/api/health` endpoint

## v0.2.0 Operational Quality

- [x] PR A: Redis-backed offer rate limiting + failure-mode handling + tests
- [x] PR B: Admin auth upgrade (session/cookie + CSRF)
- [x] PR C: Metrics background sync + DB snapshots
- [x] PR D: OpenAPI/docs/readiness finalization

## v0.2.1 Stabilization

- [x] Cross-PR cleanup and documentation sync
- [x] Flaky-test/CI stabilization (`.next` type artifact mitigation + single-install CI)
- [x] Security baseline pass (headers + admin secret readiness checks)

## v0.2.2 UI Theming (LewkAI Design System)

- [x] Apply LewkAI global styles in `apps/web/app/globals.css` (Tailwind v4 + CSS tokens)
- [x] Apply LewkAI layout in `apps/web/app/layout.tsx` (Outfit + Space Grotesk + fixed nav shell)
- [x] Restyle catalog/detail/offer/admin routes with design-system utility classes
- [x] Add Tailwind v4 PostCSS integration (`apps/web/postcss.config.js`)
