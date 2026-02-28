interface MemoryRateEntry {
  count: number;
  windowStart: number;
}

const memoryStore = new Map<string, MemoryRateEntry>();

const WINDOW_MS = Number(process.env.OFFER_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000);
const MAX_REQUESTS = Number(process.env.OFFER_RATE_LIMIT_MAX_REQUESTS ?? 10);
const FAILURE_MODE = (process.env.RATE_LIMIT_REDIS_FAILURE_MODE ?? 'fail_closed').toLowerCase();

interface RedisClientLike {
  connect(): Promise<void>;
  incr(key: string): Promise<number>;
  pExpire(key: string, durationMs: number): Promise<unknown>;
}

let redisClientPromise: Promise<RedisClientLike> | undefined;

async function getRedisClient(): Promise<RedisClientLike> {
  if (!redisClientPromise) {
    const moduleName = 'redis';
    const { createClient } = (await import(moduleName)) as {
      createClient: (options: { url?: string }) => RedisClientLike;
    };
    const client = createClient({ url: process.env.REDIS_URL });
    redisClientPromise = client.connect().then(() => client);
  }
  return redisClientPromise;
}

function enforceMemoryLimit(clientIp: string): boolean {
  const now = Date.now();
  const entry = memoryStore.get(clientIp);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    memoryStore.set(clientIp, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  memoryStore.set(clientIp, entry);
  return true;
}

async function enforceRedisLimit(clientIp: string): Promise<boolean> {
  const client = await getRedisClient();
  const key = `rate_limit:offers:${clientIp}`;

  const current = await client.incr(key);
  if (current === 1) {
    await client.pExpire(key, WINDOW_MS);
  }

  return current <= MAX_REQUESTS;
}

export interface RateLimitResult {
  allowed: boolean;
  source: 'redis' | 'memory';
  degraded: boolean;
  error_code?: 'redis_unavailable';
}

export async function checkOfferRateLimit(clientIp: string): Promise<RateLimitResult> {
  if (!process.env.REDIS_URL) {
    return {
      allowed: enforceMemoryLimit(clientIp),
      source: 'memory',
      degraded: true
    };
  }

  try {
    return {
      allowed: await enforceRedisLimit(clientIp),
      source: 'redis',
      degraded: false
    };
  } catch {
    if (FAILURE_MODE === 'fail_open') {
      return {
        allowed: true,
        source: 'redis',
        degraded: true,
        error_code: 'redis_unavailable'
      };
    }

    return {
      allowed: false,
      source: 'redis',
      degraded: true,
      error_code: 'redis_unavailable'
    };
  }
}
