import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { adminDb, getFirebaseAdminApp } from "@/lib/firebase-admin";

export async function GET() {
  try {
    getFirebaseAdminApp();
    await adminDb().listCollections();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
