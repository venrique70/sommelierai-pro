import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
// En Vercel puedes fijar regiones cercanas
// export const preferredRegion = ['iad1','sfo1','gru1','fra1'];

const MODEL_DEFAULT = 'gemini-2.5-pro';

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY; // evita NEXT_PUBLIC_* en server

function normalizeModel(m?: string) {
  const x = (m || '').toLowerCase();
  if (x.includes('flash')) return 'gemini-2.5-flash';
  return 'gemini-2.5-pro';
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, model } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Falta el prompt' }, { status: 400 });
    }
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Falta GEMINI_API_KEY' }, { status: 500 });
    }

    const resolved = normalizeModel(model) || MODEL_DEFAULT;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${resolved}:generateContent`;
    
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY, // <- clave por header
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
      cache: 'no-store',
    });

    const json = await r.json();
    if (!r.ok) {
      return NextResponse.json(
        { error: 'Gemini error', status: r.status, details: json },
        { status: r.status }
      );
    }

    const candidate = json?.candidates?.[0];
    const text =
      candidate?.content?.parts?.map((p: any) => p?.text).join('') ??
      candidate?.output_text ??
      '';

    const finishReason = candidate?.finishReason || candidate?.finish_reason || 'STOP';

    return NextResponse.json({ text, model: resolved, finishReason });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error inesperado en IA' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
