# startupShop MVP

startupShop is a Next.js monorepo for browsing startup listings stored in Git, validating them via JSON Schema, and submitting acquisition offers.

## Stack

- Next.js App Router (`apps/web`)
- TypeScript
- Shared registry/validation in `packages/core`
- YAML listing format
- JSON Schema validation
- SQLite + Prisma for offers

## Local Development

```bash
pnpm install
cp apps/web/.env.example apps/web/.env
pnpm db:migrate
pnpm dev
```

## Validate Listings

```bash
pnpm validate:listings
```

CI runs listing validation on pull requests and pushes.

## API Tests

```bash
pnpm test:api
```

## Rate Limiting (Offers API)

`POST /api/offers` uses Redis-backed fixed-window limiting when `REDIS_URL` is set.

Config (in `apps/web/.env`):

- `REDIS_URL` - Redis connection URL (enables distributed limiter)
- `OFFER_RATE_LIMIT_MAX_REQUESTS` - max requests per window (default `10`)
- `OFFER_RATE_LIMIT_WINDOW_MS` - window duration in ms (default `900000`)
- `RATE_LIMIT_REDIS_FAILURE_MODE` - `fail_closed` (default) or `fail_open`

If `REDIS_URL` is unset, the app falls back to in-memory limiting for local/dev use.

## Add a Listing

1. Create a file at `listings/<startup-id>.yaml`.
2. Ensure it matches `schemas/startupshop.schema.json`.
3. Add an entry to `index.yaml`:

```yaml
listings:
  - startup_id: your-startup-id
    path: listings/your-startup-id.yaml
```

4. Run `pnpm validate:listings`.

## Submit an Offer

- UI page: `/startup/[id]/offer`
- API endpoint: `POST /api/offers`

Offer payload must match `schemas/offer.schema.json`.

## Admin Access

- Login page: `/admin/login`
- Admin offers page: `/admin/offers`
- Auth model: secure httpOnly session cookie
- CSRF model: `admin_csrf` cookie + `x-csrf-token` header for state-changing admin actions (for example logout)

Set these in `apps/web/.env`:

- `ADMIN_PASSWORD` - required admin login password
- `ADMIN_SESSION_SECRET` - signing secret for session tokens
- `ADMIN_SESSION_TTL_SECONDS` - session lifetime in seconds (default `28800`)

`ADMIN_TOKEN` is retained as a compatibility fallback and should be considered deprecated.

## Health Check

- Endpoint: `GET /api/health`
- Response: `{"data":{"status":"ok","timestamp":"..."}}`
