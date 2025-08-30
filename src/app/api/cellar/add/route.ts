export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

function slugify(s: any) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "");
}

function inferEstado(name?: string, variety?: string, year?: number) {
  const n = (name ?? "").toLowerCase(), v = (variety ?? "").toLowerCase();
  if (/\b(whisk|ron|gin|tequil|vodka|pisco|mezcal|bourbon|scotch|rum)\b/.test(n+" "+v)) return "Listo para Beber";
  const Y = new Date().getFullYear(); if (!year || year < 1900 || year > Y + 1) return "Listo para Beber";
  const age = Y - year;
  const heavies=/\b(cabernet|malbec|nebbiolo|barolo|syrah|shiraz|tempranillo|bordeaux|tannat|sagrantino|mourv|petit verdot)\b/;
  const mediums=/\b(pinot noir|merlot|sangiovese|chianti|grenache|garnacha|carmenere|monastrell)\b/;
  const whites=/\b(sauvignon|chardonnay|riesling|albari|verdejo|viognier|chenin|godello|pinot gris|pinot grigio)\b/;
  const roseSpk=/\b(ros[ée]|rosado|sparkling|champagne|cava|prosecco|espumante)\b/;
  let start=1,end=3;
  if (roseSpk.test(n+" "+v)) { start=0; end=2; } else if (whites.test(n+" "+v)) { start=1; end=3; }
  else if (mediums.test(n+" "+v)) { start=2; end=6; } else if (heavies.test(n+" "+v)) { start=4; end=12; }
  if (age < start) return "Necesita Guarda";
  if (age <= end) return "En su punto";
  return "Listo para Beber";
}

export async function POST(req: Request) {
  try {
    const { uid, name, year, variety, docId } = await req.json();

    if (!uid)  return NextResponse.json({ error: "uid requerido"  }, { status: 400 });
    if (!name && !docId) return NextResponse.json({ error: "name o docId requerido" }, { status: 400 });

    const db = adminDb();

    // Si viene docId, intentamos leerlo desde colecciones conocidas
    let finalName = name as string | undefined;
    let finalYear = (typeof year === "number" ? year : null) as number | null;
    let finalVar  = (variety ?? "") as string;

    if (docId && !finalName) {
      const tries = [
        db.collection("wineAnalyses").doc(docId),
        db.collection("history").doc(docId),
        db.collection("users").doc(uid).collection("history").doc(docId),
      ];
      for (const ref of tries) {
        const snap = await ref.get();
        if (!snap.exists) continue;
        const x: any = snap.data();
        finalName = x?.wineName ?? x?.name ?? x?.analysis?.wineName ?? x?.analysis?.wine?.name ?? finalName;
        finalYear = (typeof x?.year === "number" ? x.year : (typeof x?.vintage === "number" ? x.vintage : finalYear));
        finalVar  = x?.grapeVariety ?? x?.analysis?.grapeVariety ?? x?.analysis?.wine?.variety ?? finalVar;
        if (finalName) break;
      }
    }

    if (!finalName) return NextResponse.json({ error: "No se pudo resolver el nombre" }, { status: 400 });

    const key = `${slugify(finalName)}__${finalYear ?? ""}`;
    await db.doc(`cellars/${uid}/wines/${key}`).set({
      name: finalName,
      variety: finalVar ?? "",
      year: finalYear ?? null,
      quantity: 1,
      status: inferEstado(finalName, finalVar, finalYear ?? undefined),
      createdAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({ ok: true, id: key });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
