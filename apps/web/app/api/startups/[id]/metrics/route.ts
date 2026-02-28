import { NextResponse } from 'next/server';

import { fetchStartupMetrics } from '@/src/lib/metrics';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;

  try {
    const data = await fetchStartupMetrics(params.id);
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch metrics';
    const isNotFound =
      message.includes('not configured') || message.includes('Startup not found') || message.includes('404');

    return NextResponse.json({ error: message }, { status: isNotFound ? 404 : 502 });
  }
}
