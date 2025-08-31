export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

export async function GET() {
  const raw =
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.FIREBASE_ADMIN_CREDENTIALS ||
    process.env.FIREBASE_ADMIN_JSON ||
    "";
  const present = !!raw;
  let projectId: string | null = null;
  let clientEmail: string | null = null;
  let parseError = false;

  try {
    if (present) {
      const jsonStr = raw.trim().startsWith("{")
        ? raw.trim()
        : Buffer.from(raw.trim(), "base64").toString("utf8");
      const p = JSON.parse(jsonStr);
      projectId = p.project_id || p.projectId || null;
      clientEmail = p.client_email || p.clientEmail || null;
    }
  } catch {
    parseError = true;
  }

  // Por seguridad, solo mostramos el final del correo
  return NextResponse.json({
    ok: true,
    present,
    parseError,
    projectId,
    clientEmailTail: clientEmail ? clientEmail.slice(-20) : null,
  });
}
