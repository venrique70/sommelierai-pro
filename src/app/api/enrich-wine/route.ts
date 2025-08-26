export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { enrichWineDetails } from "@/lib/services/sommelier";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const out = await enrichWineDetails(body);
    return NextResponse.json(out);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}