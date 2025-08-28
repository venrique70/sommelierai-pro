export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";

const ADMIN_EMAIL = "venrique70@gmail.com";

export async function POST(req: Request) {
  try {
    const { uid, email } = await req.json();
    if (!uid) {
      return NextResponse.json({ ok: false, error: "uid required" }, { status: 400 });
    }
    const ref = adminDb().collection("users").doc(uid);
    await ref.set(
      {
        uid,
        email: email ?? "",
        role: email === ADMIN_EMAIL ? "admin" : "user",
        unlimited: email === ADMIN_EMAIL,
        createdAt: FieldValue.serverTimestamp(),
        usage: {
          analyzeWine: { current: 0 },
          recommendWine: { current: 0 },
          pairDinner: { current: 0 },
        },
      },
      { merge: true }
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "unknown" }, { status: 500 });
  }
}
