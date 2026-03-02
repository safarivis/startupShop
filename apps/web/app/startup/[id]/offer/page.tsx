import Link from "next/link";
import { notFound } from "next/navigation";

import { getStartupById } from "@startupshop/core";

import { OfferForm } from "./offer-form";

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
    <main className="max-w-6xl mx-auto px-6 space-y-6">
      <section className="space-y-3">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Submit Offer for {startup.identity.name}</h1>
        <p className="text-lg text-secondary leading-relaxed">
          Asking price: ${startup.deal.ask_usd.toLocaleString()} {" · "} Stage: {startup.status.stage}
        </p>
        <Link
          href={`/startup/${startup.startup_id}`}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border rounded-full font-medium hover:border-foreground transition-colors"
        >
          Back to Startup
        </Link>
      </section>

      <OfferForm startupId={startup.startup_id} />
    </main>
  );
}
