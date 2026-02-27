import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getStartupById } from '@startupshop/core';

interface StartupDetailProps {
  params: Promise<{ id: string }>;
}

export default async function StartupDetailPage({ params }: StartupDetailProps) {
  const { id } = await params;
  const startup = getStartupById(id);

  if (!startup) {
    notFound();
  }

  return (
    <main className="detail-layout">
      <section className="card">
        <h1 style={{ marginTop: 0 }}>{startup.identity.name}</h1>
        <p className="meta" style={{ marginTop: 0 }}>
          {startup.startup_id} · {startup.identity.category} · {startup.status.stage}
        </p>
        <p>{startup.identity.summary}</p>
        <p className="meta" style={{ marginBottom: 0 }}>
          Website:{' '}
          <a href={startup.identity.website} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
            {startup.identity.website}
          </a>
        </p>
      </section>

      <section className="stats">
        <article className="card">
          <h2 style={{ marginTop: 0 }}>Traction</h2>
          <dl className="kv">
            <dt>MRR</dt>
            <dd>${startup.traction.mrr_usd.toLocaleString()}</dd>
            <dt>Users</dt>
            <dd>{startup.traction.users.toLocaleString()}</dd>
            <dt>MoM growth</dt>
            <dd>{startup.traction.growth_mom_percent}%</dd>
          </dl>
        </article>

        <article className="card">
          <h2 style={{ marginTop: 0 }}>Deal</h2>
          <dl className="kv">
            <dt>Ask</dt>
            <dd>${startup.deal.ask_usd.toLocaleString()}</dd>
            <dt>Terms</dt>
            <dd>{startup.deal.terms}</dd>
          </dl>
        </article>

        <article className="card">
          <h2 style={{ marginTop: 0 }}>Score Breakdown</h2>
          <dl className="kv">
            <dt>Total</dt>
            <dd>{startup.score.total_score}</dd>
            <dt>Stage</dt>
            <dd>{startup.score.stage_score}</dd>
            <dt>Traction</dt>
            <dd>{startup.score.traction_score}</dd>
            <dt>Ops readiness</dt>
            <dd>{startup.score.ops_readiness_score}</dd>
            <dt>Tech risk</dt>
            <dd>{startup.score.tech_risk_score}</dd>
            <dt>Unit economics</dt>
            <dd>{startup.score.unit_economics_score}</dd>
          </dl>
        </article>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>MVP, Tech, and Ops</h2>
        <p>
          <strong>MVP:</strong> {startup.mvp.live ? 'Live' : 'Not live'} - {startup.mvp.notes}
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
        <p style={{ marginBottom: 0 }}>
          <strong>Owner handoff ready:</strong> {startup.ops.owner_handoff_ready ? 'yes' : 'no'}
        </p>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Risks</h2>
        <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
          {startup.risks.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      </section>

      <section style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
        <Link href="/" className="button secondary">
          Back to Catalog
        </Link>
        <Link href={`/startup/${startup.startup_id}/offer`} className="button">
          Submit Offer
        </Link>
      </section>
    </main>
  );
}
