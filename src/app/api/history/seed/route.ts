export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";

export async function POST() {
  const ref = await adminDb().collection("history").add({
    userId: "demo_uid",
    wineName: "Catena Chardonnay",
    year: 2021,
    imageUrl: "https://picsum.photos/seed/wine/640/360",
    analysis: {
      visual:   { color: "Amarillo pajizo", limpidez: "Brillante", lagrimas: "Medias" },
      olfativo: { intensidad: "Media+", notas: ["cítricos", "manzana", "florales"] },
      gustativo:{ acidez: "Media+", alcohol: "Medio", cuerpo: "Medio", final: "Medio+" },
      serving:  { temperatura: "8–10°C", copa: "Blanco", decantar: false }
    },
    pairing: { recomendados: ["Ostras", "Ceviche"] },
    createdAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ ok: true, id: ref.id });
}
