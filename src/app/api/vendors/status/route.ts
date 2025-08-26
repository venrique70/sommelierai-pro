export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { updateVendorStatus } from '@/lib/actions/vendors';
export async function POST(req: Request) {
  try { const { vendorId, status } = await req.json(); await updateVendorStatus({ vendorId, status });
    return NextResponse.json({ ok:true });
  } catch (e:any) { return NextResponse.json({ ok:false, error:e?.message||String(e) }, { status:500 }); }
}
