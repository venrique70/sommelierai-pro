// src/app/(main)/admin/corporate/page.tsx
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
      <div className="mb-4 flex flex-wrap gap-2 relative z-50">
        <Button asChild variant="outline">
          <Link href="/admin/vendors">Vendedores</Link>
        </Button>
        <Button asChild variant="default">
          <Link href="/admin/corporate">Corporativo</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/affiliates">Afiliados</Link>
        </Button>
      </div>

      <CorporateManager initialAccounts={accounts} initialInvites={invites} />
    </main>
  );
}
