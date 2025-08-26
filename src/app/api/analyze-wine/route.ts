// app/api/analyze-wine/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { z } from "zod";
import { WineAnalysisClientSchema } from "@/lib/schemas";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { analyzeWineFlow } from "@/ai/flows/analyze-wine";

// Helper para respuesta JSON estándar
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
      imageUrl: out?.imageUrl ?? null,
      analysis: out?.analysis ?? null,
      notaDelSommelier: out?.notaDelSommelier ?? null,
      servicio: out?.servicio ?? null,
      pairings: out?.pairings ?? [],
      country: out?.country ?? null,
      grapeVariety: out?.grapeVariety ?? null,
      createdAt: FieldValue.serverTimestamp(),
    };

    console.log("[saveHistory] Guardando en Firestore:", {
      uid: docToSave.uid,
      wineName: docToSave.wineName,
      year: docToSave.year,
    });

    const ref = await db.collection("history").add(docToSave);

    console.log("[saveHistory] Documento creado con ID:", ref.id);
    return ref.id;
  } catch (err) {
    console.error("[saveHistory] ERROR guardando historial:", err);
    // No lanzamos error para no bloquear la respuesta al cliente
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
    // 1) Parseo/validación de entrada
    const json = await req.json().catch(() => ({}));
    const input = WineAnalysisClientSchema.parse(json);

    if (!input?.uid) {
      return j({ ok: false, error: "Debes iniciar sesión para analizar un producto" }, 401);
    }

    // 2) Guardas de configuración (acepta GEMINI_API_KEY o GOOGLE_API_KEY)
    const aiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!aiKey) {
      console.error("[analyze-wine] Missing GEMINI_API_KEY/GOOGLE_API_KEY");
      return j({ ok: false, error: "Falta configuración del modelo de IA" }, 500);
    }

    // 3) Llamado al flujo de IA con try/catch propio
    let aiRes: any;
    try {
      aiRes = await analyzeWineFlow(input);
    } catch (err) {
      console.error("[analyzeWineFlow] error:", err);
      return j({ ok: false, error: "No se pudo completar el análisis con IA" }, 500);
    }

    // 4) Normalización de salida (defensive)
    const out = {
      ok: true,
      id: aiRes?.id ?? undefined,
      wineName: aiRes?.wineName ?? input.wineName ?? "Desconocido",
      year: aiRes?.year ?? input.year ?? null,
      country: aiRes?.country ?? input.country ?? null,
      grapeVariety: aiRes?.grapeVariety ?? input.grapeVariety ?? null,
      analysis:
        aiRes?.analysis ?? {
          visual: aiRes?.visual ?? {},
          olfativa: aiRes?.olfativa ?? {},
          gustativa: aiRes?.gustativa ?? {},
        },
      notaDelSommelier: aiRes?.notaDelSommelier ?? aiRes?.sommelierNote ?? null,
      servicio: aiRes?.servicio ?? aiRes?.service ?? null,
      pairings: Array.isArray(aiRes?.pairings) ? aiRes.pairings : [],
      imageUrl: aiRes?.analysis?.visual?.imageUrl ?? aiRes?.imageUrl ?? null,
    };

    // 5) Efectos secundarios no bloqueantes (con logs)
    await Promise.allSettled([
      (async () => {
        const savedId = await saveHistory(input.uid, out);
        if (!savedId) console.warn("[saveHistory] no devolvió ID (revisar logs previos)");
      })(),
      bumpUsageIfNotAdmin(input.uid),
    ]);

    return j(out, 200);
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      console.error("[analyze-wine] ZodError:", e.issues);
      return j({ ok: false, error: "Entrada inválida", issues: e.issues }, 400);
    }
    console.error("[analyze-wine] Uncaught:", e?.stack || e?.message || e);
    // Mensaje neutro para no filtrar detalles en prod
    return j({ ok: false, error: "Error inesperado en el servidor" }, 500);
  }
}
