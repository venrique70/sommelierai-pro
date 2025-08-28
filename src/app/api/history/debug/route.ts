export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");
  if (!uid) return NextResponse.json({ ok:false, error:"uid required" }, { status:400 });

  const db = adminDb();

  const [h, wUid, wUserId, wNoOwner] = await Promise.all([
    db.collection("history").where("uid","==", uid).get(),
    db.collection("wineAnalyses").where("uid","==", uid).get(),
    db.collection("wineAnalyses").where("userId","==", uid).get(),
    db.collection("wineAnalyses").limit(50).get(), // muestreo
  ]);

  // cuenta docs de wineAnalyses sin uid ni userId (muestra 5 ids)
  const noOwner = wNoOwner.docs
    .filter(d => !d.get("uid") && !d.get("userId"))
    .slice(0,5)
    .map(d => d.id);

  return NextResponse.json({
    ok: true,
    project: process.env.FIREBASE_PROJECT_ID ?? "env:FIREBASE_PROJECT_ID?",
    counts: {
      history_uid: h.size,
      wineAnalyses_uid: wUid.size,
      wineAnalyses_userId: wUserId.size,
      wineAnalyses_noOwner_sample: noOwner,
    },
  });
}
