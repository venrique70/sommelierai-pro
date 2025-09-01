// src/app/(main)/admin/corporate/page.tsx
export const runtime = "nodejs";

import CorporateManager from "@/components/corporate/CorporateManager";
import { getCorporateAccounts, listCorporateInvites } from "@/lib/actions/corporate";
import AdminTabs from "@/components/admin/AdminTabs";

export const metadata = { title: "Corporativo | Admin" };

export default async function Page() {
  const [accounts, invites] = await Promise.all([
    getCorporateAccounts(),
    listCorporateInvites(),
  ]);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <AdminTabs active="corporate" />
      <CorporateManager initialAccounts={accounts} initialInvites={invites} />
    </main>
  );
}
