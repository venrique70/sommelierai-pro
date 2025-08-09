// src/app/api/gemini/route.ts
import { NextRequest, NextResponse } from 'next/server';

const MODEL_DEFAULT = process.env.GEMINI_MODEL ?? 'gemini-1.5-pro';

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = MODEL_DEFAULT } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Falta el prompt' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Missing GEMINI_API_KEY on server' },
        { status: 500 }
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ]
      }),
      // Evita cache en Vercel si quieres respuestas frescas
      cache: 'no-store',
    });

    const json = await r.json();

    if (!r.ok) {
      // Devuelve el mensaje de Google para debug (quitar en prod si quieres)
      return NextResponse.json(
        { error: 'Gemini error', details: json },
        { status: r.status }
      );
    }

    // Extraer el texto
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
