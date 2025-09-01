// src/app/(main)/admin/vendors/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import SellersManager from "@/components/vendors/SellersManager";
import { getVendors, listVendorRequests } from "@/lib/actions/vendors";
import AdminTabs from "@/components/admin/AdminTabs";

export default async function Page() {
  const [vendors, requests] = await Promise.all([
    getVendors(),
    listVendorRequests({ status: "pending" }),
  ]);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <AdminTabs active="vendors" />
      <SellersManager vendors={vendors} requests={requests} />
    </main>
  );
}
