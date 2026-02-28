import { NextResponse } from 'next/server';

import { logApiEvent } from '@/src/lib/logging';
import { getReadinessStatus } from '@/src/lib/readiness';

export async function GET() {
  const startedAt = Date.now();
  const data = await getReadinessStatus();
  const status = data.ready ? 200 : 503;

  logApiEvent({
    endpoint: '/api/ready',
    method: 'GET',
    status,
    latency_ms: Date.now() - startedAt,
    error_code: data.ready ? undefined : 'service_not_ready'
  });

  return NextResponse.json({ data }, { status });
}
