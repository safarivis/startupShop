# STATUS

- Last updated: 2026-03-01
- Milestones complete: 5 / 5 (M0, M1, M2, M3, M4)
- Listings in registry: 3
- Validation status: passing locally
- API endpoints implemented: 5 / 5
- OpenAPI coverage: all MVP endpoints documented
- UI pages implemented: 4 / 4 through M4
- Hardening (v0.1.1): complete
- v0.2.0 PR A: complete locally (Redis limiter + failure mode + tests)

## Endpoint Status

- `GET /api/startups` - implemented (M1)
- `GET /api/startups/:id` - implemented (M1)
- `GET /api/startups/:id/validation` - implemented (M1)
- `POST /api/offers` - implemented (M3)
- `GET /api/startups/:id/metrics` - implemented (M4)

## UI Route Status

- `/` - implemented (M2 catalog)
- `/startup/[id]` - implemented (M2 detail + M4 metrics/verified badge)
- `/startup/[id]/offer` - implemented (M2 offer form)
- `/admin/offers` - implemented (M3 admin view)

## Hardening Status

- API test suite: implemented (`pnpm test:api`)
- Offer abuse controls: implemented (`413` body cap, `429` IP rate limit)
- Observability: structured API logs + `GET /api/health`

## v0.2.0 Status

- Redis-backed limiter: implemented for `POST /api/offers` when `REDIS_URL` is set
- Failure mode: configurable with `RATE_LIMIT_REDIS_FAILURE_MODE` (`fail_closed` default)
- Degraded fallback: in-memory limiter if Redis URL is unset (dev) or explicit fail-open on Redis outage
