import { NextResponse } from 'next/server';

import { logApiEvent } from '@/src/lib/logging';

export async function GET() {
  const startedAt = Date.now();
  const data = {
    status: 'ok',
    timestamp: new Date().toISOString()
  };

  logApiEvent({
    endpoint: '/api/health',
    method: 'GET',
    status: 200,
    latency_ms: Date.now() - startedAt
  });

  return NextResponse.json({ data }, { status: 200 });
}
