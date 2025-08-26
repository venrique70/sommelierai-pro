export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

function scoreHeuristic(dish: string, wine: string, desc: string) {
  const d = (dish || "").toLowerCase();
  const w = (wine || "").toLowerCase();
  const t = (desc || "").toLowerCase();

  // Reglas explícitas del plan
  if (d.includes("bife") && w.includes("malbec")) {
    return {
      score: 4.5,
      motivo: "La grasa y proteína del bife doman taninos y alcohol del Malbec; fruta madura + toque de madera integran con el umami.",
      cocina: "carnes rojas",
    };
  }
  if (d.includes("ceviche") && w.includes("cabernet")) {
    return {
      score: 1.5,
      motivo: "Ácido/picante del ceviche chocan con taninos marcados y alcohol del Cabernet; amarga y reseca.",
      cocina: "marina/ácida",
    };
  }

  // Heurística general
  let score = 3.0;
  const isSea = /(ceviche|ostra|pescado|marisco|atún|salmón)/.test(d);
  const isAcidOrSpicy = /(ácid|acido|lim[oó]n|lima|vinagre|picante|ají|chile)/.test(d + " " + t);
  const isCreamFat = /(mantequilla|crema|graso|marmoleado|queso|salsa)/.test(d + " " + t);

  const isRedFull = /(cabernet|malbec|syrah|tannat|nebbiolo|tempranillo)/.test(w);
  const isWhiteFresh = /(sauvignon|albariñ|riesling|pinot\s?gris|chablis|verdejo)/.test(w);
  const isSpark = /(champagne|cava|prosecco|espum|brut)/.test(w);

  if (isSea && (isWhiteFresh || isSpark)) score += 1.0;
  if (isSea && isRedFull) score -= 1.0;
  if (isAcidOrSpicy && isRedFull) score -= 1.0;
  if (isCreamFat && isRedFull) score += 0.5;
  if (isCreamFat && isWhiteFresh) score += 0.3;

  score = Math.max(1, Math.min(5, score));
  const motivo =
    score >= 4
      ? "Buen balance técnico: estructura y textura del vino acompañan la grasa/ácido del plato sin dominar."
      : score <= 2
      ? "Conflicto de estructura: tanino/alcohol o acidez/condimento chocan con el plato."
      : "Aceptable: coincidencias parciales de acidez, cuerpo y aromas; podría mejorar con otra elección.";

  return { score, motivo, cocina: undefined as string | undefined };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pairs = Array.isArray(body?.pairings) ? body.pairings : [];

    const out = pairs.map((p: any) => {
      const r = scoreHeuristic(p?.dish, p?.wine, p?.description);
      return {
        plato: p?.dish ?? "Plato",
        motivo: r.motivo,
        score: r.score,
        cocina: r.cocina,
      };
    });

    return NextResponse.json({ pairings: out });
  } catch (e: any) {
    return NextResponse.json({ pairings: [], error: String(e?.message || e) }, { status: 200 });
  }
}