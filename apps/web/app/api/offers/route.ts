import { NextResponse } from 'next/server';

import { getStartupById, validateOfferPayload } from '@startupshop/core';

import { logApiEvent } from '@/src/lib/logging';
import { prisma } from '@/src/lib/prisma';

const OFFER_BODY_LIMIT_BYTES = 16 * 1024;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

interface RateEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateEntry>();

function resolveClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function enforceRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(clientIp);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(clientIp, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  rateLimitStore.set(clientIp, entry);
  return true;
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const clientIp = resolveClientIp(request);

  if (!enforceRateLimit(clientIp)) {
    const latency = Date.now() - startedAt;
    logApiEvent({
      endpoint: '/api/offers',
      method: 'POST',
      status: 429,
      latency_ms: latency,
      error_code: 'rate_limit_exceeded'
    });
    return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
  }

  let payload: unknown;
  let startupId: string | undefined;

  try {
    const bodyText = await request.text();
    const bodyBytes = Buffer.byteLength(bodyText, 'utf8');
    if (bodyBytes > OFFER_BODY_LIMIT_BYTES) {
      const latency = Date.now() - startedAt;
      logApiEvent({
        endpoint: '/api/offers',
        method: 'POST',
        status: 413,
        latency_ms: latency,
        error_code: 'payload_too_large'
      });
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    payload = JSON.parse(bodyText) as unknown;
  } catch {
    const latency = Date.now() - startedAt;
    logApiEvent({
      endpoint: '/api/offers',
      method: 'POST',
      status: 400,
      latency_ms: latency,
      error_code: 'invalid_json'
    });
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = validateOfferPayload(payload);
  if (!validation.valid) {
    const latency = Date.now() - startedAt;
    logApiEvent({
      endpoint: '/api/offers',
      method: 'POST',
      status: 400,
      latency_ms: latency,
      error_code: 'schema_validation_failed'
    });
    return NextResponse.json(
      {
        error: 'Offer payload validation failed',
        details: validation.errors
      },
      { status: 400 }
    );
  }

  startupId = validation.data.startup_id;
  const startup = getStartupById(validation.data.startup_id);
  if (!startup) {
    const latency = Date.now() - startedAt;
    logApiEvent({
      endpoint: '/api/offers',
      method: 'POST',
      status: 400,
      latency_ms: latency,
      startup_id: startupId,
      error_code: 'unknown_startup'
    });
    return NextResponse.json({ error: 'Unknown startup_id' }, { status: 400 });
  }

  try {
    const offer = await prisma.offer.create({
      data: {
        startup_id: validation.data.startup_id,
        buyer_name: validation.data.buyer_name,
        buyer_email: validation.data.buyer_email,
        offer_amount_usd: validation.data.offer_amount_usd,
        message: validation.data.message
      }
    });

    const latency = Date.now() - startedAt;
    logApiEvent({
      endpoint: '/api/offers',
      method: 'POST',
      status: 201,
      latency_ms: latency,
      startup_id: startupId
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
  } catch {
    const latency = Date.now() - startedAt;
    logApiEvent({
      endpoint: '/api/offers',
      method: 'POST',
      status: 500,
      latency_ms: latency,
      startup_id: startupId,
      error_code: 'db_write_failed'
    });
    return NextResponse.json({ error: 'Failed to persist offer' }, { status: 500 });
  }
}
