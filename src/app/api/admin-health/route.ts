export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const db = adminDb();
    const ts = Date.now();
    await db.collection("_ping").doc("_last").set({ ts, hits: FieldValue.increment(1) }, { merge:true });
    return NextResponse.json({ ok:true, ts });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: String(e?.message||e) }, { status:500 });
  }
}