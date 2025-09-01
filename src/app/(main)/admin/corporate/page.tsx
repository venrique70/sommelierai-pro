// src/app/(main)/admin/corporate/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import CorporateManager from "@/components/corporate/CorporateManager";
import { getCorporateAccounts, listCorporateInvites } from "@/lib/actions/corporate";

export const metadata = { title: "Corporativo | Admin" };

export default async function Page() {
  const [accounts, invites] = await Promise.all([
    getCorporateAccounts(),
    listCorporateInvites(),
  ]);

  const tab =
    "inline-flex items-center rounded-md border border-white/10 px-3 py-2 text-sm " +
    "hover:bg-white/5 transition-colors";

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-4 flex flex-wrap gap-2 relative z-50 pointer-events-auto">
        <Link href="/admin/vendors" className={tab}>
          Vendedores
        </Link>
        <Link href="/admin/corporate" className={`${tab} bg-yellow-500/20 text-yellow-200`}>
          Corporativo
        </Link>
        <Link href="/admin/affiliates" className={tab}>
          Afiliados
        </Link>
      </div>

      <CorporateManager initialAccounts={accounts} initialInvites={invites} />
    </main>
  );
}
