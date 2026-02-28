import { beforeEach, describe, expect, it, vi } from 'vitest';

const queryRawMock = vi.fn();
const executeRawMock = vi.fn();

vi.mock('@/src/lib/prisma', () => ({
  prisma: {
    $queryRaw: queryRawMock,
    $executeRaw: executeRawMock
  }
}));

describe('GET /api/startups/[id]/metrics', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns latest snapshot when available', async () => {
    queryRawMock.mockResolvedValue([
      {
        startup_id: 'pixelpilot-ai',
        fetched_at: new Date('2026-03-01T10:00:00.000Z'),
        payload: JSON.stringify({ revenue: 7200 }),
        source_status: 200,
        success: 1
      }
    ]);

    const { GET } = await import('@/app/api/startups/[id]/metrics/route');
    const response = await GET(new Request('http://localhost:3000/api/startups/pixelpilot-ai/metrics'), {
      params: Promise.resolve({ id: 'pixelpilot-ai' })
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.source).toBe('snapshot');
    expect(body.data.payload.revenue).toBe(7200);
    expect(executeRawMock).not.toHaveBeenCalled();
  });

  it('refresh=true fetches live metrics and stores snapshot', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ revenue: 7400, growth_mom_percent: 16 })
      }) as unknown as typeof fetch
    );

    executeRawMock.mockResolvedValue(1);

    const { GET } = await import('@/app/api/startups/[id]/metrics/route');
    const response = await GET(new Request('http://localhost:3000/api/startups/pixelpilot-ai/metrics?refresh=true'), {
      params: Promise.resolve({ id: 'pixelpilot-ai' })
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.source).toBe('live');
    expect(body.data.payload.revenue).toBe(7400);
    expect(executeRawMock).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  it('returns 404 when startup has no metrics_url', async () => {
    const { GET } = await import('@/app/api/startups/[id]/metrics/route');
    const response = await GET(new Request('http://localhost:3000/api/startups/shelfsense/metrics'), {
      params: Promise.resolve({ id: 'shelfsense' })
    });

    expect(response.status).toBe(404);
  });

  it('returns 502 when live fetch fails and no snapshot exists', async () => {
    queryRawMock.mockResolvedValue([]);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'upstream failed' })
      }) as unknown as typeof fetch
    );

    executeRawMock.mockResolvedValue(1);

    const { GET } = await import('@/app/api/startups/[id]/metrics/route');
    const response = await GET(new Request('http://localhost:3000/api/startups/legalleaf/metrics?refresh=true'), {
      params: Promise.resolve({ id: 'legalleaf' })
    });

    expect(response.status).toBe(502);
    vi.unstubAllGlobals();
  });
});
