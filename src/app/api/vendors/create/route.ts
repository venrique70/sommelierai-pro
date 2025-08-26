export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { createVendor } from '@/lib/actions/vendors';
export async function POST(req: Request) {
  try { const data = await req.json(); const saved = await createVendor(data);
    return NextResponse.json({ ok: true, saved });
  } catch (e:any) { return NextResponse.json({ ok:false, error:e?.message||String(e) }, { status:500 }); }
}
