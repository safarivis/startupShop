import { beforeEach, describe, expect, it, vi } from 'vitest';

const createMock = vi.fn();

vi.mock('@/src/lib/prisma', () => ({
  prisma: {
    offer: {
      create: createMock
    }
  }
}));

describe('POST /api/offers', () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it('returns 201 for valid payload', async () => {
    createMock.mockResolvedValue({
      id: 42,
      startup_id: 'pixelpilot-ai',
      created_at: new Date('2026-02-28T10:00:00.000Z')
    });

    const { POST } = await import('@/app/api/offers/route');
    const request = new Request('http://localhost:3000/api/offers', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.1.1.1' },
      body: JSON.stringify({
        startup_id: 'pixelpilot-ai',
        buyer_name: 'Jane Doe',
        buyer_email: 'jane@example.com',
        offer_amount_usd: 123000,
        message: 'Interested in a fast close if metrics hold.'
      })
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.id).toBe(42);
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it('returns 400 for schema-invalid payload', async () => {
    const { POST } = await import('@/app/api/offers/route');
    const request = new Request('http://localhost:3000/api/offers', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.2.2.2' },
      body: JSON.stringify({
        startup_id: 'pixelpilot-ai',
        buyer_name: 'A',
        buyer_email: 'bad-email',
        offer_amount_usd: -1,
        message: 'x'
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('returns 400 for unknown startup_id', async () => {
    const { POST } = await import('@/app/api/offers/route');
    const request = new Request('http://localhost:3000/api/offers', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.3.3.3' },
      body: JSON.stringify({
        startup_id: 'missing-startup',
        buyer_name: 'Jane Doe',
        buyer_email: 'jane@example.com',
        offer_amount_usd: 123000,
        message: 'This should fail because startup is unknown.'
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('returns 413 for oversized payload', async () => {
    const { POST } = await import('@/app/api/offers/route');
    const request = new Request('http://localhost:3000/api/offers', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.4.4.4' },
      body: JSON.stringify({
        startup_id: 'pixelpilot-ai',
        buyer_name: 'Jane Doe',
        buyer_email: 'jane@example.com',
        offer_amount_usd: 123000,
        message: 'x'.repeat(20000)
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(413);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('returns 429 when per-IP rate limit is exceeded', async () => {
    createMock.mockResolvedValue({
      id: 100,
      startup_id: 'pixelpilot-ai',
      created_at: new Date('2026-02-28T10:00:00.000Z')
    });

    const { POST } = await import('@/app/api/offers/route');
    let lastStatus = 0;

    for (let i = 0; i < 11; i += 1) {
      const response = await POST(
        new Request('http://localhost:3000/api/offers', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.5.5.5' },
          body: JSON.stringify({
            startup_id: 'pixelpilot-ai',
            buyer_name: 'Jane Doe',
            buyer_email: 'jane@example.com',
            offer_amount_usd: 123000,
            message: `Offer attempt ${i + 1}`
          })
        })
      );
      lastStatus = response.status;
    }

    expect(lastStatus).toBe(429);
  });
});
