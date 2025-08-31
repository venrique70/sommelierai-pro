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
{`OK /admin/vendors
vendorsCount: ${vendors?.length ?? 0}
requestsCount: ${requests?.length ?? 0}

sampleVendor:
${JSON.stringify(vendors?.[0] ?? null, null, 2)}

sampleRequest:
${JSON.stringify(requests?.[0] ?? null, 2)}
`}
      </pre>
    );
  } catch (e: any) {
    return (
      <pre className="p-6 text-sm text-red-400 bg-black/60 whitespace-pre-wrap">
{`Admin vendors error:
${String(e?.message || e)}`}
      </pre>
    );
  }
}
