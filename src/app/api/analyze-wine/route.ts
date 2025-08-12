import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

import { analyzeWineFlow } from '@/ai/analyze-wine-internal';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // body debe cumplir tu WineAnalysisClientSchema (wineName, grapeVariety, year, etc.)
    const result = await analyzeWineFlow(body);
    return NextResponse.json({ ok: true, data: result });
  } catch (err: any) {
    console.error('API /api/analyze-wine error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
