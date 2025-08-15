import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { uid, wineName, year, country, grapeVariety } = await req.json();

    if (!uid || !wineName?.trim()) {
      return NextResponse.json({ ok: false, error: "missing uid or wineName" }, { status: 400 });
    }

    const doc = {
      uid,
      wineName: String(wineName).trim(),
      year: year ?? null,
      country: country ?? null,
      grapeVariety: grapeVariety ?? null,
      addedAt: new Date(),
    };

    const ref = await adminDb().collection("cellar").add(doc);
    return NextResponse.json({ ok: true, id: ref.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}