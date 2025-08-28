export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { updateCorporateAccount } from "@/lib/actions/corporate";
export async function POST(req: Request) {
  try { const { accountId, patch } = await req.json(); await updateCorporateAccount({ accountId, patch });
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 }); }
}
