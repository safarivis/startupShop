import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { adminSessionCookieNames, isAdminSessionTokenValid } from "@/src/lib/admin-auth";
import { prisma } from "@/src/lib/prisma";
import { LogoutButton } from "./logout-button";

export default async function AdminOffersPage() {
  const cookieStore = await cookies();
  const cookieNames = adminSessionCookieNames();
  const sessionToken = cookieStore.get(cookieNames.session)?.value ?? null;
  if (!isAdminSessionTokenValid(sessionToken)) {
    redirect('/admin/login');
  }

  const offers = await prisma.offer.findMany({
    orderBy: { created_at: "desc" },
    take: 200,
  });

  return (
    <main className="max-w-6xl mx-auto px-6 space-y-4">
      <section className="p-8 border border-border rounded-lg bg-background hover:border-accent/50 transition-colors space-y-4">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Admin Offers</h1>
        <p className="text-lg text-secondary leading-relaxed">
          Showing {offers.length} most recent offer{offers.length === 1 ? "" : "s"}.
        </p>
        <LogoutButton />
      </section>

      <section className="p-8 border border-border rounded-lg bg-background hover:border-accent/50 transition-colors overflow-x-auto">
        <table className="w-full border-collapse text-sm md:text-base">
          <thead>
            <tr className="text-secondary">
              <th align="left" className="pb-3 pr-4">
                Date
              </th>
              <th align="left" className="pb-3 pr-4">
                Startup
              </th>
              <th align="left" className="pb-3 pr-4">
                Buyer
              </th>
              <th align="left" className="pb-3 pr-4">
                Email
              </th>
              <th align="right" className="pb-3 pr-4">
                Amount
              </th>
              <th align="left" className="pb-3">
                Message
              </th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id} className="border-t border-border">
                <td className="py-3 pr-4">{offer.created_at.toISOString()}</td>
                <td className="py-3 pr-4">{offer.startup_id}</td>
                <td className="py-3 pr-4">{offer.buyer_name}</td>
                <td className="py-3 pr-4">{offer.buyer_email}</td>
                <td align="right" className="py-3 pr-4">
                  ${offer.offer_amount_usd.toLocaleString()}
                </td>
                <td className="py-3 max-w-[420px]">{offer.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
