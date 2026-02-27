import { loadAndValidateListings } from './registry.js';
import { scoreStartups, type ScoredStartup } from './scoring.js';
import type { ListingValidationResult, StartupListing } from './types.js';

export type StartupsSort = 'score' | 'mrr';

export interface StartupsQuery {
  category?: string;
  stage?: StartupListing['status']['stage'];
  sort?: StartupsSort;
}

export interface StartupWithScore extends StartupListing {
  score: ScoredStartup['score'];
}

function mergeListingWithScore(scored: ScoredStartup): StartupWithScore {
  return {
    ...scored.listing,
    score: scored.score
  };
}

export function getStartups(query: StartupsQuery = {}): StartupWithScore[] {
  const { listings } = loadAndValidateListings();

  let result = scoreStartups(listings).map(mergeListingWithScore);

  if (query.category) {
    const categoryFilter = query.category.toLowerCase();
    result = result.filter((entry) => entry.identity.category.toLowerCase() === categoryFilter);
  }

  if (query.stage) {
    result = result.filter((entry) => entry.status.stage === query.stage);
  }

  const sortBy = query.sort ?? 'score';
  if (sortBy === 'mrr') {
    result.sort((a, b) => b.traction.mrr_usd - a.traction.mrr_usd);
  } else {
    result.sort((a, b) => b.score.total_score - a.score.total_score);
  }

  return result;
}

export function getStartupById(startupId: string): StartupWithScore | null {
  const all = getStartups();
  return all.find((entry) => entry.startup_id === startupId) ?? null;
}

export function getStartupValidationById(startupId: string): ListingValidationResult | null {
  const { validations } = loadAndValidateListings();
  return validations.find((entry) => entry.startup_id === startupId) ?? null;
}
