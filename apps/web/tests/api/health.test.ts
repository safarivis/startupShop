import { describe, expect, it } from 'vitest';

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.status).toBe('ok');
    expect(typeof body.data.timestamp).toBe('string');
  });
});
