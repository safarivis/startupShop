#!/usr/bin/env bash
set -euo pipefail

REPO="safarivis/startupShop"

for M in M0 M1 M2 M3 M4; do
  gh api --method POST "repos/$REPO/milestones" -f title="$M" -f state="open" >/dev/null || true
done

M0_NUM=$(gh api "repos/$REPO/milestones" --jq '.[] | select(.title=="M0") | .number')
M1_NUM=$(gh api "repos/$REPO/milestones" --jq '.[] | select(.title=="M1") | .number')
M2_NUM=$(gh api "repos/$REPO/milestones" --jq '.[] | select(.title=="M2") | .number')
M3_NUM=$(gh api "repos/$REPO/milestones" --jq '.[] | select(.title=="M3") | .number')
M4_NUM=$(gh api "repos/$REPO/milestones" --jq '.[] | select(.title=="M4") | .number')

make_issue() {
  local title="$1"
  local body="$2"
  local milestone="$3"
  gh issue create --repo "$REPO" --title "$title" --body "$body" --milestone "$milestone" >/dev/null
}

make_issue "M0: Scaffold monorepo + registry + schemas + validation + CI" "Implement M0 bootstrap per PLAN.md." "$M0_NUM"
make_issue "M1: API routes + scoring" "Implement scoring and startup read APIs per PLAN.md." "$M1_NUM"
make_issue "M2: Catalog + detail + offer UI" "Implement UI pages for browsing startups and submitting offers." "$M2_NUM"
make_issue "M3: Offers persistence with Prisma + SQLite + admin page" "Implement POST /api/offers and admin offers view guarded by ADMIN_TOKEN." "$M3_NUM"
make_issue "M4: Metrics proxy + Verified badge" "Implement metrics proxy endpoint with caching and verified badge in UI." "$M4_NUM"

echo "Milestones and issues created for $REPO"
