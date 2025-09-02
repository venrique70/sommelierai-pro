export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
import Link from "next/link";
import SellersManager from "@/components/vendors/SellersManager";
import { getVendors, listVendorRequests } from "@/lib/actions/vendors";
export default async function Page() {
  const [vendors, requests] = await Promise.all([
    getVendors(),
    listVendorRequests({ status: "pending" }),
  ]);
  return (
    <main className="mx-auto max-w-6xl p-6">
      {/* NAV elevado y sin overlays */}
      <div className="mb-4 flex flex-wrap gap-2 sticky top-[56px] z-[9999] isolate pointer-events-auto bg-black/50 backdrop-blur rounded-md p-1">
        <Link
          href="/admin/vendors"
          className="inline-flex items-center rounded-md border border-white/10 px-3 py-2 text-sm bg-yellow-500/20 text-yellow-200 hover:bg-white/5"
        >
          Vendedores
        </Link>
        <Link
          href="/admin/corporate"
          className="inline-flex items-center rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
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
      <SellersManager vendors={vendors} requests={requests} />
    </main>
  );
}
