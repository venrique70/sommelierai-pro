// src/app/(main)/admin/vendors/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { Button } from "@/components/ui/button";
import SellersManager from "@/components/vendors/SellersManager";
import { getVendors, listVendorRequests } from "@/lib/actions/vendors";

export default async function Page() {
  const [vendors, requests] = await Promise.all([
    getVendors(),
    listVendorRequests({ status: "pending" }),
  ]);

  return (
    <main className="mx-auto max-w-6xl p-6">
      {/* NAV ADMIN (tabs) */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Button asChild variant="default">
          <Link href="/admin/vendors">Vendedores</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/corporate">Corporativo</Link>
        </Button>
        <Button asChild variant="outline">
          <Link
            href={{ pathname: "/admin/corporate", query: { tab: "affiliates" } }}
          >
            Afiliados
          </Link>
        </Button>
      </div>

      {/* UI principal */}
      <SellersManager vendors={vendors} requests={requests} />
    </main>
  );
}
