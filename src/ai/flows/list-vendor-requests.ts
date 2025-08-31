// src/ai/flows/list-vendor-requests.ts
// @ts-nocheck
"use server";

import { adminDb } from "@/lib/firebase-admin";

export type VendorRequest = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  docId?: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
  reason?: string | null;
};

const COL_REQ = "vendor_requests"; // <- tu colección en Firestore

export async function listVendorRequests(
  params?: { status?: "pending" | "approved" | "rejected" }
): Promise<VendorRequest[]> {
  const db = adminDb();
  let q: FirebaseFirestore.Query = db.collection(COL_REQ);

  if (params?.status) {
    q = q.where("status", "==", params.status);
    const snap = await q.get();
    const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as VendorRequest[];
    rows.sort((a,b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")));
    return rows;
  }

  const snap = await q.orderBy("createdAt", "desc").get();
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as VendorRequest[];
}
