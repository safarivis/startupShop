import { NextResponse } from 'next/server';

import { logApiEvent } from '@/src/lib/logging';
import { fetchStartupMetrics, MetricsFetchError } from '@/src/lib/metrics';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;
  const startedAt = Date.now();

  try {
    const data = await fetchStartupMetrics(params.id);
    logApiEvent({
      endpoint: '/api/startups/[id]/metrics',
      method: 'GET',
      status: 200,
      latency_ms: Date.now() - startedAt,
      startup_id: params.id,
      cache: data.cached ? 'hit' : 'miss'
    });
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch metrics';
    const isNotFound =
      message.includes('not configured') || message.includes('Startup not found') || message.includes('404');
    const status = isNotFound ? 404 : 502;
    const upstreamStatus = error instanceof MetricsFetchError ? error.upstreamStatus : undefined;
    logApiEvent({
      endpoint: '/api/startups/[id]/metrics',
      method: 'GET',
      status,
      latency_ms: Date.now() - startedAt,
      startup_id: params.id,
      error_code: isNotFound ? 'metrics_not_found' : 'upstream_metrics_failed',
      upstream_status: upstreamStatus
    });

    return NextResponse.json({ error: message }, { status });
  }
}
