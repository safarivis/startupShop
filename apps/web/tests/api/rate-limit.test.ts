import { afterEach, describe, expect, it, vi } from 'vitest';

const connectMock = vi.fn();
const incrMock = vi.fn();
const pExpireMock = vi.fn();

vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    connect: connectMock,
    incr: incrMock,
    pExpire: pExpireMock
  }))
}));

describe('checkOfferRateLimit', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  it('fails closed when redis is unavailable by default', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    delete process.env.RATE_LIMIT_REDIS_FAILURE_MODE;
    connectMock.mockRejectedValue(new Error('redis down'));

    const { checkOfferRateLimit } = await import('@/src/lib/rate-limit');
    const result = await checkOfferRateLimit('10.9.9.9');

    expect(result.allowed).toBe(false);
    expect(result.error_code).toBe('redis_unavailable');
    expect(result.degraded).toBe(true);
  });

  it('fails open when configured and redis is unavailable', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.RATE_LIMIT_REDIS_FAILURE_MODE = 'fail_open';
    connectMock.mockRejectedValue(new Error('redis down'));

    const { checkOfferRateLimit } = await import('@/src/lib/rate-limit');
    const result = await checkOfferRateLimit('10.9.9.10');

    expect(result.allowed).toBe(true);
    expect(result.error_code).toBe('redis_unavailable');
    expect(result.degraded).toBe(true);
  });

  it('enforces redis limit with increment checks', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.OFFER_RATE_LIMIT_MAX_REQUESTS = '2';
    connectMock.mockResolvedValue(undefined);
    incrMock.mockResolvedValueOnce(1).mockResolvedValueOnce(2).mockResolvedValueOnce(3);
    pExpireMock.mockResolvedValue(undefined);

    const { checkOfferRateLimit } = await import('@/src/lib/rate-limit');

    const first = await checkOfferRateLimit('10.9.9.11');
    const second = await checkOfferRateLimit('10.9.9.11');
    const third = await checkOfferRateLimit('10.9.9.11');

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
    expect(first.source).toBe('redis');
  });
});
