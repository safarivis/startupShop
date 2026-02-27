import type { StartupListing, StartupStage } from './types';

export interface StartupScoreBreakdown {
  stage_score: number;
  traction_score: number;
  ops_readiness_score: number;
  tech_risk_score: number;
  unit_economics_score: number;
  total_score: number;
}

export interface ScoredStartup {
  listing: StartupListing;
  score: StartupScoreBreakdown;
}

const STAGE_BASELINE: Record<StartupStage, number> = {
  idea: 20,
  mvp: 40,
  'early-revenue': 60,
  growth: 80,
  mature: 95
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function scoreStage(listing: StartupListing): number {
  return STAGE_BASELINE[listing.status.stage];
}

function scoreTraction(listing: StartupListing): number {
  const mrrScore = clamp((listing.traction.mrr_usd / 20000) * 60);
  const userScore = clamp((listing.traction.users / 1000) * 20);
  const growthScore = clamp(((listing.traction.growth_mom_percent + 10) / 40) * 20);
  return clamp(mrrScore + userScore + growthScore);
}

function scoreOpsReadiness(listing: StartupListing): number {
  const automationMap: Record<StartupListing['ops']['automation_level'], number> = {
    manual: 35,
    'semi-automated': 65,
    automated: 90
  };
  const automationScore = automationMap[listing.ops.automation_level];
  const handoffBonus = listing.ops.owner_handoff_ready ? 10 : 0;
  return clamp(automationScore + handoffBonus);
}

function scoreTechRisk(listing: StartupListing): number {
  const map: Record<StartupListing['tech']['risk_level'], number> = {
    low: 90,
    medium: 65,
    high: 35
  };
  return map[listing.tech.risk_level];
}

function scoreUnitEconomics(listing: StartupListing): number {
  if (listing.traction.mrr_usd <= 0) {
    return 0;
  }

  const askMultiple = listing.deal.ask_usd / (listing.traction.mrr_usd * 12);

  if (askMultiple <= 2) return 90;
  if (askMultiple <= 4) return 75;
  if (askMultiple <= 6) return 60;
  if (askMultiple <= 8) return 45;
  return 30;
}

export function computeStartupScore(listing: StartupListing): StartupScoreBreakdown {
  const stage_score = scoreStage(listing);
  const traction_score = scoreTraction(listing);
  const ops_readiness_score = scoreOpsReadiness(listing);
  const tech_risk_score = scoreTechRisk(listing);
  const unit_economics_score = scoreUnitEconomics(listing);

  const total_score = clamp(
    stage_score * 0.2 +
      traction_score * 0.3 +
      ops_readiness_score * 0.15 +
      tech_risk_score * 0.15 +
      unit_economics_score * 0.2
  );

  return {
    stage_score,
    traction_score,
    ops_readiness_score,
    tech_risk_score,
    unit_economics_score,
    total_score: Number(total_score.toFixed(2))
  };
}

export function scoreStartups(listings: StartupListing[]): ScoredStartup[] {
  return listings.map((listing) => ({
    listing,
    score: computeStartupScore(listing)
  }));
}
