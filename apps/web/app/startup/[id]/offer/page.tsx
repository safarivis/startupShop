import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getStartupById } from '@startupshop/core';

import { OfferForm } from './offer-form';

interface OfferPageProps {
  params: Promise<{ id: string }>;
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { id } = await params;
  const startup = getStartupById(id);

  if (!startup) {
    notFound();
  }

  return (
    <main>
      <section style={{ marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Submit Offer for {startup.identity.name}</h1>
        <p className="meta">
          Asking price: ${startup.deal.ask_usd.toLocaleString()} · Stage: {startup.status.stage}
        </p>
        <Link href={`/startup/${startup.startup_id}`} className="button secondary">
          Back to Startup
        </Link>
      </section>

      <OfferForm startupId={startup.startup_id} />
    </main>
  );
}
