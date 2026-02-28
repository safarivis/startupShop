import Link from "next/link";
import { notFound } from "next/navigation";

import { getStartupById } from "@startupshop/core";
import { getStartupMetrics } from "@/src/lib/metrics";

interface StartupDetailProps {
  params: Promise<{ id: string }>;
}

export default async function StartupDetailPage({ params }: StartupDetailProps) {
  const { id } = await params;
  const startup = getStartupById(id);

  if (!startup) {
    notFound();
  }

  let metrics: Awaited<ReturnType<typeof getStartupMetrics>> | null = null;
  if (startup.metrics_url) {
    try {
      metrics = await getStartupMetrics(startup.startup_id, { refresh: false, fetchedVia: "api" });
    } catch {
      metrics = null;
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 space-y-4">
      <section className="p-8 border border-border rounded-lg bg-background hover:border-accent/50 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">{startup.identity.name}</h1>
          {metrics ? (
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-sm font-medium bg-accent/10 text-accent">
                Verified
              </span>
              {metrics.stale ? (
                <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-sm font-medium text-secondary">
                  Stale
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <p className="mt-2 text-secondary">
          {startup.startup_id} {" · "} {startup.identity.category} {" · "} {startup.status.stage}
        </p>
        <p className="mt-4 text-lg text-secondary leading-relaxed">{startup.identity.summary}</p>
        <p className="mt-4 text-secondary">
          Website{" "}
          <a href={startup.identity.website} target="_blank" rel="noreferrer" className="underline hover:text-accent">
            {startup.identity.website}
          </a>
        </p>
      </section>

      <section className="p-8 border border-border rounded-lg bg-background hover:border-accent/50 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Metrics</h2>
        {metrics ? (
          <>
            <p className="mt-3 text-secondary">
              Fetched at {metrics.fetched_at}
              {metrics.cached ? " (cached)" : ""}
              {" · "}source: {metrics.source}
              {metrics.stale ? " · stale" : ""}
            </p>
            <pre className="mt-4 whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-4 text-sm text-secondary">
              {JSON.stringify(metrics.payload, null, 2)}
            </pre>
          </>
        ) : (
          <p className="mt-3 text-secondary">
            No verified metrics available for this listing yet.
          </p>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <article className="p-8 border border-border rounded-lg bg-background hover:border-accent/50 transition-colors">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Traction</h2>
          <dl className="mt-4 grid gap-2">
            <dt className="text-secondary">MRR</dt>
            <dd className="font-semibold">${startup.traction.mrr_usd.toLocaleString()}</dd>
            <dt className="text-secondary">Users</dt>
            <dd className="font-semibold">{startup.traction.users.toLocaleString()}</dd>
            <dt className="text-secondary">MoM growth</dt>
            <dd className="font-semibold">{startup.traction.growth_mom_percent}%</dd>
          </dl>
        </article>

        <article className="p-8 border border-border rounded-lg bg-background hover:border-accent/50 transition-colors">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Deal</h2>
          <dl className="mt-4 grid gap-2">
            <dt className="text-secondary">Ask</dt>
            <dd className="font-semibold">${startup.deal.ask_usd.toLocaleString()}</dd>
            <dt className="text-secondary">Terms</dt>
            <dd className="font-semibold">{startup.deal.terms}</dd>
          </dl>
        </article>

        <article className="p-8 border border-border rounded-lg bg-background hover:border-accent/50 transition-colors">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Score Breakdown</h2>
          <dl className="mt-4 grid gap-2">
            <dt className="text-secondary">Total</dt>
            <dd className="font-semibold">{startup.score.total_score}</dd>
            <dt className="text-secondary">Stage</dt>
            <dd className="font-semibold">{startup.score.stage_score}</dd>
            <dt className="text-secondary">Traction</dt>
            <dd className="font-semibold">{startup.score.traction_score}</dd>
            <dt className="text-secondary">Ops readiness</dt>
            <dd className="font-semibold">{startup.score.ops_readiness_score}</dd>
            <dt className="text-secondary">Tech risk</dt>
            <dd className="font-semibold">{startup.score.tech_risk_score}</dd>
            <dt className="text-secondary">Unit economics</dt>
            <dd className="font-semibold">{startup.score.unit_economics_score}</dd>
          </dl>
        </article>
      </section>

      <section className="p-8 border border-border rounded-lg bg-background hover:border-accent/50 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">MVP, Tech, and Ops</h2>
        <p>
          <strong>MVP:</strong> {startup.mvp.live ? "Live" : "Not live"} - {startup.mvp.notes}
        </p>
        <p>
          <strong>Tech stack:</strong> {startup.tech.stack.join(', ')}
        </p>
        <p>
          <strong>Tech risk:</strong> {startup.tech.risk_level}
        </p>
        <p>
          <strong>Automation:</strong> {startup.ops.automation_level}
        </p>
        <p>
          <strong>Owner handoff ready:</strong> {startup.ops.owner_handoff_ready ? "yes" : "no"}
        </p>
      </section>

      <section className="p-8 border border-border rounded-lg bg-background hover:border-accent/50 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Risks</h2>
        <ul className="mt-4 pl-5 space-y-1">
          {startup.risks.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border rounded-full font-medium hover:border-foreground transition-colors"
        >
          Back to Catalog
        </Link>
        <Link
          href={`/startup/${startup.startup_id}/offer`}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
        >
          Submit Offer
        </Link>
      </section>
    </main>
  );
}
