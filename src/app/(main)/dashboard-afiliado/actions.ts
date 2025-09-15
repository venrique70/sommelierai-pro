"use server";

import { adminDb } from "@/lib/firebase-admin";

/** Tipos públicos que consume page.tsx */
export type VendorLevel = "Nuevo" | "Pregrado" | "Bachelor" | "Pro" | "Master";
export type VendorStatus = "none" | "pending" | "approved";

export type VendorSale = {
  id: string;
  createdAt: string;            // ISO string
  plan: string;                 // 'Una Copa' | 'Copa Premium' | 'Sibarita' | etc.
  seats: number;                // nº de licencias
  status: "paid" | "pending" | "refunded" | string;
  estimatedCommission: number;  // USD
};

export type VendorMetrics = {
  level: VendorLevel;
  activeReferrals: number;
  pendingCommission: number;    // USD
  nextPayoutDate: string;       // ISO o '—'
  lemonAffiliateLink?: string;  // enlace pegado por el vendedor
  affiliateStatus: VendorStatus;
  recentSales: VendorSale[];    // placeholder hasta integrar Lemon reports
};

/**
 * Lee métricas básicas y estado de afiliado desde Firestore.
 */
export async function getVendorMetrics(uid: string): Promise<VendorMetrics> {
  const db = adminDb();
  let status: VendorStatus = "none";
  let lemonAffiliateLink = "";

  try {
    const snap = await db.collection("users").doc(uid).get();
    const data = snap.exists ? (snap.data() as any) : {};
    status = (data?.affiliate?.status as VendorStatus) ?? "none";
    lemonAffiliateLink = data?.lemonAffiliateLink ?? "";
  } catch {
    /* noop */
  }

  return {
    level: "Nuevo",
    activeReferrals: 0,
    pendingCommission: 0,
    nextPayoutDate: "—",
    lemonAffiliateLink,
    affiliateStatus: status,
    recentSales: [],
  };
}

/**
 * Guarda/actualiza el enlace de afiliado de Lemon del vendedor.
 */
export async function saveAffiliateLink(
  uid: string,
  link: string
): Promise<{ success: boolean; message: string }> {
  if (!/^https?:\/\//i.test(link)) {
    return { success: false, message: "El enlace no es válido." };
  }
  try {
    const db = adminDb();
    await db.collection("users").doc(uid).set(
      { lemonAffiliateLink: link, affiliate: { updatedAt: new Date().toISOString() } },
      { merge: true }
    );
    return { success: true, message: "Enlace de afiliado guardado." };
  } catch (e: any) {
    return { success: false, message: e?.message || "No se pudo guardar el enlace." };
  }
}

/**
 * Persiste la solicitud del vendedor y marca estado 'pending'.
 */
export async function submitAffiliateRequest(
  uid: string,
  data: {
    email: string;
    firstName: string;
    lastName: string;
    idNumber: string;
    phone: string;
    country: string;
    motivation: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const db = adminDb();
    await db.collection("users").doc(uid).set(
      {
        affiliate: {
          status: "pending" as VendorStatus,
          submitted: { ...data, at: new Date().toISOString() },
          updatedAt: new Date().toISOString(),
        },
      },
      { merge: true }
    );
    return { success: true, message: "Solicitud registrada (pending)." };
  } catch (e: any) {
    return { success: false, message: e?.message || "No se pudo registrar la solicitud." };
  }
}

/* 🔻 Eliminado: tipos y función de 'registerCorporateSale' */
