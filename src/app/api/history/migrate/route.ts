export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();
    if (!uid) return NextResponse.json({ ok:false, error:"uid required" }, { status:400 });

    const db = adminDb();
    const [s1, s2] = await Promise.all([
      db.collection("wineAnalyses").where("uid","==",uid).get(),
      db.collection("wineAnalyses").where("userId","==",uid).get(),
    ]);

    const seen = new Set<string>();
    let moved = 0;

    for (const d of [...s1.docs, ...s2.docs]) {
      if (seen.has(d.id)) continue; seen.add(d.id);
      const a: any = d.data();
      await db.collection("history").add({
        uid: a.uid ?? a.userId ?? uid,
        wineName: a.wineName ?? null,
        year: a.year ?? null,
        imageUrl: a?.analysis?.visual?.imageUrl ?? a?.imageUrl ?? null,
        createdAt: a.createdAt ?? FieldValue.serverTimestamp(),
        analysis: a.analysis ?? null,
        notes: a.notes ?? "",
        pairingRating: a.pairingRating ?? null,
        pairingNotes: a.pairingNotes ?? null,
        country: a.country ?? null,
        wineryName: a.wineryName ?? null,
        _migratedFrom: "wineAnalyses",
        _sourceId: d.id,
      });
      moved++;
    }

    return NextResponse.json({ ok:true, moved });
  } catch (e: any) {
    return NextResponse.json({ ok:false, error:e?.message ?? "unknown" }, { status:500 });
  }
}
