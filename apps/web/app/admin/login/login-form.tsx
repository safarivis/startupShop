'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? 'Login failed');
        setLoading(false);
        return;
      }

      router.push('/admin/offers');
      router.refresh();
    } catch {
      setError('Login failed');
      setLoading(false);
    }
  }

  return (
    <form className="offer-form card" onSubmit={onSubmit}>
      <h1 style={{ marginTop: 0 }}>Admin Login</h1>
      <label>
        <div className="meta">Password</div>
        <input
          className="input"
          type="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      <button className="button" type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
      {error ? <p className="notice">{error}</p> : null}
    </form>
  );
}
