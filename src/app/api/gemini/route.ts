// src/app/api/gemini/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // explícito en App Router

const MODEL_DEFAULT =
  process.env.GEMINI_MODEL ||
  process.env.NEXT_PUBLIC_GEMINI_MODEL ||
  'gemini-1.5-pro';

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = MODEL_DEFAULT } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Falta el prompt' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Falta GEMINI_API_KEY (o NEXT_PUBLIC_GEMINI_API_KEY)' },
        { status: 500 }
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
      cache: 'no-store',
    });

    const json = await r.json();

    if (!r.ok) {
      // Devuelve detalle de Google para debug
      return NextResponse.json({ error: 'Gemini error', details: json }, { status: r.status });
    }

    // Extrae el texto (cubriendo varias formas de respuesta)
    const text =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ??
      json?.candidates?.[0]?.output_text ??
      '';

    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Error inesperado en IA' },
      { status: 500 }
    );
  }
}
