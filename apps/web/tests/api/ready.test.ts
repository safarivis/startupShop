import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const queryRawMock = vi.fn();
const connectMock = vi.fn();
const pingMock = vi.fn();
const disconnectMock = vi.fn();

vi.mock('@/src/lib/prisma', () => ({
  prisma: {
    $queryRaw: queryRawMock
  }
}));

vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    connect: connectMock,
    ping: pingMock,
    disconnect: disconnectMock
  }))
}));

describe('GET /api/ready', () => {
  const previousEnv = { ...process.env };

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...previousEnv };
    queryRawMock.mockResolvedValue([{ '?column?': 1 }]);
  });

  afterEach(() => {
    process.env = { ...previousEnv };
  });

  it('returns 503 when readiness dependencies are missing', async () => {
    delete process.env.REDIS_URL;
    delete process.env.METRICS_SYNC_TOKEN;

    const { GET } = await import('@/app/api/ready/route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.data.ready).toBe(false);
    expect(body.data.checks.redis.ok).toBe(false);
    expect(body.data.checks.metrics_sync.ok).toBe(false);
  });

  it('returns 200 when db, redis, and sync config are healthy', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.METRICS_SYNC_TOKEN = 'sync-secret';

    connectMock.mockResolvedValue(undefined);
    pingMock.mockResolvedValue('PONG');
    disconnectMock.mockResolvedValue(undefined);

    const { GET } = await import('@/app/api/ready/route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.ready).toBe(true);
    expect(body.data.checks.db.ok).toBe(true);
    expect(body.data.checks.redis.ok).toBe(true);
    expect(body.data.checks.metrics_sync.ok).toBe(true);
  });
});
