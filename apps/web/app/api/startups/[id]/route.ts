import { NextResponse } from 'next/server';

import { getStartupById } from '@startupshop/core';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;
  const startup = getStartupById(params.id);

  if (!startup) {
    return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
  }

  return NextResponse.json({ data: startup });
}
