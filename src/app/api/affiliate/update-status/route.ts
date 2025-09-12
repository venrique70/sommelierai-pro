import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { email, status } = await req.json() as { email?: string; status?: "approved"|"pending"|"rejected" };
    if (!email || !status) {
      return NextResponse.json({ success: false, message: "Missing email/status" }, { status: 400 });
    }

    const db = adminDb();
    const snap = await db.collection("users").where("email", "==", email).limit(1).get();
    if (snap.empty) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 });
    }

    await snap.docs[0].ref.set(
      { affiliate: { status, updatedAt: new Date().toISOString() } },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || "Unexpected error" }, { status: 500 });
  }
}
