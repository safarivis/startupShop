import { loadAndValidateListings } from './registry';
import { scoreStartups, type ScoredStartup } from './scoring';
import type { ListingValidationResult, ListingVisibility, PortfolioBucket, StartupListing } from './types';

export type StartupsSort = 'score' | 'mrr';

export interface StartupsQuery {
  category?: string;
  stage?: StartupListing['status']['stage'];
  bucket?: PortfolioBucket;
  visibility?: ListingVisibility;
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

  if (query.bucket) {
    result = result.filter((entry) => entry.bucket === query.bucket);
  }

  if (query.visibility) {
    result = result.filter((entry) => entry.visibility === query.visibility);
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
