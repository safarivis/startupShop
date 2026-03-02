# StartupShop Decisions

## Decision Log

Use this note to track high-impact decisions for StartupShop using one schema.

## Schema (mandatory)

- Decision ID: `DEC-SS-###`
- Date (YYYY-MM-DD):
- Owner:
- Decision:
- Context:
- Options considered:
- Chosen option:
- Evidence (links/notes/data):
- Expected impact:
- KPI(s):
- Revisit date:
- Status: `Proposed` | `Active` | `Reversed` | `Superseded`
- Supersedes (optional):

## Entries

### DEC-SS-001
- Date (YYYY-MM-DD): 2026-02-28
- Owner: Louis
- Decision: Deploy StartupShop on app port `3007` and validate via direct IP while `startupshop.online` DNS propagates.
- Context: Avoid blocking QA and launch checks on external DNS propagation timing.
- Options considered: Wait for global DNS propagation before validation.
- Chosen option: Validate on direct IP first, then finalize domain/SSL.
- Evidence (links/notes/data): `status-notes.md`
- Expected impact: Faster readiness validation with lower schedule risk.
- KPI(s): Reachability, SSL issuance success, first successful user flow.
- Revisit date: 2026-03-01
- Status: Active
- Supersedes (optional): None

### DEC-SS-002
- Date (YYYY-MM-DD): 2026-03-02
- Owner: Louis
- Decision: Move StartupShop to domain-first operations with TLS and canonical routing.
- Context: DNS propagation completed and HTTPS could be enabled.
- Options considered: Keep direct-IP access as primary path.
- Chosen option: Serve primary traffic via `https://startupshop.online` and redirect `www` to apex.
- Evidence (links/notes/data): Nginx + Certbot deployment logs, `status-notes.md`.
- Expected impact: Better trust, SEO consistency, cleaner public routing.
- KPI(s): HTTPS uptime, successful health checks, redirect correctness.
- Revisit date: 2026-03-16
- Status: Active
- Supersedes (optional): DEC-SS-001 (operationally)
