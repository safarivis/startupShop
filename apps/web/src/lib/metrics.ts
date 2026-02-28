import { getStartupById } from '@startupshop/core';

const CACHE_TTL_MS = 5 * 60 * 1000;

export interface StartupMetricsSuccess {
  startup_id: string;
  fetched_at: string;
  payload: unknown;
  cached: boolean;
}

export class MetricsFetchError extends Error {
  upstreamStatus?: number;

  constructor(message: string, upstreamStatus?: number) {
    super(message);
    this.name = 'MetricsFetchError';
    this.upstreamStatus = upstreamStatus;
  }
}

interface CacheEntry {
  value: StartupMetricsSuccess;
  expiresAt: number;
}

const metricsCache = new Map<string, CacheEntry>();

function readCache(startupId: string): StartupMetricsSuccess | null {
  const entry = metricsCache.get(startupId);
  if (!entry) {
    return null;
  }

  if (Date.now() >= entry.expiresAt) {
    metricsCache.delete(startupId);
    return null;
  }

  return {
    ...entry.value,
    cached: true
  };
}

function writeCache(startupId: string, value: StartupMetricsSuccess): StartupMetricsSuccess {
  const normalized = {
    ...value,
    cached: false
  };

  metricsCache.set(startupId, {
    value: normalized,
    expiresAt: Date.now() + CACHE_TTL_MS
  });

  return normalized;
}

export async function fetchStartupMetrics(startupId: string): Promise<StartupMetricsSuccess> {
  const startup = getStartupById(startupId);
  if (!startup) {
    throw new MetricsFetchError('Startup not found');
  }

  if (!startup.metrics_url) {
    throw new MetricsFetchError('metrics_url not configured for startup');
  }

  const cached = readCache(startupId);
  if (cached) {
    return cached;
  }

  const response = await fetch(startup.metrics_url, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new MetricsFetchError(`Metrics fetch failed (${response.status})`, response.status);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new MetricsFetchError('Metrics response was not valid JSON', response.status);
  }
  return writeCache(startupId, {
    startup_id: startupId,
    fetched_at: new Date().toISOString(),
    payload,
    cached: false
  });
}
