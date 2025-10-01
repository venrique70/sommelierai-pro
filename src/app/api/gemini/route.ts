// src/app/api/gemini/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL_DEFAULT =
  process.env.GEMINI_MODEL ||
  process.env.NEXT_PUBLIC_GEMINI_MODEL ||
  'gemini-1.5-pro-002';

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = body?.prompt;
    const model = (body?.model || MODEL_DEFAULT) as string;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Falta el prompt' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Falta GEMINI_API_KEY (o NEXT_PUBLIC_GEMINI_API_KEY)' },
        { status: 500 }
      );
    }

    // v1beta + modelos *-002
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${GEMINI_API_KEY}`;

    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
      cache: 'no-store',
    });

    const json = await r.json().catch(() => ({}));

    if (!r.ok) {
      // Reenviamos el detalle tal cual para depurar rápido (sin exponer la key)
      return NextResponse.json(
        { error: 'Gemini error', status: r.status, model, endpoint, details: json?.error || json },
        { status: r.status }
      );
    }

    const text =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ??
      json?.candidates?.[0]?.output_text ??
      '';

    return NextResponse.json({ text, model });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Error inesperado en IA' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
