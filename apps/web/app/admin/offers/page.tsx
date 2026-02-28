import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { adminSessionCookieNames, isAdminSessionTokenValid } from '@/src/lib/admin-auth';
import { prisma } from '@/src/lib/prisma';
import { LogoutButton } from './logout-button';

export default async function AdminOffersPage() {
  const cookieStore = await cookies();
  const cookieNames = adminSessionCookieNames();
  const sessionToken = cookieStore.get(cookieNames.session)?.value ?? null;
  if (!isAdminSessionTokenValid(sessionToken)) {
    redirect('/admin/login');
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
        <div style={{ marginTop: '0.7rem' }}>
          <LogoutButton />
        </div>
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
