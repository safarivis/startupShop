'use client';

import { FormEvent, useState } from 'react';

interface OfferFormProps {
  startupId: string;
}

export function OfferForm({ startupId }: OfferFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(formData: FormData) {
    setStatus('submitting');
    setMessage('');

    const payload = {
      startup_id: startupId,
      buyer_name: String(formData.get('buyer_name') ?? ''),
      buyer_email: String(formData.get('buyer_email') ?? ''),
      offer_amount_usd: Number(formData.get('offer_amount_usd') ?? 0),
      message: String(formData.get('message') ?? '')
    };

    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.error ?? `Request failed (${response.status})`);
      }

      setStatus('success');
      setMessage('Offer submitted successfully.');
    } catch (error) {
      setStatus('error');
      const text = error instanceof Error ? error.message : 'Failed to submit offer.';
      setMessage(text);
    }
  }

  return (
    <form
      className="offer-form card"
      onSubmit={async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await handleSubmit(new FormData(event.currentTarget));
      }}
    >
      <h2 style={{ marginTop: 0 }}>Offer Details</h2>
      <div className="row">
        <label>
          <div className="meta">Buyer name</div>
          <input className="input" required name="buyer_name" minLength={2} />
        </label>
        <label>
          <div className="meta">Buyer email</div>
          <input className="input" required type="email" name="buyer_email" />
        </label>
      </div>

      <label>
        <div className="meta">Offer amount (USD)</div>
        <input className="input" required type="number" min={1} name="offer_amount_usd" />
      </label>

      <label>
        <div className="meta">Message</div>
        <textarea className="textarea" required name="message" minLength={5} maxLength={4000} />
      </label>

      <label>
        <div className="meta">Startup ID</div>
        <input className="input" value={startupId} disabled readOnly />
      </label>

      <button className="button" type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Submitting...' : 'Submit Offer'}
      </button>

      {message ? <div className="notice">{message}</div> : null}
    </form>
  );
}
