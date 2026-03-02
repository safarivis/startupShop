import Link from "next/link";

import { getStartups, type StartupWithScore } from "@startupshop/core";

type SortOption = "score" | "mrr";
type StageOption = "idea" | "mvp" | "early-revenue" | "growth" | "mature";

interface HomeProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    stage?: string;
    sort?: string;
  }>;
}

function isStage(value?: string): value is StageOption {
  return ["idea", "mvp", "early-revenue", "growth", "mature"].includes(value ?? "");
}

function isSort(value?: string): value is SortOption {
  return value === "score" || value === "mrr";
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
  const sort: SortOption = isSort(params.sort) ? params.sort : "score";
  const query = params.q?.trim() ?? "";

  const all = getStartups({ bucket: "current" });
  const categories = Array.from(new Set(all.map((entry) => entry.identity.category))).sort();

  let startups = getStartups({ category, stage, bucket: "current", sort });
  if (query.length > 0) {
    startups = startups.filter((entry) => matchesSearch(entry, query));
  }

  return (
    <main className="max-w-6xl mx-auto px-6 space-y-8">
      <section className="space-y-4">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Portfolio Dashboard</h1>
        <p className="text-lg text-secondary leading-relaxed">
          Internal view of all tracked projects across current and future buckets.
        </p>
      </section>

      <section className="p-8 border border-border rounded-lg bg-background hover:border-accent/50 transition-colors space-y-6">
        <form className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3" method="get">
          <input
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent/30"
            type="search"
            name="q"
            placeholder="Search by name, id, or summary"
            defaultValue={query}
          />
          <select
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
            name="category"
            defaultValue={category ?? ""}
          >
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
            name="stage"
            defaultValue={stage ?? ""}
          >
            <option value="">All stages</option>
            <option value="idea">idea</option>
            <option value="mvp">mvp</option>
            <option value="early-revenue">early-revenue</option>
            <option value="growth">growth</option>
            <option value="mature">mature</option>
          </select>
          <select
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
            name="sort"
            defaultValue={sort}
          >
            <option value="score">Sort by score</option>
            <option value="mrr">Sort by MRR</option>
          </select>
          <button
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
            type="submit"
          >
            Apply Filters
          </button>
        </form>
        <p className="text-lg text-secondary leading-relaxed">
          Showing {startups.length} startup{startups.length === 1 ? "" : "s"}.
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
