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

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-4 flex flex-wrap gap-2 sticky top-[56px] z-[9999] isolate pointer-events-auto bg-black/50 backdrop-blur rounded-md p-1">
        <Link
          href="/admin/vendors"
          className="inline-flex items-center rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
        >
          Vendedores
        </Link>
        <Link
          href="/admin/corporate"
          className="inline-flex items-center rounded-md border border-white/10 px-3 py-2 text-sm bg-yellow-500/20 text-yellow-200 hover:bg-white/5"
        >
          Corporativo
        </Link>
        <Link
          href="/admin/affiliates"
          className="inline-flex items-center rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
        >
          Afiliados
        </Link>
      </div>

      <CorporateManager initialAccounts={accounts} initialInvites={invites} />
    </main>
  );
}
