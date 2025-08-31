export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getVendors, listVendorRequests } from "@/lib/actions/vendors";

export default async function Page() {
  try {
    const [vendors, requests] = await Promise.all([
      getVendors(),
      listVendorRequests({ status: "pending" }),
    ]);
    return (
      <pre className="p-6 text-sm text-emerald-300 bg-black/60 whitespace-pre-wrap">
{JSON.stringify(
  { vendorsCount: vendors.length, requestsCount: requests.length, sampleVendor: vendors[0] ?? null, sampleRequest: requests[0] ?? null },
  null, 2
)}
      </pre>
    );
  } catch (e: any) {
    return (
      <pre className="p-6 text-sm text-red-400 bg-black/60 whitespace-pre-wrap">
{String(e?.message || e)}
      </pre>
    );
  }
}
