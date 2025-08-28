export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { deleteVendor } from '@/lib/actions/vendors';
export async function POST(req: Request) {
  try { const { vendorId } = await req.json(); if (!vendorId) return NextResponse.json({ ok:false, error:"vendorId requerido" }, { status:400 });
    await deleteVendor({ vendorId }); return NextResponse.json({ ok:true });
  } catch (e:any) { return NextResponse.json({ ok:false, error:e?.message||String(e) }, { status:500 }); }
}
