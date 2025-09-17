// app/api/analyze-wine/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { z } from "zod";
import { WineAnalysisClientSchema } from "@/lib/schemas";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { analyzeWineFlow } from "@/ai/flows/analyze-wine";

function j(res: any, status = 200) {
  return NextResponse.json(res, { status });
}

async function saveHistory(uid: string, out: any) {
  try {
    const db = adminDb();
    const docToSave = {
      uid,
      userId: uid,
      wineName: out?.wineName ?? "Desconocido",
      year: out?.year ?? null,
      imageUrl: out?.analysis?.visual?.imageUrl ?? out?.imageUrl ?? null,
      analysis: out?.analysis ?? null,
      notaDelSommelier: out?.notaDelSommelier ?? out?.sommelierNote ?? out?.notes ?? null,
      servicio: out?.servicio ?? out?.service ?? null,
      pairings: Array.isArray(out?.pairings) ? out.pairings : [],
      country: out?.country ?? null,
      grapeVariety: out?.grapeVariety ?? out?.analysis?.grapeVariety ?? null,
      createdAt: FieldValue.serverTimestamp(),
    };

    console.log("[saveHistory] Guardando en Firestore:", {
      uid: docToSave.uid, wineName: docToSave.wineName, year: docToSave.year,
    });

    const ref = await db.collection("history").add(docToSave);
    console.log("[saveHistory] Documento creado con ID:", ref.id);
    return ref.id;
  } catch (err) {
    console.error("[saveHistory] ERROR guardando historial:", err);
    return null;
  }
}

async function bumpUsageIfNotAdmin(uid: string) {
  try {
    const db = adminDb();
    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();
    const data = snap.exists ? (snap.data() || {}) : {};
    const isAdmin = data?.role === "admin" || data?.username === "venrique70";
    if (isAdmin) return;
    await ref.set(
      { usage: { analyzeWine: { current: FieldValue.increment(1) } } },
      { merge: true }
    );
  } catch (err) {
    console.error("[bumpUsageIfNotAdmin] failed:", err);
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const input = WineAnalysisClientSchema.parse(json);

    if (!input?.uid) {
      return j({ ok: false, error: "Debes iniciar sesión para analizar un producto" }, 401);
    }

    const aiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!aiKey) {
      console.error("[analyze-wine] Missing GEMINI_API_KEY/GOOGLE_API_KEY");
      return j({ ok: false, error: "Falta configuración del modelo de IA" }, 500);
    }

    // Ejecutar flujo IA (ahora con verified)
    let result: any;
    try {
      result = await analyzeWineFlow(input);
    } catch (err) {
      console.error("[analyzeWineFlow] error:", err);
      return j({ ok: false, error: "No se pudo completar el análisis con IA" }, 500);
    }

    // Normalización mínima para UI actual (conservar campos que usas)
    const out = {
      ok: true,
      result, // 👈 devolvemos todo el objeto (incluye verified)
      wineName: result?.wineName ?? input.wineName ?? "Desconocido",
      year: result?.year ?? input.year ?? null,
      country: result?.country ?? input.country ?? null,
      grapeVariety: result?.grapeVariety ?? input.grapeVariety ?? result?.analysis?.grapeVariety ?? null,
      analysis: result?.analysis ?? null,
      notaDelSommelier: result?.notaDelSommelier ?? result?.sommelierNote ?? result?.notes ?? null,
      imageUrl: result?.analysis?.visual?.imageUrl ?? result?.imageUrl ?? null,
    };

    // Guardar en history SOLO si está verificado y hay analysis (evita ensuciar historial)
    let savedId: string | null = null;
    if (result?.verified === true && out.analysis) {
      savedId = await saveHistory(input.uid, out);
    }

    void bumpUsageIfNotAdmin(input.uid);
    return j({ ...out, savedId }, 200);

  } catch (e: any) {
    if (e instanceof z.ZodError) {
      console.error("[analyze-wine] ZodError:", e.issues);
      return j({ ok: false, error: "Entrada inválida", issues: e.issues }, 400);
    }
    console.error("[analyze-wine] Uncaught:", e?.stack || e?.message || e);
    return j({ ok: false, error: "Error inesperado en el servidor" }, 500);
  }
}
