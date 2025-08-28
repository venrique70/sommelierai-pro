// src/app/api/health/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getApps } from "firebase-admin/app";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    // Tocar Firestore para confirmar que inicializa
    const db = adminDb();

    // Detectar projectId de forma segura
    let projectId =
      process.env.FIREBASE_PROJECT_ID ||
      (() => {
        try {
          const svc = process.env.FIREBASE_SERVICE_ACCOUNT
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : null;
          return svc?.project_id || null;
        } catch {
          return null;
        }
      })() ||
      (getApps()[0]?.options as any)?.projectId ||
      "unknown";

    return NextResponse.json({
      ok: true,
      env: {
        GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
        GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
        FIREBASE_SERVICE_ACCOUNT: !!process.env.FIREBASE_SERVICE_ACCOUNT,
      },
      projectId,
      runtime: "nodejs",
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}
