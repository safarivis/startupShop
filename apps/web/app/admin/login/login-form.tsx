"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? "Login failed");
        setLoading(false);
        return;
      }

      router.push("/admin/offers");
      router.refresh();
    } catch {
      setError("Login failed");
      setLoading(false);
    }
  }

  return (
    <form className="max-w-xl p-8 border border-border rounded-lg bg-background hover:border-accent/50 transition-colors space-y-5" onSubmit={onSubmit}>
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Admin Login</h1>
      <label>
        <div className="mb-2 text-secondary">Password</div>
        <input
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent/30"
          type="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      <button
        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
        type="submit"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
      {error ? <p className="rounded-lg border border-border px-4 py-3 text-secondary">{error}</p> : null}
    </form>
  );
}
