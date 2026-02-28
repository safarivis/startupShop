import { NextResponse } from 'next/server';

import {
  adminPasswordIsValid,
  createAdminSessionClearCookies,
  createAdminSessionSetCookies,
  isAdminSessionRequest,
  isValidCsrfRequest
} from '@/src/lib/admin-auth';
import { logApiEvent } from '@/src/lib/logging';

export async function POST(request: Request) {
  const startedAt = Date.now();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const password = typeof payload === 'object' && payload ? (payload as { password?: unknown }).password : undefined;
  if (typeof password !== 'string' || !adminPasswordIsValid(password)) {
    logApiEvent({
      endpoint: '/api/admin/session',
      method: 'POST',
      status: 401,
      latency_ms: Date.now() - startedAt,
      error_code: 'admin_auth_failed'
    });
    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
  }

  const response = NextResponse.json({ data: { ok: true } }, { status: 200 });
  for (const cookie of createAdminSessionSetCookies()) {
    response.headers.append('set-cookie', cookie);
  }

  logApiEvent({
    endpoint: '/api/admin/session',
    method: 'POST',
    status: 200,
    latency_ms: Date.now() - startedAt
  });

  return response;
}

export async function DELETE(request: Request) {
  const startedAt = Date.now();

  if (!isAdminSessionRequest(request)) {
    logApiEvent({
      endpoint: '/api/admin/session',
      method: 'DELETE',
      status: 401,
      latency_ms: Date.now() - startedAt,
      error_code: 'admin_session_missing'
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isValidCsrfRequest(request)) {
    logApiEvent({
      endpoint: '/api/admin/session',
      method: 'DELETE',
      status: 403,
      latency_ms: Date.now() - startedAt,
      error_code: 'csrf_failed'
    });
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  const response = NextResponse.json({ data: { ok: true } }, { status: 200 });
  for (const cookie of createAdminSessionClearCookies()) {
    response.headers.append('set-cookie', cookie);
  }

  logApiEvent({
    endpoint: '/api/admin/session',
    method: 'DELETE',
    status: 200,
    latency_ms: Date.now() - startedAt
  });

  return response;
}
