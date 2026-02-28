"use client";

import { FormEvent, useState } from "react";

interface OfferFormProps {
  startupId: string;
}

export function OfferForm({ startupId }: OfferFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setStatus("submitting");
    setMessage("");

    const payload = {
      startup_id: startupId,
      buyer_name: String(formData.get("buyer_name") ?? ""),
      buyer_email: String(formData.get("buyer_email") ?? ""),
      offer_amount_usd: Number(formData.get("offer_amount_usd") ?? 0),
      message: String(formData.get("message") ?? ""),
    };

    try {
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.error ?? `Request failed (${response.status})`);
      }

      setStatus("success");
      setMessage("Offer submitted successfully.");
    } catch (error) {
      setStatus("error");
      const text = error instanceof Error ? error.message : "Failed to submit offer.";
      setMessage(text);
    }
  }

  return (
    <form
      className="max-w-2xl p-8 border border-border rounded-lg bg-background hover:border-accent/50 transition-colors space-y-5"
      onSubmit={async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await handleSubmit(new FormData(event.currentTarget));
      }}
    >
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Offer Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label>
          <div className="mb-2 text-secondary">Buyer name</div>
          <input
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent/30"
            required
            name="buyer_name"
            minLength={2}
          />
        </label>
        <label>
          <div className="mb-2 text-secondary">Buyer email</div>
          <input
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent/30"
            required
            type="email"
            name="buyer_email"
          />
        </label>
      </div>

      <label>
        <div className="mb-2 text-secondary">Offer amount (USD)</div>
        <input
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent/30"
          required
          type="number"
          min={1}
          name="offer_amount_usd"
        />
      </label>

      <label>
        <div className="mb-2 text-secondary">Message</div>
        <textarea
          className="w-full min-h-36 rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent/30"
          required
          name="message"
          minLength={5}
          maxLength={4000}
        />
      </label>

      <label>
        <div className="mb-2 text-secondary">Startup ID</div>
        <input
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-secondary"
          value={startupId}
          disabled
          readOnly
        />
      </label>

      <button
        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
        type="submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Submitting..." : "Submit Offer"}
      </button>

      {message ? <div className="rounded-lg border border-border px-4 py-3 text-secondary">{message}</div> : null}
    </form>
  );
}
