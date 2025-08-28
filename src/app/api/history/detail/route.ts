export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

function toISO(ts: any) {
  // @ts-ignore
  if (ts?.toDate) return ts.toDate().toISOString();
  if (ts instanceof Date) return ts.toISOString();
  if (typeof ts === "string") return ts;
  return new Date().toISOString();
}

function normalize(x: any) {
  const a = x?.analysis ?? {};
  return {
    wineName: x?.wineName ?? "Análisis",
    year: x?.year ?? null,
    country: x?.country ?? null,
    grapeVariety: a?.grapeVariety ?? x?.grapeVariety ?? null,
    notaDelSommelier: x?.notaDelSommelier ?? null,
    servicio: x?.servicio ?? null,
    createdAt: toISO(x?.createdAt),
    analysis: {
      wineType: a?.wineType ?? null,
      body: a?.body ?? null,
      appellation: a?.appellation ?? null,
      qualityLevel: a?.qualityLevel ?? null,
      qualityRating: typeof a?.qualityRating === "number" ? a.qualityRating : null,
      targetAudience: a?.targetAudience ?? null,
      barrelInfo: a?.barrelInfo ?? null,
      servingTemperature: a?.servingTemperature ?? null,
      decanterRecommendation: a?.decanterRecommendation ?? null,
      agingPotential: a?.agingPotential ?? null,
      tanninLevel: a?.tanninLevel ?? null,
      relevantCulturalOrRegionalNotes: a?.relevantCulturalOrRegionalNotes ?? null,
      awards: a?.awards ?? null,
      world50BestRestaurants: a?.world50BestRestaurants ?? null,
      visual: { description: a?.visual?.description ?? null },
      olfativa: { description: a?.olfativa?.description ?? a?.olfactory?.description ?? null },
      gustativa: { description: a?.gustativa?.description ?? a?.gustatory?.description ?? null },
      recommendedPairings: a?.recommendedPairings ?? x?.recommendedPairings ?? null,
      avoidPairings: a?.avoidPairings ?? x?.avoidPairings ?? null,
    }
  };
}

export async function POST(req: Request) {
  try {
    const { uid, id } = await req.json();
    if (!uid || !id) return NextResponse.json({ error: "uid e id requeridos" }, { status: 400 });

    const db = adminDb();
    // Busca primero en /users/{uid}/history (nueva subcolección)
    let doc = await db.collection("users").doc(uid).collection("history").doc(id).get();
    if (doc.exists) {
      const x: any = doc.data();
      return NextResponse.json({ item: { id, ...normalize(x) } });
    }
    // Luego en /history (compatibilidad)
    doc = await db.collection("history").doc(id).get();
    if (doc.exists) {
      const x: any = doc.data();
      if (x?.userId && x.userId !== uid && x?.uid !== uid) return NextResponse.json({ error: "forbidden" }, { status: 403 });
      return NextResponse.json({ item: { id, ...normalize(x) } });
    }
    // Luego en /wineAnalyses (compat)
    doc = await db.collection("wineAnalyses").doc(id).get();
    if (doc.exists) {
      const x: any = doc.data();
      if (x?.userId && x.userId !== uid && x?.uid !== uid) return NextResponse.json({ error: "forbidden" }, { status: 403 });
      return NextResponse.json({ item: { id, ...normalize(x) } });
    }

    return NextResponse.json({ error: "not_found" }, { status: 404 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}