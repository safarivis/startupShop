import { describe, expect, it, vi } from 'vitest';

describe('GET /api/startups/[id]/metrics', () => {
  it('returns 200 when upstream metrics are valid JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ revenue: 7400, growth_mom_percent: 16 })
      }) as unknown as typeof fetch
    );

    const { GET } = await import('@/app/api/startups/[id]/metrics/route');
    const response = await GET(new Request('http://localhost:3000/api/startups/pixelpilot-ai/metrics'), {
      params: Promise.resolve({ id: 'pixelpilot-ai' })
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.startup_id).toBe('pixelpilot-ai');
    expect(body.data.payload.revenue).toBe(7400);

    vi.unstubAllGlobals();
  });

  it('returns 404 when startup has no metrics_url', async () => {
    const { GET } = await import('@/app/api/startups/[id]/metrics/route');
    const response = await GET(new Request('http://localhost:3000/api/startups/shelfsense/metrics'), {
      params: Promise.resolve({ id: 'shelfsense' })
    });

    expect(response.status).toBe(404);
  });

  it('returns 502 on upstream failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'upstream failed' })
      }) as unknown as typeof fetch
    );

    const { GET } = await import('@/app/api/startups/[id]/metrics/route');
    const response = await GET(new Request('http://localhost:3000/api/startups/legalleaf/metrics'), {
      params: Promise.resolve({ id: 'legalleaf' })
    });

    expect(response.status).toBe(502);
    vi.unstubAllGlobals();
  });
});
