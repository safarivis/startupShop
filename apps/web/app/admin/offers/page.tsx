import { headers } from 'next/headers';

import { prisma } from '@/src/lib/prisma';

interface AdminOffersProps {
  searchParams: Promise<{ token?: string }>;
}

async function readHeaderToken(): Promise<string | null> {
  const h = await headers();
  const direct = h.get('x-admin-token');
  if (direct) {
    return direct;
  }

  const auth = h.get('authorization');
  if (!auth) {
    return null;
  }

  return auth.replace(/^Bearer\s+/i, '').trim() || null;
}

export default async function AdminOffersPage({ searchParams }: AdminOffersProps) {
  const params = await searchParams;
  const expected = process.env.ADMIN_TOKEN;
  const provided = params.token ?? (await readHeaderToken());

  if (!expected || provided !== expected) {
    return (
      <main>
        <section className="card">
          <h1 style={{ marginTop: 0 }}>Admin Offers</h1>
          <p className="notice">Unauthorized. Provide ADMIN_TOKEN via `?token=` or `x-admin-token` header.</p>
        </section>
      </main>
    );
  }

  const offers = await prisma.offer.findMany({
    orderBy: { created_at: 'desc' },
    take: 200
  });

  return (
    <main>
      <section className="card" style={{ marginBottom: '1rem' }}>
        <h1 style={{ marginTop: 0 }}>Admin Offers</h1>
        <p className="meta" style={{ marginBottom: 0 }}>
          Showing {offers.length} most recent offer{offers.length === 1 ? '' : 's'}.
        </p>
      </section>

      <section className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">Date</th>
              <th align="left">Startup</th>
              <th align="left">Buyer</th>
              <th align="left">Email</th>
              <th align="right">Amount</th>
              <th align="left">Message</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id} style={{ borderTop: '1px solid #d2dce6' }}>
                <td>{offer.created_at.toISOString()}</td>
                <td>{offer.startup_id}</td>
                <td>{offer.buyer_name}</td>
                <td>{offer.buyer_email}</td>
                <td align="right">${offer.offer_amount_usd.toLocaleString()}</td>
                <td style={{ maxWidth: 420 }}>{offer.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
