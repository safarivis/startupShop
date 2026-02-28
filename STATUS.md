# STATUS

- Last updated: 2026-03-01
- Milestones complete: 5 / 5 (M0, M1, M2, M3, M4)
- Listings in registry: 3
- Validation status: passing locally
- API endpoints implemented: 10 / 10
- OpenAPI coverage: v0.2.1 documented
- UI pages implemented: 4 / 4 through M4
- Hardening (v0.1.1): complete
- v0.2.0: complete (PR A-D merged)
- v0.2.1: stabilization complete locally

## Endpoint Status

- `GET /api/startups` - implemented (M1)
- `GET /api/startups/:id` - implemented (M1)
- `GET /api/startups/:id/validation` - implemented (M1)
- `POST /api/offers` - implemented (M3)
- `GET /api/startups/:id/metrics` - implemented (M4)
- `POST /api/internal/metrics/sync` - implemented (v0.2.0)
- `POST /api/admin/session` - implemented (v0.2.0)
- `DELETE /api/admin/session` - implemented (v0.2.0)
- `GET /api/health` - implemented (v0.1.1)
- `GET /api/ready` - implemented (v0.2.1)

## UI Route Status

- `/` - implemented (M2 catalog)
- `/startup/[id]` - implemented (M2 detail + M4 metrics/verified badge)
- `/startup/[id]/offer` - implemented (M2 offer form)
- `/admin/offers` - implemented (M3 admin view)
- `/admin/login` - implemented (v0.2.0)

## Hardening Status

- API test suite: implemented (`pnpm test:api`)
- Offer abuse controls: implemented (`413` body cap, `429` IP rate limit)
- Observability: structured API logs + `GET /api/health`

## v0.2.0 Status

- Redis-backed limiter: implemented for `POST /api/offers` when `REDIS_URL` is set
- Failure mode: configurable with `RATE_LIMIT_REDIS_FAILURE_MODE` (`fail_closed` default)
- Degraded fallback: in-memory limiter if Redis URL is unset (dev) or explicit fail-open on Redis outage

## v0.2.1 Status

- CI optimized to single-install quality job (validate + tests + typecheck)
- Typecheck stabilized against stale `.next` artifacts
- Security baseline headers enforced via middleware
- Readiness now checks admin auth secret configuration
