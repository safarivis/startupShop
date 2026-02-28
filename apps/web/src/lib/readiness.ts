import { prisma } from '@/src/lib/prisma';

export interface ReadyCheck {
  ok: boolean;
  detail: string;
}

export interface ReadyStatus {
  ready: boolean;
  checks: {
    db: ReadyCheck;
    redis: ReadyCheck;
    metrics_sync: ReadyCheck;
    admin_auth: ReadyCheck;
  };
  timestamp: string;
}

async function checkDb(): Promise<ReadyCheck> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, detail: 'db_ok' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'db_unreachable';
    return { ok: false, detail: message };
  }
}

async function checkRedis(): Promise<ReadyCheck> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return { ok: false, detail: 'REDIS_URL_missing' };
  }

  try {
    const moduleName = 'redis';
    const { createClient } = (await import(moduleName)) as {
      createClient: (options: { url: string }) => {
        connect(): Promise<void>;
        ping(): Promise<string>;
        disconnect(): Promise<void>;
      };
    };

    const client = createClient({ url: redisUrl });
    await client.connect();
    const pong = await client.ping();
    await client.disconnect();

    if (pong.toUpperCase() !== 'PONG') {
      return { ok: false, detail: 'redis_ping_invalid' };
    }

    return { ok: true, detail: 'redis_ok' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'redis_unreachable';
    return { ok: false, detail: message };
  }
}

function checkMetricsSyncConfig(): ReadyCheck {
  if (!process.env.METRICS_SYNC_TOKEN) {
    return { ok: false, detail: 'METRICS_SYNC_TOKEN_missing' };
  }

  return { ok: true, detail: 'metrics_sync_configured' };
}

function checkAdminAuthConfig(): ReadyCheck {
  if (!process.env.ADMIN_PASSWORD) {
    return { ok: false, detail: 'ADMIN_PASSWORD_missing' };
  }

  if (!process.env.ADMIN_SESSION_SECRET) {
    return { ok: false, detail: 'ADMIN_SESSION_SECRET_missing' };
  }

  return { ok: true, detail: 'admin_auth_configured' };
}

export async function getReadinessStatus(): Promise<ReadyStatus> {
  const [db, redis] = await Promise.all([checkDb(), checkRedis()]);
  const metrics_sync = checkMetricsSyncConfig();
  const admin_auth = checkAdminAuthConfig();

  const ready = db.ok && redis.ok && metrics_sync.ok && admin_auth.ok;

  return {
    ready,
    checks: {
      db,
      redis,
      metrics_sync,
      admin_auth
    },
    timestamp: new Date().toISOString()
  };
}
