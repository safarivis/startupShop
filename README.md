# startupShop MVP

startupShop is a Next.js monorepo for browsing startup listings stored in Git, validating them via JSON Schema, and submitting acquisition offers.

## Stack

- Next.js App Router (`apps/web`)
- TypeScript
- Shared registry/validation in `packages/core`
- YAML listing format
- JSON Schema validation
- SQLite + Prisma for offers (planned in M3)

## Local Development

```bash
pnpm install
pnpm dev
```

## Validate Listings

```bash
pnpm validate:listings
```

CI also runs listing validation on pull requests and pushes.

## Add a Listing

1. Create a file at `listings/<startup-id>.yaml`.
2. Ensure it matches `schemas/startupshop.schema.json`.
3. Add entry to `index.yaml`:

```yaml
listings:
  - startup_id: your-startup-id
    path: listings/your-startup-id.yaml
```

4. Run `pnpm validate:listings`.

## Submit an Offer

Offer flow is implemented in M3:

- API endpoint: `POST /api/offers`
- UI page: `/startup/[id]/offer`

Offer payload schema is defined now in `schemas/offer.schema.json`.
