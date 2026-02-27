#!/usr/bin/env bash
set -euo pipefail

REPO="safarivis/startupShop"

ensure_milestone() {
  local title="$1"
  local found
  found="$(gh api "repos/$REPO/milestones?state=all&per_page=100" --jq ".[] | select(.title==\"$title\") | .title" | head -n1 || true)"

  if [[ -z "$found" ]]; then
    gh api --method POST "repos/$REPO/milestones" -f title="$title" -f state="open" >/dev/null
  fi

  echo "$title"
}

make_issue() {
  local title="$1"
  local body="$2"
  local milestone_title="$3"
  local existing
  existing="$(gh issue list --repo "$REPO" --state all --search "in:title \"$title\"" --json title --jq ".[0].title" || true)"
  if [[ "$existing" == "$title" ]]; then
    echo "Issue already exists: $title"
    return 0
  fi
  gh issue create --repo "$REPO" --title "$title" --body "$body" --milestone "$milestone_title" >/dev/null
  echo "Created issue: $title"
}

M0_TITLE="$(ensure_milestone "M0")"
M1_TITLE="$(ensure_milestone "M1")"
M2_TITLE="$(ensure_milestone "M2")"
M3_TITLE="$(ensure_milestone "M3")"
M4_TITLE="$(ensure_milestone "M4")"

make_issue "M0: Scaffold monorepo + registry + schemas + validation + CI" "Implement M0 bootstrap per PLAN.md." "$M0_TITLE"
make_issue "M1: API routes + scoring" "Implement scoring and startup read APIs per PLAN.md." "$M1_TITLE"
make_issue "M2: Catalog + detail + offer UI" "Implement UI pages for browsing startups and submitting offers." "$M2_TITLE"
make_issue "M3: Offers persistence with Prisma + SQLite + admin page" "Implement POST /api/offers and admin offers view guarded by ADMIN_TOKEN." "$M3_TITLE"
make_issue "M4: Metrics proxy + Verified badge" "Implement metrics proxy endpoint with caching and verified badge in UI." "$M4_TITLE"

echo "Milestones and issues created for $REPO"
