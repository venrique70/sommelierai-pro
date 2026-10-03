import { requireUser, authErrorResponse } from "@/lib/server-auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { enrichWineDetails } from "@/lib/services/sommelier";

async function POST_handler(req: Request) {
  try {
    const body = await req.json();
    const out = await enrichWineDetails(body);
    return NextResponse.json(out);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(...args: Parameters<typeof POST_handler>) {
  try {
    await requireUser(args[0] as Request);
  } catch (e) {
    const r = authErrorResponse(e);
    if (r) return r;
    throw e;
  }
  return POST_handler(...args);
}
