import { NextResponse } from 'next/server';

import { getStartups } from '@startupshop/core';

const STAGES = new Set(['idea', 'mvp', 'early-revenue', 'growth', 'mature']);
const SORTS = new Set(['score', 'mrr']);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category') ?? undefined;
  const stageParam = searchParams.get('stage') ?? undefined;
  const sortParam = searchParams.get('sort') ?? undefined;

  if (stageParam && !STAGES.has(stageParam)) {
    return NextResponse.json({ error: 'Invalid stage filter' }, { status: 400 });
  }

  if (sortParam && !SORTS.has(sortParam)) {
    return NextResponse.json({ error: 'Invalid sort value' }, { status: 400 });
  }

  const startups = getStartups({
    category,
    stage: stageParam as 'idea' | 'mvp' | 'early-revenue' | 'growth' | 'mature' | undefined,
    sort: sortParam as 'score' | 'mrr' | undefined
  });

  return NextResponse.json({ data: startups });
}
