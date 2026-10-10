export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { requireUser, authErrorResponse } from "@/lib/server-auth";

/**
 * Crea el perfil del usuario si no existe. La identidad (uid/email) sale del token de
 * sesión verificado, nunca del cuerpo de la petición: así nadie puede hacerse admin
 * enviando el correo del dueño. Si el perfil ya existe no se tocan sus contadores.
 */
export async function POST(req: Request) {
  try {
    const session = await requireUser(req);
    const ref = adminDb().collection("users").doc(session.uid);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        uid: session.uid,
        email: session.email ?? "",
        role: session.isAdmin ? "admin" : "user",
        unlimited: session.isAdmin,
        createdAt: FieldValue.serverTimestamp(),
        usage: {
          analyzeWine: { current: 0 },
          recommendWine: { current: 0 },
          pairDinner: { current: 0 },
        },
      });
    } else if (session.isAdmin) {
      await ref.set({ role: "admin", unlimited: true }, { merge: true });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const ar = authErrorResponse(e);
    if (ar) return ar;
    return NextResponse.json({ ok: false, error: e?.message ?? "unknown" }, { status: 500 });
  }
}
