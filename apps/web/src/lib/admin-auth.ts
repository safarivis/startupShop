import crypto from 'node:crypto';

const SESSION_COOKIE = 'admin_session';
const CSRF_COOKIE = 'admin_csrf';
const SESSION_TTL_SECONDS = Number(process.env.ADMIN_SESSION_TTL_SECONDS ?? 60 * 60 * 8);

interface SessionPayload {
  sub: 'admin';
  exp: number;
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function encode(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function decode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_TOKEN;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET or ADMIN_TOKEN must be configured');
  }
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const i = item.indexOf('=');
        if (i < 0) return [item, ''];
        return [item.slice(0, i), decodeURIComponent(item.slice(i + 1))];
      })
  );
}

function serializeCookie(name: string, value: string, options: Record<string, string | number | boolean>): string {
  const base = `${name}=${encodeURIComponent(value)}`;
  const extras = Object.entries(options)
    .filter(([, v]) => v !== false && v !== undefined && v !== null)
    .map(([k, v]) => (v === true ? k : `${k}=${v}`));
  return [base, ...extras].join('; ');
}

function createSessionToken(): string {
  const payload: SessionPayload = {
    sub: 'admin',
    exp: nowSeconds() + SESSION_TTL_SECONDS
  };

  const payloadEncoded = encode(JSON.stringify(payload));
  const signature = sign(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

function verifySessionToken(token: string | null): boolean {
  if (!token) {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return false;
  }

  const [payloadEncoded, signature] = parts;
  const expectedSig = sign(payloadEncoded);
  if (!safeEqual(signature, expectedSig)) {
    return false;
  }

  try {
    const parsed = JSON.parse(decode(payloadEncoded)) as SessionPayload;
    return parsed.sub === 'admin' && parsed.exp > nowSeconds();
  } catch {
    return false;
  }
}

function createCsrfToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}

function cookieBase(isHttpOnly: boolean): Record<string, string | number | boolean> {
  return {
    Path: '/',
    'Max-Age': SESSION_TTL_SECONDS,
    HttpOnly: isHttpOnly,
    SameSite: 'Lax',
    Secure: process.env.NODE_ENV === 'production'
  };
}

export function adminPasswordIsValid(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD || process.env.ADMIN_TOKEN;
  if (!password) {
    return false;
  }
  return safeEqual(input, password);
}

export function createAdminSessionSetCookies(): string[] {
  const sessionToken = createSessionToken();
  const csrfToken = createCsrfToken();

  return [
    serializeCookie(SESSION_COOKIE, sessionToken, cookieBase(true)),
    serializeCookie(CSRF_COOKIE, csrfToken, cookieBase(false))
  ];
}

export function createAdminSessionClearCookies(): string[] {
  return [
    serializeCookie(SESSION_COOKIE, '', {
      Path: '/',
      HttpOnly: true,
      'Max-Age': 0,
      SameSite: 'Lax',
      Secure: process.env.NODE_ENV === 'production'
    }),
    serializeCookie(CSRF_COOKIE, '', {
      Path: '/',
      HttpOnly: false,
      'Max-Age': 0,
      SameSite: 'Lax',
      Secure: process.env.NODE_ENV === 'production'
    })
  ];
}

export function isAdminSessionRequest(request: Request): boolean {
  const cookies = parseCookies(request.headers.get('cookie'));
  return verifySessionToken(cookies[SESSION_COOKIE] ?? null);
}

export function isAdminSessionTokenValid(token: string | null): boolean {
  return verifySessionToken(token);
}

export function csrfFromCookieHeader(cookieHeader: string | null): string | null {
  const cookies = parseCookies(cookieHeader);
  return cookies[CSRF_COOKIE] ?? null;
}

export function isValidCsrfRequest(request: Request): boolean {
  const cookieToken = csrfFromCookieHeader(request.headers.get('cookie'));
  const headerToken = request.headers.get('x-csrf-token');

  if (!cookieToken || !headerToken) {
    return false;
  }

  return safeEqual(cookieToken, headerToken);
}

export function adminSessionCookieNames() {
  return {
    session: SESSION_COOKIE,
    csrf: CSRF_COOKIE
  };
}
