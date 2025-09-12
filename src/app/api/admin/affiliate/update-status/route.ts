// src/app/api/admin/affiliate/update-status/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// evita caché en edge/build
export const dynamic = "force-dynamic";

/**
 * Actualiza el estado de afiliado en users/{uid} buscando por email.
 * Body: { email: string, status: "approved"|"pending"|"rejected"|"suspended" }
 */
export async function POST(req: Request) {
  try {
    const { email, status } = (await req.json()) as {
      email?: string;
      status?: "approved" | "pending" | "rejected" | "suspended";
    };

    if (!email || !status) {
      return NextResponse.json(
        { success: false, message: "Missing email/status" },
        { status: 400 }
      );
    }

    const db = adminDb();
    // Busca por email en colección users
    const snap = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const ref = snap.docs[0].ref;

    await ref.set(
      {
        affiliate: {
          status, // "approved" | "pending" | "rejected" | "suspended"
          updatedAt: new Date().toISOString(),
        },
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
