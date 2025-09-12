"use server";

/**
 * Tipos públicos que consume page.tsx
 */
export type VendorLevel = "Nuevo" | "Pregrado" | "Bachelor" | "Pro" | "Master";

export type VendorSale = {
  id: string;
  createdAt: string;              // ISO string
  plan: string;                   // 'Una Copa' | 'Copa Premium' | 'Sibarita' | etc.
  seats: number;                  // nº de licencias
  status: "paid" | "pending" | "refunded" | string;
  estimatedCommission: number;    // USD
};

export type VendorMetrics = {
  level: VendorLevel;
  activeReferrals: number;
  pendingCommission: number;      // USD
  nextPayoutDate: string;         // ISO o '—'
  lemonAffiliateLink?: string;    // enlace pegado por el vendedor
  recentSales: VendorSale[];
};

/**
 * getVendorMetrics
 * (por ahora sin BD) → devolvemos 0 / '—' para no confundir con ejemplos.
 * Luego conectamos a Firestore / Lemon.
 */
export async function getVendorMetrics(uid: string): Promise<VendorMetrics> {
  return {
    level: "Nuevo",
    activeReferrals: 0,
    pendingCommission: 0,
    nextPayoutDate: "—",
    lemonAffiliateLink: "",
    recentSales: [],
  };
}

/**
 * requestVendorApproval
 * (no usado en el flujo actual; las solicitudes se envían por /api/affiliate/request)
 */
export async function requestVendorApproval(uid: string): Promise<{ success: boolean; message: string }> {
  return { success: true, message: "Tu solicitud fue recibida. Un admin la revisará." };
}

/**
 * saveAffiliateLink
 * Guardará el enlace de Lemon del vendedor (mock ahora).
 */
export async function saveAffiliateLink(uid: string, link: string): Promise<{ success: boolean; message: string }> {
  if (!link.startsWith("http")) {
    return { success: false, message: "El enlace no es válido." };
  }
  // TODO: update en Firestore: users/{uid}.lemonAffiliateLink = link
  return { success: true, message: "Enlace de afiliado guardado." };
}

/**
 * registerCorporateSale
 * Registrar venta corporativa (mock ahora).
 */
type CorporateSaleInput = {
  vendedorUid: string;
  accessCode: string;                 // código de la empresa
  plan: "Copa Premium" | "Sibarita";
  subscriptions: number;              // nº de licencias
  billingCycle: "monthly" | "yearly";
};

export async function registerCorporateSale(
  input: CorporateSaleInput
): Promise<{ success: boolean; message: string }> {
  if (!input.vendedorUid) return { success: false, message: "Falta vendedor." };
  if (!input.accessCode) return { success: false, message: "Falta código de acceso." };
  if (input.subscriptions < 1) return { success: false, message: "Suscripciones inválidas." };

  // TODO: persistir venta y calcular comisión real
  return { success: true, message: "Venta corporativa registrada." };
}
