import Link from 'next/link';

import { getStartups, type StartupWithScore } from '@startupshop/core';

type SortOption = 'score' | 'mrr';
type StageOption = 'idea' | 'mvp' | 'early-revenue' | 'growth' | 'mature';

interface HomeProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    stage?: string;
    sort?: string;
  }>;
}

function isStage(value?: string): value is StageOption {
  return ['idea', 'mvp', 'early-revenue', 'growth', 'mature'].includes(value ?? '');
}

function isSort(value?: string): value is SortOption {
  return value === 'score' || value === 'mrr';
}

function matchesSearch(startup: StartupWithScore, q: string): boolean {
  const query = q.toLowerCase();
  return (
    startup.startup_id.toLowerCase().includes(query) ||
    startup.identity.name.toLowerCase().includes(query) ||
    startup.identity.summary.toLowerCase().includes(query)
  );
}

export default async function HomePage({ searchParams }: HomeProps) {
  const params = await searchParams;

  const category = params.category?.trim() || undefined;
  const stage = isStage(params.stage) ? params.stage : undefined;
  const sort: SortOption = isSort(params.sort) ? params.sort : 'score';
  const query = params.q?.trim() ?? '';

  const all = getStartups();
  const categories = Array.from(new Set(all.map((entry) => entry.identity.category))).sort();

  let startups = getStartups({ category, stage, sort });
  if (query.length > 0) {
    startups = startups.filter((entry) => matchesSearch(entry, query));
  }

  return (
    <main>
      <section className="card" style={{ marginBottom: '1rem' }}>
        <h1 style={{ marginTop: 0 }}>Catalog</h1>
        <form className="catalog-form" method="get">
          <input className="input" type="search" name="q" placeholder="Search by name, id, or summary" defaultValue={query} />
          <select className="select" name="category" defaultValue={category ?? ''}>
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select className="select" name="stage" defaultValue={stage ?? ''}>
            <option value="">All stages</option>
            <option value="idea">idea</option>
            <option value="mvp">mvp</option>
            <option value="early-revenue">early-revenue</option>
            <option value="growth">growth</option>
            <option value="mature">mature</option>
          </select>
          <select className="select" name="sort" defaultValue={sort}>
            <option value="score">Sort by score</option>
            <option value="mrr">Sort by MRR</option>
          </select>
          <button className="button" type="submit">
            Apply Filters
          </button>
        </form>
        <p className="meta" style={{ marginBottom: 0 }}>
          Showing {startups.length} startup{startups.length === 1 ? '' : 's'}.
        </p>
      </section>

      <section className="grid">
        {startups.map((startup) => (
          <Link key={startup.startup_id} href={`/startup/${startup.startup_id}`} className="card">
            <h2 className="listing-title">{startup.identity.name}</h2>
            <p className="meta" style={{ marginTop: 0 }}>
              {startup.identity.category} · {startup.status.stage}
            </p>
            <p>{startup.identity.summary}</p>
            <p style={{ marginBottom: '0.25rem' }}>
              <span className="score">Score {startup.score.total_score}</span>
            </p>
            <p className="meta" style={{ marginBottom: 0 }}>
              MRR ${startup.traction.mrr_usd.toLocaleString()} · Ask ${startup.deal.ask_usd.toLocaleString()}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
