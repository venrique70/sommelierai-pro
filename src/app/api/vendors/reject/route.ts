export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { rejectVendorRequest } from '@/lib/actions/vendors';
export async function POST(req: Request) {
  try { const { requestId, reason } = await req.json(); await rejectVendorRequest({ requestId, reason });
    return NextResponse.json({ ok:true });
  } catch (e:any) { return NextResponse.json({ ok:false, error:e?.message||String(e) }, { status:500 }); }
}
