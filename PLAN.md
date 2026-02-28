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

- [ ] PR A: Redis-backed offer rate limiting + failure-mode handling + tests
- [x] PR B: Admin auth upgrade (session/cookie + CSRF)
- [ ] PR C: Metrics background sync + DB snapshots
- [ ] PR D: OpenAPI/docs/readiness finalization
