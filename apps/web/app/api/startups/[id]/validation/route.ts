import { NextResponse } from 'next/server';

import { getStartupValidationById } from '@startupshop/core';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;
  const validation = getStartupValidationById(params.id);

  if (!validation) {
    return NextResponse.json({ error: 'Startup not found in index' }, { status: 404 });
  }

  return NextResponse.json({ data: validation });
}
