import { NextResponse } from 'next/server';

import { logApiEvent } from '@/src/lib/logging';
import { syncAllStartupMetrics } from '@/src/lib/metrics';

function isAuthorized(request: Request): boolean {
  const expected = process.env.METRICS_SYNC_TOKEN;
  if (!expected) {
    return false;
  }

  const incoming = request.headers.get('x-sync-token');
  return incoming === expected;
}

export async function POST(request: Request) {
  const startedAt = Date.now();

  if (!isAuthorized(request)) {
    logApiEvent({
      endpoint: '/api/internal/metrics/sync',
      method: 'POST',
      status: 401,
      latency_ms: Date.now() - startedAt,
      error_code: 'sync_unauthorized'
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await syncAllStartupMetrics();
  logApiEvent({
    endpoint: '/api/internal/metrics/sync',
    method: 'POST',
    status: 200,
    latency_ms: Date.now() - startedAt
  });

  return NextResponse.json({ data: summary }, { status: 200 });
}
