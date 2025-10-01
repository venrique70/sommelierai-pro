// src/app/api/gemini/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL_DEFAULT = 'gemini-1.5-pro';

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

// Mapea cualquier variante a los IDs válidos del endpoint v1
function normalizeModel(m?: string) {
  const x = (m || '').toLowerCase();
  if (x.includes('flash')) return 'gemini-1.5-flash';
  return 'gemini-1.5-pro';
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, model } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Falta el prompt' }, { status: 400 });
    }
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Falta GEMINI_API_KEY (o NEXT_PUBLIC_GEMINI_API_KEY)' },
        { status: 500 }
      );
    }

    const resolved = normalizeModel(model) || MODEL_DEFAULT;
    const url = `https://generativelanguage.googleapis.com/v1/models/${resolved}:generateContent?key=${GEMINI_API_KEY}`;

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
      cache: 'no-store',
    });

    const json = await r.json();
    if (!r.ok) return NextResponse.json({ error: 'Gemini error', details: json }, { status: r.status });

    const text =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ??
      json?.candidates?.[0]?.output_text ??
      '';

    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error inesperado en IA' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
