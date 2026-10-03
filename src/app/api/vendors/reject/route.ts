import { requireAdmin, authErrorResponse } from "@/lib/server-auth";
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { rejectVendorRequest } from '@/lib/actions/vendors';
async function POST_handler(req: Request) {
  try { const { requestId, reason } = await req.json(); await rejectVendorRequest({ requestId, reason });
    return NextResponse.json({ ok:true });
  } catch (e:any) { return NextResponse.json({ ok:false, error:e?.message||String(e) }, { status:500 }); }
}

export async function POST(...args: Parameters<typeof POST_handler>) {
  try {
    await requireAdmin(args[0] as Request);
  } catch (e) {
    const r = authErrorResponse(e);
    if (r) return r;
    throw e;
  }
  return POST_handler(...args);
}
