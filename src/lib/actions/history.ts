"use server";

import { adminDb, FieldValue } from "@/lib/firebase-admin";

/** Guarda un análisis en la colección raíz 'history' (Admin SDK, no le afectan reglas) */
export async function saveAnalysisToHistory(uid: string, a: any) {
  if (!uid) throw new Error("uid requerido");

  await adminDb().collection("history").add({
    uid,
    // campos mínimos para la tarjeta
    wineName: a?.wineName ?? a?.analysis?.wineName ?? null,
    year: a?.year ?? a?.analysis?.year ?? null,
    imageUrl: a?.analysis?.visual?.imageUrl ?? a?.imageUrl ?? null,
    createdAt: FieldValue.serverTimestamp(),

    // payload completo para el detalle
    analysis: a?.analysis ?? null,

    // opcionales (déjalos si tu UI los usa)
    notes: a?.notes ?? "",
    pairingRating: a?.pairingRating ?? null,
    pairingNotes: a?.pairingNotes ?? null,
    country: a?.country ?? null,
    wineryName: a?.wineryName ?? null,
  });
}
