import Link from "next/link";

import { getStartups } from "@startupshop/core";

export default function InvestPage() {
  const startups = getStartups({ visibility: "investor", sort: "score" });

  return (
    <main className="max-w-6xl mx-auto px-6 space-y-8">
      <section className="space-y-4">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Investor Showcase</h1>
        <p className="text-lg text-secondary leading-relaxed">
          Curated projects currently visible for investor review.
        </p>
      </section>

      <section className="p-8 border border-border rounded-lg bg-background hover:border-accent/50 transition-colors">
        <p className="text-lg text-secondary leading-relaxed">
          Showing {startups.length} investor-visible project{startups.length === 1 ? "" : "s"}.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {startups.map((startup) => (
          <Link
            key={startup.startup_id}
            href={`/startup/${startup.startup_id}`}
            className="p-8 border border-border rounded-lg bg-background hover:border-accent/50 transition-colors"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{startup.identity.name}</h2>
            <p className="mt-2 text-secondary">
              {startup.identity.category} {" · "} {startup.status.stage}
            </p>
            <p className="mt-4 text-lg text-secondary leading-relaxed">{startup.identity.summary}</p>
            <p className="mt-4 text-accent font-semibold">Score {startup.score.total_score}</p>
            <p className="text-secondary">
              MRR ${startup.traction.mrr_usd.toLocaleString()} {" · "} Ask ${startup.deal.ask_usd.toLocaleString()}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
