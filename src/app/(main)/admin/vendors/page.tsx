export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import AdminNav from "@/components/admin/AdminNav";
import SellersManager from "@/components/vendors/SellersManager";
import { getVendors, listVendorRequests } from "@/lib/actions/vendors";

export default async function Page() {
  const [vendors, requests] = await Promise.all([
    getVendors(),
    listVendorRequests({ status: "pending" }),
  ]);

  return (
    <main className="relative z-0 mx-auto max-w-6xl p-6 pt-16">
      {/* Nav bilingüe y clickeable (centralizado) */}
      <AdminNav current="vendors" />

      {/* UI principal */}
      <SellersManager initialVendors={vendors} initialRequests={requests} />
    </main>
  );
}
