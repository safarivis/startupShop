'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

function getCookie(name: string): string | null {
  const entries = document.cookie.split(';').map((item) => item.trim());
  for (const entry of entries) {
    if (!entry.startsWith(`${name}=`)) continue;
    return decodeURIComponent(entry.slice(name.length + 1));
  }
  return null;
}

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    setBusy(true);
    const csrf = getCookie('admin_csrf');

    await fetch('/api/admin/session', {
      method: 'DELETE',
      headers: csrf ? { 'x-csrf-token': csrf } : {}
    });

    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button className="button secondary" type="button" onClick={onLogout} disabled={busy}>
      {busy ? 'Signing out...' : 'Sign out'}
    </button>
  );
}
