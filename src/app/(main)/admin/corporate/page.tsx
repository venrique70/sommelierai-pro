export const runtime = "nodejs";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import CorporateManager from "@/components/corporate/CorporateManager";
import { getCorporateAccounts, listCorporateInvites } from "@/lib/actions/corporate";

export const metadata = { title: "Corporativo | Admin" };

export default async function Page() {
  const [accounts, invites] = await Promise.all([
    getCorporateAccounts(),
    listCorporateInvites(),
  ]);

  return (
    <main className="mx-auto max-w-6xl p-6">
      {/* NAV ADMIN */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/vendors"><Button variant="outline">Vendedores</Button></Link>
        <Link href="/admin/corporate"><Button variant="default">Corporativo</Button></Link>
        <Link href="/admin/affiliates"><Button variant="outline">Afiliados</Button></Link>
      </div>

      <CorporateManager initialAccounts={accounts} initialInvites={invites} />
    </main>
  );
}
