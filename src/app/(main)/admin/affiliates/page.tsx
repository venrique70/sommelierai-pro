// src/app/(main)/admin/affiliates/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";

export const metadata = { title: "Afiliados | Admin" };

const pick = (...vals: any[]) => vals.find(v => v !== undefined && v !== null && v !== "");

export default async function Page() {
  const db = adminDb();
  let raw: any[] = [];

  try {
    const s = await db.collection("affiliates").limit(100).get();
    if (!s.empty) raw = s.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {}

  if (raw.length === 0) {
    try {
      const s = await db.collection("users").where("affiliate.active","==",true).limit(100).get();
      if (!s.empty) raw = s.docs.map(d => ({ id: d.id, ...d.data(), _fromUsers:true }));
    } catch {}
  }

  if (raw.length === 0) {
    try {
      const s = await db.collection("referrals").limit(100).get();
      if (!s.empty) raw = s.docs.map(d => ({ id: d.id, ...d.data(), _fromReferrals:true }));
    } catch {}
  }

  const vendorIdSet = new Set<string>();
  for (const a of raw) {
    const vid = pick(a.vendorId, a.sellerId, a?.vendor?.id, a.ownerVendorId);
    if (vid) vendorIdSet.add(String(vid));
  }
  const vendorNames: Record<string,string> = {};
  if (vendorIdSet.size > 0) {
    const ids = Array.from(vendorIdSet);
    const docs = await Promise.all(ids.map(async (id) => {
      try { return await db.collection("vendors").doc(id).get(); } catch { return null; }
    }));
    docs.forEach((doc, idx) => {
      if (doc && doc.exists) {
        const data = doc.data() || {};
        vendorNames[ids[idx]] = (data.name || data.displayName || data.fullName || data.email || ids[idx]);
      }
    });
  }

  const rows = raw.map((a) => {
    const name  = pick(a.name, a.displayName, a.fullName, "");
    const email = pick(a.email, a.contactEmail, a.userEmail, "");
    const code  = pick(a.code, a.refCode, a.inviteCode, a.id);
    const active = pick(a.active, a?.affiliate?.active, (a.status === "active")) ? "Activo" : "";
    const plan = pick(a.plan?.name, a.planName, a.tier, a.subscription?.plan, "");
    const refCount = pick(a.referralsCount, a.refCount, a.stats?.referrals, a.metrics?.referrals, 0);
    const vid = pick(a.vendorId, a.sellerId, a?.vendor?.id, a.ownerVendorId);
    const vendor = vid ? (vendorNames[String(vid)] || String(vid)) : pick(a.vendorName, a.sellerName, "");
    return { name, email, code, plan, refCount, vendor, active };
  });

  const tab =
    "inline-flex items-center rounded-md border border-white/10 px-3 py-2 text-sm " +
    "hover:bg-white/5 transition-colors";

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-4 flex flex-wrap gap-2 relative z-50 pointer-events-auto">
        <Link href="/admin/vendors" className={tab}>Vendedores</Link>
        <Link href="/admin/corporate" className={tab}>Corporativo</Link>
        <Link href="/admin/affiliates" className={`${tab} bg-yellow-500/20 text-yellow-200`}>Afiliados</Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-md border p-4 text-sm text-muted-foreground">
          No hay datos de afiliados detectados. Si tu programa usa otra colección
          (p.ej. <code>commissions</code> o <code>partners</code>), dime el nombre y lo adapto.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Afiliados encontrados: <span className="font-semibold">{rows.length}</span>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-3">Nombre / Email</th>
                  <th className="p-3">Código / ID</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3"># Referidos</th>
                  <th className="p-3">Vendedor</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{r.name}{r.email ? `  ${r.email}` : ""}</td>
                    <td className="p-3">{r.code}</td>
                    <td className="p-3">{r.plan}</td>
                    <td className="p-3">{r.refCount}</td>
                    <td className="p-3">{r.vendor}</td>
                    <td className="p-3">{r.active}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>  {/* ⬅ cierre que faltaba */}
      )}
    </main>
  );
}
