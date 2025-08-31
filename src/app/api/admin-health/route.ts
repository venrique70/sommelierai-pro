// src/app/api/admin-health/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getApps } from "firebase-admin/app";
import { adminDb, getFirebaseAdminApp } from "@/lib/firebase-admin";

function readEnvInfo() {
  const raw =
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.FIREBASE_ADMIN_CREDENTIALS ||
    process.env.FIREBASE_ADMIN_JSON ||
    "";
  const present = !!raw;
  let parsed: any = null;
  try {
    if (present) {
      const jsonStr = raw.trim().startsWith("{")
        ? raw.trim()
        : Buffer.from(raw.trim(), "base64").toString("utf8");
      parsed = JSON.parse(jsonStr);
    }
  } catch {
    parsed = { parseError: true };
  }
  const projectId = parsed?.project_id || parsed?.projectId || null;
  const clientEmail = parsed?.client_email || parsed?.clientEmail || null;
  const emailDomain = clientEmail?.split("@")[1] || null;
  return { present, projectId, emailDomain, parseError: parsed?.parseError === true };
}

export async function GET() {
  const env = readEnvInfo();
  try {
    // Fuerza init del Admin SDK (lazy)
    const app = getFirebaseAdminApp();
    const apps = getApps().length;

    // Lecturas simples para validar Firestore
    const v = await adminDb().collection("vendors").limit(1).get();
    const r = await adminDb().collection("vendor_requests").limit(1).get();

    return NextResponse.json(
      { ok: true, apps, env, vendorsHint: v.size, requestsHint: r.size },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, env, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
