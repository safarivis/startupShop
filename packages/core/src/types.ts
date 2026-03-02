export type StartupStage = 'idea' | 'mvp' | 'early-revenue' | 'growth' | 'mature';
export type PortfolioBucket = 'current' | 'future' | 'archived';
export type ListingVisibility = 'internal' | 'investor';

export interface StartupListing {
  startup_id: string;
  bucket: PortfolioBucket;
  visibility: ListingVisibility;
  identity: {
    name: string;
    category: string;
    summary: string;
    website: string;
  };
  status: {
    stage: StartupStage;
    listed: boolean;
  };
  traction: {
    mrr_usd: number;
    users: number;
    growth_mom_percent: number;
  };
  mvp: {
    live: boolean;
    notes: string;
  };
  tech: {
    stack: string[];
    risk_level: 'low' | 'medium' | 'high';
  };
  ops: {
    automation_level: 'manual' | 'semi-automated' | 'automated';
    owner_handoff_ready: boolean;
  };
  deal: {
    ask_usd: number;
    terms: string;
  };
  risks: string[];
  metadata: {
    created_at: string;
    updated_at: string;
  };
  metrics_url?: string;
}

export interface ListingIndexEntry {
  startup_id: string;
  path: string;
}

export interface ListingValidationResult {
  startup_id: string;
  path: string;
  valid: boolean;
  errors: string[];
}

export interface ListingsLoadResult {
  listings: StartupListing[];
  validations: ListingValidationResult[];
}
