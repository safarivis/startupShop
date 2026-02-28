import { NextResponse } from 'next/server';

import { getStartupById, validateOfferPayload } from '@startupshop/core';

import { prisma } from '@/src/lib/prisma';

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = validateOfferPayload(payload);
  if (!validation.valid) {
    return NextResponse.json(
      {
        error: 'Offer payload validation failed',
        details: validation.errors
      },
      { status: 400 }
    );
  }

  const startup = getStartupById(validation.data.startup_id);
  if (!startup) {
    return NextResponse.json({ error: 'Unknown startup_id' }, { status: 400 });
  }

  const offer = await prisma.offer.create({
    data: {
      startup_id: validation.data.startup_id,
      buyer_name: validation.data.buyer_name,
      buyer_email: validation.data.buyer_email,
      offer_amount_usd: validation.data.offer_amount_usd,
      message: validation.data.message
    }
  });

  return NextResponse.json(
    {
      data: {
        id: offer.id,
        created_at: offer.created_at,
        startup_id: offer.startup_id
      }
    },
    { status: 201 }
  );
}
