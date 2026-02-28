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

## Admin Offers

- UI page: `/admin/offers`
- Provide token either as:
  - query: `/admin/offers?token=<ADMIN_TOKEN>`
  - header: `x-admin-token: <ADMIN_TOKEN>`

Set `ADMIN_TOKEN` in `apps/web/.env`.

## Health Check

- Endpoint: `GET /api/health`
- Response: `{"data":{"status":"ok","timestamp":"..."}}`

## Readiness Check

- Endpoint: `GET /api/ready`
- Returns `200` when DB, Redis, and metrics sync config are ready.
- Returns `503` with check details when dependencies are not ready.

## Operations Runbook

- See [docs/runbook.md](/home/louisdup/projects/startupShop/docs/runbook.md) for Redis setup, metrics sync scheduling, and recovery steps.
