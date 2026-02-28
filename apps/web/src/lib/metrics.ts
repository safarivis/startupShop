import { getStartupById, getStartups } from '@startupshop/core';

import { prisma } from '@/src/lib/prisma';

const CACHE_TTL_MS = 5 * 60 * 1000;
const STALE_AFTER_MS = Number(process.env.METRICS_STALE_AFTER_MS ?? 30 * 60 * 1000);

export interface StartupMetricsResult {
  startup_id: string;
  fetched_at: string;
  payload: unknown;
  source: 'snapshot' | 'live';
  stale: boolean;
  cached: boolean;
  source_status: number;
}

export interface MetricsSyncSummary {
  total: number;
  successful: number;
  failed: number;
  details: Array<{
    startup_id: string;
    success: boolean;
    source_status: number;
    error?: string;
  }>;
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
  value: StartupMetricsResult;
  expiresAt: number;
}

interface SnapshotRow {
  startup_id: string;
  fetched_at: string | Date;
  payload: string | null;
  source_status: number;
  success: number | boolean;
}

const metricsCache = new Map<string, CacheEntry>();

function isStale(fetchedAt: Date): boolean {
  return Date.now() - fetchedAt.getTime() > STALE_AFTER_MS;
}

function readCache(startupId: string): StartupMetricsResult | null {
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

function writeCache(startupId: string, value: StartupMetricsResult): StartupMetricsResult {
  const normalized: StartupMetricsResult = {
    ...value,
    cached: false
  };

  metricsCache.set(startupId, {
    value: normalized,
    expiresAt: Date.now() + CACHE_TTL_MS
  });

  return normalized;
}

async function latestSuccessfulSnapshot(startupId: string) {
  const rows = await prisma.$queryRaw<SnapshotRow[]>`
    SELECT startup_id, fetched_at, payload, source_status, success
    FROM MetricsSnapshot
    WHERE startup_id = ${startupId} AND success = 1
    ORDER BY fetched_at DESC
    LIMIT 1
  `;
  return rows[0] ?? null;
}

function snapshotToResult(
  startupId: string,
  fetchedAt: Date,
  payload: string | null,
  sourceStatus: number,
  fromCache: boolean
): StartupMetricsResult {
  let parsedPayload: unknown = null;
  if (payload) {
    try {
      parsedPayload = JSON.parse(payload) as unknown;
    } catch {
      parsedPayload = null;
    }
  }

  return {
    startup_id: startupId,
    fetched_at: fetchedAt.toISOString(),
    payload: parsedPayload,
    source: 'snapshot',
    stale: isStale(fetchedAt),
    cached: fromCache,
    source_status: sourceStatus
  };
}

async function fetchAndPersistLiveMetrics(
  startupId: string,
  fetchedVia: 'api' | 'sync_job',
  useCache: boolean
): Promise<StartupMetricsResult> {
  const startup = getStartupById(startupId);
  if (!startup) {
    throw new MetricsFetchError('Startup not found');
  }

  if (!startup.metrics_url) {
    throw new MetricsFetchError('metrics_url not configured for startup');
  }

  if (useCache) {
    const cached = readCache(startupId);
    if (cached) {
      return cached;
    }
  }

  const response = await fetch(startup.metrics_url, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    },
    cache: 'no-store'
  });

  let payload: unknown = null;
  let success = false;
  let errorMessage: string | null = null;

  if (response.ok) {
    try {
      payload = await response.json();
      success = true;
    } catch {
      errorMessage = 'Metrics response was not valid JSON';
    }
  } else {
    errorMessage = `Metrics fetch failed (${response.status})`;
  }

  const fetchedAt = new Date();
  await prisma.$executeRaw`
    INSERT INTO MetricsSnapshot
      (startup_id, fetched_at, payload, source_status, success, error_message, fetched_via)
    VALUES
      (${startupId}, ${fetchedAt}, ${success ? JSON.stringify(payload) : null}, ${response.status}, ${success ? 1 : 0}, ${errorMessage}, ${fetchedVia})
  `;

  if (!success) {
    throw new MetricsFetchError(errorMessage ?? 'Metrics fetch failed', response.status);
  }

  return writeCache(startupId, {
    startup_id: startupId,
    fetched_at: fetchedAt.toISOString(),
    payload,
    source: 'live',
    stale: false,
    cached: false,
    source_status: response.status
  });
}

interface MetricsOptions {
  refresh?: boolean;
  fetchedVia?: 'api' | 'sync_job';
}

export async function getStartupMetrics(startupId: string, options: MetricsOptions = {}): Promise<StartupMetricsResult> {
  const refresh = options.refresh ?? false;
  const fetchedVia = options.fetchedVia ?? 'api';
  const startup = getStartupById(startupId);

  if (!startup) {
    throw new MetricsFetchError('Startup not found');
  }

  if (!startup.metrics_url) {
    throw new MetricsFetchError('metrics_url not configured for startup');
  }

  if (!refresh) {
    const snapshot = await latestSuccessfulSnapshot(startupId);
    if (snapshot) {
      return snapshotToResult(startupId, new Date(snapshot.fetched_at), snapshot.payload, snapshot.source_status, false);
    }
  }

  try {
    return await fetchAndPersistLiveMetrics(startupId, fetchedVia, !refresh);
  } catch (error) {
    const snapshot = await latestSuccessfulSnapshot(startupId);
    if (snapshot) {
      return snapshotToResult(startupId, new Date(snapshot.fetched_at), snapshot.payload, snapshot.source_status, false);
    }

    throw error;
  }
}

export async function syncAllStartupMetrics(): Promise<MetricsSyncSummary> {
  const startups = getStartups().filter((entry) => Boolean(entry.metrics_url));
  const details: MetricsSyncSummary['details'] = [];

  for (const startup of startups) {
    try {
      const result = await fetchAndPersistLiveMetrics(startup.startup_id, 'sync_job', false);
      details.push({
        startup_id: startup.startup_id,
        success: true,
        source_status: result.source_status
      });
    } catch (error) {
      const status = error instanceof MetricsFetchError ? (error.upstreamStatus ?? 500) : 500;
      const message = error instanceof Error ? error.message : 'sync_failed';
      details.push({
        startup_id: startup.startup_id,
        success: false,
        source_status: status,
        error: message
      });
    }
  }

  return {
    total: details.length,
    successful: details.filter((entry) => entry.success).length,
    failed: details.filter((entry) => !entry.success).length,
    details
  };
}
