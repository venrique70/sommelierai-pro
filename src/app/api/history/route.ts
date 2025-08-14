import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 🔒 Parche temporal: NO usa firebase-admin. Devuelve lista vacía sin romper la UI.
export async function POST() {
  return NextResponse.json({ analyses: [] });
}
