# GitHub Tracking Setup

Run this once authenticated with `gh auth login`:

```bash
./scripts/setup-github-tracking.sh
```

This creates:

- Milestones: M0, M1, M2, M3, M4
- Issues:
  - M0 scaffold and validation
  - M1 API and scoring
  - M2 UI
  - M3 offers persistence
  - M4 metrics proxy + verified badge

## PR Policy

- One PR per logical chunk (1-3 issues max).
- Every PR must include `Fixes #X`.
- Every PR updates `PLAN.md` and `STATUS.md`.
