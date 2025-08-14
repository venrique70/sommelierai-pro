import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { uid } = (await req.json()) as { uid?: string };
    if (!uid) return NextResponse.json({ error: "missing uid" }, { status: 400 });

    const snap = await adminDb()
      .collection("analyses")
      .where("uid", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const analyses = snap.docs.map((d) => {
      const x = d.data() as any;
      return {
        id: d.id,
        wineName: x.wineName ?? x.name ?? "Producto",
        year: x.year,
        grapeVariety: x.grapeVariety,
        imageUrl: x.imageUrl,
        createdAt: x.createdAt ?? x.timestamp ?? Date.now(),
      };
    });

    return NextResponse.json({ analyses });
  } catch (e) {
    // 🔸 Parche temporal: no rompas la UI si la credencial falla
    console.error("history api error:", e);
    return NextResponse.json({ analyses: [] }); // ← sin `error`
  }
}
