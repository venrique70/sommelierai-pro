export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { approveVendorRequest } from '@/lib/actions/vendors';
export async function POST(req: Request) {
  try { const { requestId } = await req.json(); await approveVendorRequest({ requestId });
    return NextResponse.json({ ok:true });
  } catch (e:any) { return NextResponse.json({ ok:false, error:e?.message||String(e) }, { status:500 }); }
}
