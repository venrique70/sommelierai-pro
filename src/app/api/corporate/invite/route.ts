export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { sendCorporateInvite } from "@/lib/actions/corporate";
export async function POST(req: Request) {
  try { const { accountId, email, role } = await req.json(); await sendCorporateInvite({ accountId, email, role });
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 }); }
}
