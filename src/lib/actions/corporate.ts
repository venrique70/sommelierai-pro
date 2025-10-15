import { adminDb } from "@/lib/firebase-admin";

export type CorporatePlan = "Starter" | "Premium" | "Pro";
export type CorporateStatus = "active" | "suspended";

export type CorporateAccount = {
  id: string;
  companyName: string;
  taxId?: string;
  contactEmail: string;
  plan: CorporatePlan;
  seats: number;
  status: CorporateStatus;
  createdAt: string;
  updatedAt?: string;
};

export type CorporateInvite = {
  id: string;
  accountId: string;
  email: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "expired";
  sentAt: string;
  acceptedAt?: string;
};

const COL = "corporate_accounts";
const COL_INV = "corporate_invites";

export async function getCorporateAccounts(): Promise<CorporateAccount[]> {
  const snap = await adminDb().collection(COL).orderBy("createdAt","desc").get();
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function createCorporateAccount(data: Partial<CorporateAccount>): Promise<CorporateAccount> {
  const payload = {
    companyName: data.companyName!, taxId: data.taxId ?? null, contactEmail: data.contactEmail!,
    plan: (data.plan ?? "Starter") as CorporatePlan, seats: Number(data.seats ?? 1),
    status: (data.status ?? "active") as CorporateStatus,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  const ref = await adminDb().collection(COL).add(payload);
  return { id: ref.id, ...(payload as any) };
}

export async function updateCorporateAccount(arg: { accountId: string; patch: Partial<CorporateAccount> }) {
  const patch = { ...arg.patch, updatedAt: new Date().toISOString() } as any;
  await adminDb().collection(COL).doc(arg.accountId).update(patch);
}

export async function listCorporateInvites(): Promise<CorporateInvite[]> {
  const snap = await adminDb().collection(COL_INV).orderBy("sentAt","desc").get();
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function sendCorporateInvite(arg: { accountId: string; email: string; role: "admin" | "member" }) {
  await adminDb().collection(COL_INV).add({
    accountId: arg.accountId, email: arg.email, role: arg.role,
    status: "pending", sentAt: new Date().toISOString(),
  });
}

// Obtener un corporate por id (wrapper con el nombre esperado por admin/corporate/actions.ts)
export async function getCorporateInfo(accountId: string): Promise<CorporateAccount | null> {
  const doc = await adminDb().collection(COL).doc(accountId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as any) } as CorporateAccount;
}

// Crear/solicitar info corporativa (wrapper: usa createCorporateAccount debajo)
export async function requestCorporateInfo(arg: {
  companyName: string;
  contactEmail: string;
  seats?: number;
  plan?: CorporatePlan;
  taxId?: string;
}): Promise<CorporateAccount> {
  return createCorporateAccount({
    companyName: arg.companyName,
    contactEmail: arg.contactEmail,
    seats: arg.seats ?? 1,
    plan: (arg.plan ?? 'Starter') as CorporatePlan,
    taxId: arg.taxId,
    status: 'active',
  });
}
