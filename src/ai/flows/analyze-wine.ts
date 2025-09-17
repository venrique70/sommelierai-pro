'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { WineAnalysisClientSchema } from '@/lib/schemas';
import type { WineAnalysis } from '@/types'; // si no tienes types.ts, usa: type WineAnalysis = any;
import { adminDb, FieldValue } from '@/lib/firebase-admin';

/** Esquema de salida reforzado: impide inventar bodega/país. */
const AiResponseSchema = z.object({
  verified: z.boolean().describe("true si el vino exacto fue verificado con certeza."),
  isAiGenerated: z.boolean().describe("true SOLO si no se encontró el vino exacto y se analizó uno similar."),
  wineName: z.string().describe("Nombre completo y corregido del vino."),
  year: z.number().describe("Añada específica."),
  country: z.union([z.string().min(1), z.literal('unknown')]).describe("Nunca inventar; si no se verifica, 'unknown'."),
  wineryName: z.union([z.string().min(1), z.literal('unknown')]).describe("Nunca inventar; si no se verifica, 'unknown'."),
  verificationSource: z.string().optional().describe("Fuente breve: URL, referencia o 'user-provided'."),
  notes: z.string().describe("Conclusión experta; si no verificado, explicar qué falta (bodega/país)."),
  corrections: z.array(z.object({
    field: z.enum(['Vino','Año','Cepa','Bodega','País','Wine','Year','Grape','Winery','Country']),
    original: z.string(),
    corrected: z.string(),
  })).optional(),
  pairingRating: z.number().min(1).max(5).optional(),
  pairingNotes: z.string().optional(),
  analysis: z.object({
    grapeVariety: z.string(),
    wineryLocation: z.string().optional(),
    visual: z.object({ description: z.string() }),
    olfactory: z.object({ description: z.string() }),
    gustatory: z.object({ description: z.string() }),
    body: z.string(),
    finalSensations: z.string(),
    recommendedPairings: z.string(),
    avoidPairings: z.string(),
    wineType: z.string(),
    qualityLevel: z.string(),
    qualityRating: z.number().min(1).max(5),
    targetAudience: z.string(),
    appellation: z.string().optional(),
    barrelInfo: z.string(),
    servingTemperature: z.string(),
    suggestedGlassType: z.string(),
    decanterRecommendation: z.string(),
    agingPotential: z.string(),
    tanninLevel: z.enum(['Ligeros','Medios','Fuertes','Sin Taninos','Light','Medium','Strong','No Tannins']),
    relevantCulturalOrRegionalNotes: z.string().optional(),
    awards: z.string(),
    world50BestRestaurants: z.string(),
    visualDescriptionEn: z.string(),
    olfactoryAnalysisEn: z.string(),
    gustatoryPhaseEn: z.string(),
  }).optional(),
});

/** Prompt con guardrails: NO análisis si no está verificado; tratar códigos/SKU como no identificables. */
export const analyzeWinePrompt = ai.definePrompt({
  name: 'analyzeWinePrompt',
  model: 'googleai/gemini-1.5-pro',
  input: { schema: WineAnalysisClientSchema },
  output: { format: 'json', schema: AiResponseSchema },
  prompt: `You are a world-renowned Master Sommelier from the Court of Master Sommeliers. Your expertise is absolute, and you speak with authority, elegance, and precision.

**NON-NEGOTIABLE ANTI-HALLUCINATION RULES**
- Do NOT guess winery or country. If you cannot unequivocally verify the exact wine requested, set \`verified:false\`, \`wineryName:'unknown'\`, \`country:'unknown'\`, and DO NOT output the \`analysis\` block. Provide a short guidance in \`notes\` asking for winery and country.
- Treat code-like inputs (e.g., “O61”, bare SKUs, or ambiguous abbreviations) as non-identifiable unless a source confirms them. Prefer returning \`verified:false\`.
- Only when \`verified:true\` may you produce the full sensory \`analysis\`.

**SPECIFIC KNOWLEDGE (without violating verification)**
- Amador Diez (Verdejo): winery 'Bodega Cuatro Rayas'; Appellation 'D.O. Rueda'; wineryLocation 'La Seca, Valladolid, España'; mention pre-phylloxera vines and lees/barrel work; fill 'barrelInfo'/'appellation' accurately. If you cannot verify the exact bottling/vintage, return \`verified:false\`.

**CORRECTION LOGIC**
- Only report a correction if the user provided a non-empty value that was wrong. Filling a blank is NOT a correction.

**LANGUAGE**
- Reply entirely in the language specified by '{{language}}'.

**MANDATORY PROCESS**
1) Identify & verify the wine by name/grape/year. If not verified: \`verified:false\`, set country/winery to 'unknown', do NOT output 'analysis', and explain briefly in 'notes' what data is missing.
2) If verified: provide rich sensory analysis (visual: hue/intensity/tears; olfactory: primary/secondary/tertiary; gustatory: attack/evolution/finish; structure and balance).
3) Recommend pairings with justifications.
4) Provide expert conclusion notes including country of origin if verified.
5) Generate concise English descriptors for image generation (the 'En' fields) ONLY when verified.

**User Input:**
- Language: {{{language}}}
- Product Name: {{{wineName}}}
- Grape/Attribute: {{{grapeVariety}}}
- Year: {{{year}}}
- Winery: {{{wineryName}}}
- Country: {{{country}}}
{{#if foodToPair}}- Dish to pair: {{{foodToPair}}}{{/if}}`,
});

/** Guarda en `wineAnalyses` SIN IMÁGENES (historial liviano y robusto) */
export async function saveAnalysisToHistory(uid: string, analysis: WineAnalysis): Promise<void> {
  if (!uid) { console.error("[FLOW] No UID provided, cannot save analysis."); return; }

  try {
    const db = adminDb();
    db.settings?.({ ignoreUndefinedProperties: true });

    const STRIP_KEYS = /^(imageUrl|image_urls|suggestedGlassTypeImageUrl)$/i;
    const scrub = (v: any): any => {
      if (v === undefined || typeof v === "function" || v instanceof Promise) return null;
      if (v === null) return null;
      if (typeof v === "string") { if (v.startsWith("data:")) return null; return v; }
      if (Array.isArray(v)) return v.map(scrub);
      if (v && typeof v === "object") {
        const out: any = {};
        for (const k of Object.keys(v)) {
          if (STRIP_KEYS.test(k)) continue;
          const sv = scrub(v[k]);
          if (sv !== undefined) out[k] = sv;
        }
        return out;
      }
      return v;
    };

    const safeAnalysis = scrub((analysis as any)?.analysis);

    const docToSave: any = {
      uid,
      userId: uid,
      wineName: (analysis as any)?.wineName ?? null,
      year: (analysis as any)?.year ?? null,
      imageUrl: null,
      analysis: safeAnalysis ?? null,
      notes: (analysis as any)?.notes ?? "",
      pairingRating: (analysis as any)?.pairingRating ?? null,
      pairingNotes: (analysis as any)?.pairingNotes ?? null,
      country: (analysis as any)?.country ?? null,
      wineryName: (analysis as any)?.wineryName ?? null,
      verified: (analysis as any)?.verified ?? null,
      verificationSource: (analysis as any)?.verificationSource ?? null,
      createdAt: FieldValue.serverTimestamp(),
    };

    console.log("[FLOW] Writing to 'wineAnalyses' (no images):", {
      uid, wineName: docToSave.wineName, year: docToSave.year, verified: docToSave.verified,
    });

    await db.collection("wineAnalyses").add(docToSave);
    console.log(`[FLOW] ✅ Wrote doc in 'wineAnalyses' OK for uid=${uid}`);
  } catch (err) {
    console.error(`[FLOW] ❌ Write failed for uid=${uid}:`, err);
  }
}

export const analyzeWineFlow = async (
  userInput: z.infer<typeof WineAnalysisClientSchema>
): Promise<WineAnalysis> => {
  const { output } = await analyzeWinePrompt(userInput);
  if (!output) throw new Error('No structured output returned from AI.');

  // 🚧 Guardrail: bloquear resultados no verificados
  if (!output.verified) {
    console.warn('[FLOW] Wine not verified. Blocking analysis.', { q: userInput, out: output });

    const safe: WineAnalysis = {
      ...(output as any),
      isAiGenerated: output.isAiGenerated ?? false,
      wineName: output.wineName,
      year: output.year,
      country: output.country ?? 'unknown',
      wineryName: output.wineryName ?? 'unknown',
      notes: output.notes || 'No se pudo verificar el vino. Por favor indica bodega y país exactos.',
      // ❌ NO incluimos `analysis` ni generamos imágenes
    } as any;

    if ((userInput as any).uid) await saveAnalysisToHistory((userInput as any).uid, safe);
    return safe;
  }

  // ✅ Solo si verified:true generamos análisis e imágenes
  let result: WineAnalysis;
  const imageGenerationModel = 'googleai/gemini-2.0-flash-preview-image-generation';
  const imageGenerationConfig = { responseModalities: ['TEXT', 'IMAGE'] as const };

  if (!output.analysis) {
    result = {
      ...(output as any),
      isAiGenerated: output.isAiGenerated,
      wineName: output.wineName,
      year: output.year,
      notes: output.notes,
      corrections: output.corrections,
    } as any;
  } else {
    const analysisData = output.analysis;

    const imagePromises = [
      ai.generate({
        model: imageGenerationModel,
        prompt: `Hyper-realistic photo, a glass of wine. ${analysisData.visualDescriptionEn}. Studio lighting, neutral background.`,
        config: imageGenerationConfig,
      }),
      ai.generate({
        model: imageGenerationModel,
        prompt: `Abstract art, captures the essence of wine aromas. ${analysisData.olfactoryAnalysisEn}. No text, no glass.`,
        config: imageGenerationConfig,
      }),
      ai.generate({
        model: imageGenerationModel,
        prompt: `Abstract textured art, evokes the sensation of wine flavors. ${analysisData.gustatoryPhaseEn}. No text, no glass.`,
        config: imageGenerationConfig,
      }),
    ];

    let glassImagePromise: Promise<any> = Promise.resolve(null);
    if (analysisData.suggestedGlassType && !/n\/?a|no especificado|not specified/i.test(analysisData.suggestedGlassType)) {
      glassImagePromise = ai.generate({
        model: imageGenerationModel,
        prompt: `Professional product photo of an empty ${analysisData.suggestedGlassType} wine glass. White background, studio lighting.`,
        config: imageGenerationConfig,
      });
    }

    const [visualResult, olfactoryResult, gustatoryResult, glassResult] = await Promise.allSettled([
      ...imagePromises,
      glassImagePromise,
    ]);

    const getUrl = (res: PromiseSettledResult<any>) =>
      res.status === 'fulfilled' && (res as any).value?.media?.url ? (res as any).value.media.url : undefined;

    result = {
      ...(output as any),
      isAiGenerated: output.isAiGenerated,
      wineName: output.wineName,
      year: output.year,
      country: output.country,
      wineryName: output.wineryName,
      notes: output.notes,
      corrections: output.corrections,
      pairingRating: output.pairingRating,
      pairingNotes: output.pairingNotes,
      foodToPair: (userInput as any).foodToPair,
      analysis: {
        ...analysisData,
        visual: { ...analysisData.visual, imageUrl: getUrl(visualResult) },
        olfactory: { ...analysisData.olfactory, imageUrl: getUrl(olfactoryResult) },
        gustatory: { ...analysisData.gustatory, imageUrl: getUrl(gustatoryResult) },
        suggestedGlassTypeImageUrl: getUrl(glassResult),
      } as any,
    } as any;
  }

  console.log("[FLOW] Saving analysis to wineAnalyses for user:", (userInput as any).uid,
    "wine:", (result as any)?.wineName, "year:", (result as any)?.year, "verified:", (result as any)?.verified);

  if ((userInput as any).uid) await saveAnalysisToHistory((userInput as any).uid, result);
  return result;
};
