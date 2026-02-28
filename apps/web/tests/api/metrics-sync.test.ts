import { describe, expect, it, vi } from 'vitest';

const syncMock = vi.fn();

vi.mock('@/src/lib/metrics', async () => {
  const actual = await vi.importActual<typeof import('@/src/lib/metrics')>('@/src/lib/metrics');
  return {
    ...actual,
    syncAllStartupMetrics: syncMock
  };
});

describe('POST /api/internal/metrics/sync', () => {
  it('returns 401 when sync token is missing/invalid', async () => {
    process.env.METRICS_SYNC_TOKEN = 'sync-secret';
    const { POST } = await import('@/app/api/internal/metrics/sync/route');

    const response = await POST(new Request('http://localhost:3000/api/internal/metrics/sync', { method: 'POST' }));
    expect(response.status).toBe(401);
  });

  it('returns summary on authorized request', async () => {
    process.env.METRICS_SYNC_TOKEN = 'sync-secret';
    syncMock.mockResolvedValue({
      total: 2,
      successful: 2,
      failed: 0,
      details: [
        { startup_id: 'pixelpilot-ai', success: true, source_status: 200 },
        { startup_id: 'legalleaf', success: true, source_status: 200 }
      ]
    });

    const { POST } = await import('@/app/api/internal/metrics/sync/route');
    const response = await POST(
      new Request('http://localhost:3000/api/internal/metrics/sync', {
        method: 'POST',
        headers: { 'x-sync-token': 'sync-secret' }
      })
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.total).toBe(2);
  });
});
