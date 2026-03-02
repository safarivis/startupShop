# StartupShop Metrics

## Core KPIs

| KPI | Current | Target | Cadence | Owner |
|-----|---------|--------|---------|-------|
| DNS readiness | Global resolution stable | Maintain stability | Weekly | Louis |
| SSL readiness | Valid cert active | Auto-renew success | Weekly | Louis |
| App accessibility | Domain HTTPS live | Maintain 200/healthy | Daily | Louis |
| Canonical routing | `www -> apex` active | Maintain | Weekly | Louis |
| Incident count | No active incident | Downward/zero trend | Weekly | Louis |

## Notes

- Primary URL: `https://startupshop.online`
- Health check URL: `https://startupshop.online/api/health`
- Deployment and ops runbook: `docs/runbook.md`
