// src/app/(main)/admin/affiliates/page.tsx
export const runtime = "nodejs";

import AdminNav from "@/components/admin/AdminNav";
import { adminDb } from "@/lib/firebase-admin";
import { headers } from "next/headers";

export const metadata = { title: "Afiliados | Admin" };

const pick = (...vals: any[]) => vals.find((v) => v !== undefined && v !== null && v !== "");

export default async function Page() {
  const db = adminDb();

  // Idioma segun navegador
  const accept = headers().get("accept-language")?.toLowerCase() || "";
  const isEs = accept.startsWith("es");
  const t = {
    pageTitle: isEs ? "Afiliados — Admin" : "Affiliates — Admin",
    pageDesc:  isEs ? "Resumen de afiliados y métricas básicas." : "Affiliates overview and basic metrics.",
    none:      isEs
      ? "No hay datos de afiliados detectados. Si tu programa usa otra colección (p.ej. commissions o partners), dime el nombre y lo adapto."
      : "No affiliate data detected. If your program uses another collection (e.g., commissions or partners), tell me and I’ll adapt it.",
    found:     isEs ? "Afiliados encontrados:" : "Affiliates found:",
    nameEmail: isEs ? "Nombre / Email" : "Name / Email",
    codeId:    isEs ? "Código / ID" : "Code / ID",
    plan:      isEs ? "Plan" : "Plan",
    refs:      isEs ? "# Referidos" : "# Referrals",
    vendor:    isEs ? "Vendedor" : "Vendor",
    status:    isEs ? "Estado" : "Status",
    active:    isEs ? "Activo" : "Active",
  };

  let raw: any[] = [];

  try {
    const s = await db.collection("affiliates").limit(100).get();
    if (!s.empty) raw = s.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {}

  if (raw.length === 0) {
    try {
      const s = await db.collection("users").where("affiliate.active","==",true).limit(100).get();
      if (!s.empty) raw = s.docs.map((d) => ({ id: d.id, ...d.data(), _fromUsers: true }));
    } catch {}
  }

  if (raw.length === 0) {
    try {
      const s = await db.collection("referrals").limit(100).get();
      if (!s.empty) raw = s.docs.map((d) => ({ id: d.id, ...d.data(), _fromReferrals: true }));
    } catch {}
  }

  // enriquecer vendor
  const vendorIdSet = new Set<string>();
  for (const a of raw) {
    const vid = pick(a.vendorId, a.sellerId, a?.vendor?.id, a.ownerVendorId);
    if (vid) vendorIdSet.add(String(vid));
  }
  const vendorNames: Record<string,string> = {};
  if (vendorIdSet.size > 0) {
    const ids = Array.from(vendorIdSet);
    const docs = await Promise.all(ids.map(async (id) => {
      try { return await db.collection("vendors").doc(id).get(); }
      catch { return null; }
    }));
    docs.forEach((doc, idx) => {
      if (doc && doc.exists) {
        const d = doc.data() || {};
        vendorNames[ids[idx]] = d.name || d.displayName || d.fullName || d.email || ids[idx];
      }
    });
  }

  const rows = raw.map((a) => {
    const name  = pick(a.name, a.displayName, a.fullName, "");
    const email = pick(a.email, a.contactEmail, a.userEmail, "");
    const code  = pick(a.code, a.refCode, a.inviteCode, a.id);
    const active = pick(a.active, a?.affiliate?.active, (a.status === "active")) ? t.active : "";
    const plan  = pick(a.plan?.name, a.planName, a.tier, a.subscription?.plan, "");
    const refCount = pick(a.referralsCount, a.refCount, a.stats?.referrals, a.metrics?.referrals, 0);
    const vid   = pick(a.vendorId, a.sellerId, a?.vendor?.id, a.ownerVendorId);
    const vendor = vid ? (vendorNames[String(vid)] || String(vid)) : pick(a.vendorName, a.sellerName, "");
    return { name, email, code, plan, refCount, vendor, active };
  });

  return (
    <main className="relative z-0 mx-auto max-w-6xl p-6 pt-16">
      {/* Nav bilingüe y clickeable */}
      <AdminNav current="affiliates" />

      {/* Cabecera */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-primary">{t.pageTitle}</h1>
        <p className="text-muted-foreground">{t.pageDesc}</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-md border p-4 text-sm text-muted-foreground">
          {t.none}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {t.found} <span className="font-semibold">{rows.length}</span>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-3">{t.nameEmail}</th>
                  <th className="p-3">{t.codeId}</th>
                  <th className="p-3">{t.plan}</th>
                  <th className="p-3">{t.refs}</th>
                  <th className="p-3">{t.vendor}</th>
                  <th className="p-3">{t.status}</th>
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
        </div>
      )}
    </main>
  );
}
