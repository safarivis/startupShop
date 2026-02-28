# startupShop Runbook

## Overview

This runbook covers operational setup and recovery for:

- Redis-backed rate limiting (when enabled)
- Metrics snapshot sync
- Readiness checks

## Required Environment

Set these in `apps/web/.env` (or production secret manager):

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `REDIS_URL`
- `METRICS_SYNC_TOKEN`

Optional tuning:

- `OFFER_RATE_LIMIT_MAX_REQUESTS`
- `OFFER_RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_REDIS_FAILURE_MODE`
- `METRICS_STALE_AFTER_MS`

## Readiness and Health

- Liveness: `GET /api/health`
- Readiness: `GET /api/ready`

`/api/ready` checks:

- Database query success
- Redis ping success
- Presence of `METRICS_SYNC_TOKEN`
- Presence of admin auth secrets (`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`)

If readiness fails, endpoint returns `503` with check details.

## Metrics Sync Scheduling

Use a scheduler (cron, GitHub Actions, cloud scheduler) to call:

- `POST /api/internal/metrics/sync`
- Header: `x-sync-token: <METRICS_SYNC_TOKEN>`

Recommended cadence: every 5 to 15 minutes.

## Failure Recovery

### Redis unavailable

1. Check Redis connectivity and credentials.
2. Verify `REDIS_URL` value.
3. Call `GET /api/ready` and confirm `checks.redis.ok` is `true`.

### Metrics sync failures

1. Trigger a manual sync request with valid `x-sync-token`.
2. Inspect response `details` to identify failing startup IDs.
3. Verify each listing's `metrics_url` endpoint returns JSON and a `200` status.

### Database issues

1. Verify `DATABASE_URL` and DB file/connection permissions.
2. Run migrations if needed: `pnpm db:migrate`.
3. Re-check readiness via `GET /api/ready`.
