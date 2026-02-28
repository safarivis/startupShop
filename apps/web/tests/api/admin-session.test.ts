import { beforeEach, describe, expect, it } from 'vitest';

function getSetCookies(response: Response): string[] {
  const headersAny = response.headers as unknown as { getSetCookie?: () => string[] };
  if (typeof headersAny.getSetCookie === 'function') {
    return headersAny.getSetCookie();
  }

  const raw = response.headers.get('set-cookie');
  if (!raw) return [];
  return raw.split(/,(?=\s*[^;]+=)/g);
}

function getCookieValue(setCookies: string[], name: string): string | null {
  for (const cookie of setCookies) {
    if (!cookie.startsWith(`${name}=`)) continue;
    const value = cookie.slice(name.length + 1).split(';')[0];
    return decodeURIComponent(value);
  }
  return null;
}

describe('Admin session API', () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = 'super-secret-pass';
    process.env.ADMIN_SESSION_SECRET = 'session-secret-key';
  });

  it('creates admin session on valid login', async () => {
    const { POST } = await import('@/app/api/admin/session/route');

    const response = await POST(
      new Request('http://localhost:3000/api/admin/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: 'super-secret-pass' })
      })
    );

    expect(response.status).toBe(200);
    const cookies = getSetCookies(response);
    expect(cookies.some((entry) => entry.startsWith('admin_session='))).toBe(true);
    expect(cookies.some((entry) => entry.startsWith('admin_csrf='))).toBe(true);
  });

  it('rejects invalid credentials', async () => {
    const { POST } = await import('@/app/api/admin/session/route');

    const response = await POST(
      new Request('http://localhost:3000/api/admin/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: 'wrong-pass' })
      })
    );

    expect(response.status).toBe(401);
  });

  it('requires CSRF token for logout', async () => {
    const { POST, DELETE } = await import('@/app/api/admin/session/route');

    const loginResponse = await POST(
      new Request('http://localhost:3000/api/admin/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: 'super-secret-pass' })
      })
    );

    const cookies = getSetCookies(loginResponse);
    const session = getCookieValue(cookies, 'admin_session');
    const csrf = getCookieValue(cookies, 'admin_csrf');

    const response = await DELETE(
      new Request('http://localhost:3000/api/admin/session', {
        method: 'DELETE',
        headers: {
          cookie: `admin_session=${session}; admin_csrf=${csrf}`
        }
      })
    );

    expect(response.status).toBe(403);
  });

  it('logs out when session and CSRF are valid', async () => {
    const { POST, DELETE } = await import('@/app/api/admin/session/route');

    const loginResponse = await POST(
      new Request('http://localhost:3000/api/admin/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: 'super-secret-pass' })
      })
    );

    const cookies = getSetCookies(loginResponse);
    const session = getCookieValue(cookies, 'admin_session');
    const csrf = getCookieValue(cookies, 'admin_csrf');

    const response = await DELETE(
      new Request('http://localhost:3000/api/admin/session', {
        method: 'DELETE',
        headers: {
          cookie: `admin_session=${session}; admin_csrf=${csrf}`,
          'x-csrf-token': csrf ?? ''
        }
      })
    );

    expect(response.status).toBe(200);
    const logoutCookies = getSetCookies(response);
    expect(logoutCookies.some((entry) => entry.includes('admin_session=') && entry.includes('Max-Age=0'))).toBe(true);
    expect(logoutCookies.some((entry) => entry.includes('admin_csrf=') && entry.includes('Max-Age=0'))).toBe(true);
  });
});
