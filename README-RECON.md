# EVA RECON: startupShop Project Status

**Generated:** 2026-02-28  
**Branch:** main  
**Commit:** f88b9f1  
**Repository:** https://github.com/safarivis/startupShop.git

---

## Executive Summary

| Metric | Status |
|--------|--------|
| Milestones | 5/5 Complete (M0-M4) |
| Releases | v0.1.0 (MVP), v0.1.1 (Hardening) |
| Test Suite | 9/9 Passing |
| Listings | 3 Valid |
| API Endpoints | 5/5 Operational |
| UI Pages | 4/4 Implemented |

---

## AI Velocity Canvas

### Customer Need
Marketplace for browsing/acquiring startups via Git-tracked YAML listings with offer submission workflow.

### Tech Capability
- Next.js App Router + TypeScript
- SQLite + Prisma persistence
- JSON Schema validation (AJV)
- API rate limiting & abuse controls
- Structured logging & health checks

### Unique Value
Git-native registry (version controlled listings), automated validation, integrated offer pipeline.

### Base Rate Success %
**95%** - All milestones delivered, tests passing, CI green.

### Pre-mortem Risks
| Risk | Mitigation |
|------|------------|
| SQLite not production-grade | Migrate to PostgreSQL for scale |
| Rate limit memory store | Use Redis in multi-instance deploy |
| No auth system | ADMIN_TOKEN is temporary |

### KISS Check
✅ **PASS** - Minimal viable architecture, no over-engineering.

### TDD Status
✅ **ACTIVE** - Vitest suite with 9 API tests (offers, metrics, health).

---

## Services & Infrastructure

### Docker Services (Host)
| Container | Image | Ports | Status |
|-----------|-------|-------|--------|
| truster-db | postgres:16-alpine | 5432 | Running |
| qfieldcloud-app | qfieldcloud-app | 5678, 8011 | Running |
| qfieldcloud-db | postgis:13-3.1-alpine | 5433 | Running |

**Note:** startupShop runs local Node.js (not containerized currently).

### Listening Ports
- 80 (HTTP)
- 5432 (PostgreSQL)
- 5433 (PostGIS)
- 5678 (QFieldCloud debug)
- 8011 (QFieldCloud app)

---

## Code Health

### Build Status
```
✅ pnpm validate:listings - PASS (3 listings)
✅ pnpm test:api - PASS (9 tests)
✅ pnpm -r typecheck - PASS
✅ pnpm build - PASS
```

### Blockers
**NONE** - No TODO/FIXME/BLOCKER in source code.

### Dependencies
- Next.js 15.2.0 (deprecated warning noted)
- Prisma 6.5.0
- Vitest 3.0.8
- AJV 8.17.1

---

## API Endpoints

| Endpoint | Status | Tests |
|----------|--------|-------|
| GET /api/health | ✅ | 200 OK |
| GET /api/startups | ✅ | - |
| GET /api/startups/:id | ✅ | - |
| GET /api/startups/:id/validation | ✅ | - |
| POST /api/offers | ✅ | 201, 400, 413, 429 |
| GET /api/startups/:id/metrics | ✅ | 200, 404, 502 |

---

## UI Routes

| Route | Status |
|-------|--------|
| / | Catalog |
| /startup/[id] | Detail + Metrics + Verified Badge |
| /startup/[id]/offer | Offer Form |
| /admin/offers | Admin View (token auth) |

---

## CI/CD

**Workflow:** `.github/workflows/ci.yml`
- validate-listings job
- test-api job

**Status:** Green on main

---

## Files Changed (Last Commit)
```
f88b9f1 feat(v0.1.1): add API tests, offer limits, and health logging (#11)
- CI, PLAN, README, STATUS updated
- OpenAPI spec expanded
- 16 files changed, 508 insertions(+)
```

---

## Next Actions
1. Consider PostgreSQL migration for production
2. Add Redis for distributed rate limiting
3. Implement proper auth (replace ADMIN_TOKEN)
4. Deploy to Vercel/Render/Railway
