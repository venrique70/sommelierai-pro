'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { WineAnalysisClientSchema } from '@/lib/schemas';
import type { WineAnalysis } from '@/types';

// ✅ usa tu wrapper coherente con el resto del proyecto
import { adminDb, FieldValue } from '@/lib/firebase-admin';

// This file contains the internal logic for the wine analysis.
// It is NOT directly called by the client. It is called by the Server Action in actions.ts.

const AiResponseSchema = z.object({
  isAiGenerated: z.boolean().describe("Set to true ONLY if you cannot find the specific wine and have to analyze a similar one."),
  wineName: z.string().describe("The full, corrected name of the wine."),
  year: z.number().describe("The specific vintage year."),
 country: z.string().optional().describe("Country must come from user input or a verified correction when uniquely identifiable. Do NOT infer if missing."),
wineryName: z.string().optional().describe("Winery is OPTIONAL. Only fill it if identification is unambiguous given name, grape, year, and country. Never guess."),
  notes: z.string().describe("Your final expert opinion and conclusion. Comment on the wine's typicity, style, aging potential, and origin country. Maintain a warm, technical, and mentoring tone. This is your personal seal."),
  corrections: z.array(z.object({
    field: z.enum(['Vino', 'Año', 'Cepa', 'Bodega', 'País', 'Wine', 'Year', 'Grape', 'Winery', 'Country']),
    original: z.string(),
    corrected: z.string(),
  })).optional().describe("A list of corrections made to the user's input. ONLY report a correction if the user provided a non-empty value that was wrong. Do NOT report a correction if you are filling in a field the user left blank."),
  pairingRating: z.number().min(1).max(5).optional().describe("If foodToPair was provided, a rating from 1 to 5 for the pairing. Otherwise, null."),
  pairingNotes: z.string().optional().describe("If foodToPair was provided, detailed notes explaining the pairing rating. Otherwise, null."),
  analysis: z.object({
    grapeVariety: z.string().describe("Crucial. The grape variety or a detailed blend composition (e.g., 'Cabernet Franc 77%, Cabernet Sauvignon 23%'). For blends, this is mandatory."),
    wineryLocation: z.string().optional().describe("The specific location/region of the winery (e.g., 'La Seca, Valladolid, España'). You MUST research and provide this if available."),
    visual: z.object({
      description: z.string().describe("A rich, evocative visual description. Detail the color, hue, and reflections. Comment on the clarity (limpidity) and brightness. Describe the density of the legs (tears) and what it implies about the wine's body and alcohol content."),
    }).describe("Visual analysis of the wine."),
    olfactory: z.object({
      description: z.string().describe("A complex olfactory analysis. Differentiate clearly between primary (fruit, floral), secondary (from fermentation/aging, e.g., vanilla, toast, butter), and tertiary (from evolution, e.g., leather, tobacco) aromas. Comment on the aromatic intensity and complexity."),
    }).describe("Olfactory analysis of the wine."),
    gustatory: z.object({
      description: z.string().describe("A thorough gustatory description. Describe the attack (initial impression), the evolution on the residents, and the finish. Detail the acidity, alcohol, body, and tannin structure. Explain how these elements are balanced and what the texture feels like (e.g., silky, astringent)."),
    }).describe("Gustatory analysis of the wine."),
    body: z.string().describe("Description of the wine's body."),
    finalSensations: z.string().describe("Description of the final sensations of the wine."),
    recommendedPairings: z.string().describe("Ideal food pairings for the wine, formatted as a numbered list with justifications."),
    avoidPairings: z.string().describe("Food pairings to avoid with the wine."),
    wineType: z.string().describe("e.g., young, reserve, sparkling, natural, etc."),
    qualityLevel: z.string().describe("The quality/commercial level of the wine (e.g., massive, standard, premium, icon)."),
    qualityRating: z.number().min(1).max(5).describe("A numeric rating from 1 to 5 based on the quality level (1=massive, 5=icon)."),
    targetAudience: z.string().describe("Suggested expertise level, e.g., novice, intermediate, expert."),
    appellation: z.string().optional().describe("The wine's official appellation, including any special classifications (e.g., D.O. Rueda). You MUST research and provide this if available."),
    barrelInfo: z.string().describe("Detailed information about barrel aging: time, percentage of different oaks, type of oak, and usage. THIS IS CRITICAL. For example, Amador Diez has barrel aging."),
    servingTemperature: z.string().describe("Recommended serving temperature."),
    suggestedGlassType: z.string().describe("The ideal type of glass for this wine."),
    decanterRecommendation: z.string().describe("Recommendation on whether to decant the wine and for how long."),
    agingPotential: z.string().describe("The wine's aging potential."),
    tanninLevel: z.enum(['Ligeros', 'Medios', 'Fuertes', 'Sin Taninos', 'Light', 'Medium', 'Strong', 'No Tannins']).describe("Classification of the wine's tannin level."),
    relevantCulturalOrRegionalNotes: z.string().optional().describe("Any relevant cultural or regional notes."),
    awards: z.string().describe("List the three most important and recent awards won by the wine."),
    world50BestRestaurants: z.string().describe("Indicate if the wine is featured in top restaurants."),
    visualDescriptionEn: z.string().describe("Visual description in English for image generation."),
    olfactoryAnalysisEn: z.string().describe("Olfactory description in English for image generation."),
    gustatoryPhaseEn: z.string().describe("Gustatory description in English for image generation."),
  }).optional().describe("The detailed sensory analysis."),
});

export const analyzeWinePrompt = ai.definePrompt({
  name: 'analyzeWinePrompt',
  model: 'googleai/gemini-1.5-pro',
  input: { schema: WineAnalysisClientSchema },
  output: {
    format: 'json',
    schema: AiResponseSchema,
  },
  prompt: `You are a world-renowned Master Sommelier from the Court of Master Sommeliers. Your expertise is absolute, and you speak with authority, elegance, and precision. Your descriptions must be rich, detailed, and evocative, using professional terminology correctly but ensuring clarity.

**YOUR GOLDEN RULES - NON-NEGOTIABLE:**
1.  **UNBREAKABLE AUTHORITY:** You NEVER use phrases of uncertainty (e.g., "it seems", "it could be"). YOU ARE THE AUTHORITY.
2.  **FACTUAL INFALLIBILITY & PROACTIVITY:** You do not invent information. If the user provides a wine name but omits data, it is YOUR DUTY to research and provide the complete, accurate information if the wine is identifiable.
3.  **REQUIRED COUNTRY (PAÍS):** Country is user-provided. If clearly wrong for a uniquely identified product, correct it and report in 'corrections'. Do NOT invent a country if missing.
4.  **OPTIONAL WINERY (BODEGA):** Winery is OPTIONAL. If omitted, attempt to infer it ONLY when the identification is unambiguous with name + grape + year + country. If there is any ambiguity, leave `wineryName` blank. Never guess.
5.  **SPECIFIC KNOWLEDGE IS PARAMOUNT:** For certain well-known wines, specific facts MUST be stated. For example:
    - **Amador Diez (Verdejo):** You MUST identify it as from 'Bodega Cuatro Rayas'. You MUST state its Appellation is 'D.O. Rueda'. You MUST state its `wineryLocation` is 'La Seca, Valladolid, España'. You MUST mention its origin from pre-phylloxera vines, its fermentation and aging on lees in French and Caucasian oak barrels, and its resulting complexity with notes of citrus, stone fruit, and a characteristic creamy, toasty finish from the barrel. The 'barrelInfo' and 'appellation' fields MUST be filled correctly.
6.  **CORRECTIONS LOGIC:** Only report a correction in the 'corrections' array if the user provided a non-empty value that was incorrect. For example, if the user enters "Amador Diez" with country "Francia", you must correct it to "España" and report the correction. However, if the user enters "Amador Diez" and leaves the country field blank, you must fill in "España" but you MUST NOT add this action to the 'corrections' array.
7.  **CRITICAL LANGUAGE RULE:** Respond entirely in the language specified by '{{language}}'.

**YOUR MANDATORY PROCESS:**
**Preconditions:** If country is missing, do not infer; require country from the user. For winery, only fill when the match is uniquely clear; otherwise proceed without it.
1.  Identify & research the wine by name, grape, and year, applying your specific knowledge and correction logic.
2.  Provide rich sensory analysis (visual, olfactory, gustatory). The descriptions must be elaborate, following the detailed instructions in the output schema. For visual, describe hue, intensity, and what the legs imply. For olfactory, differentiate primary, secondary, and tertiary aromas. For gustatory, detail the attack, evolution, and finish, describing the interplay of acidity, tannins, and body.
3.  Recommend food pairings with justifications.
4.  Provide expert conclusion notes. This must include a mention of the country of origin.
5.  Generate concise English descriptors for image generation (the 'En' fields).

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
  if (!uid) {
    console.error("[FLOW] No UID provided, cannot save analysis.");
    return;
  }

  try {
    const db = adminDb();
    db.settings?.({ ignoreUndefinedProperties: true });

    // --- Limpieza profunda: sin undefined/funciones/promesas y sin imágenes ---
    const STRIP_KEYS = /^(imageUrl|image_urls|suggestedGlassTypeImageUrl)$/i;

    const scrub = (v: any): any => {
      if (v === undefined || typeof v === "function" || v instanceof Promise) return null;
      if (v === null) return null;
      if (typeof v === "string") {
        // Si viniera un data URI/base64 gigante, no lo guardamos
        if (v.startsWith("data:")) return null;
        return v;
      }
      if (Array.isArray(v)) return v.map(scrub);
      if (v && typeof v === "object") {
        const out: any = {};
        for (const k of Object.keys(v)) {
          if (STRIP_KEYS.test(k)) continue; // 👈 elimina cualquier *imageUrl*
          const sv = scrub(v[k]);
          if (sv !== undefined) out[k] = sv;
        }
        return out;
      }
      return v; // number | boolean | Date
    };

    // Eliminamos imágenes profundas del bloque analysis
    const safeAnalysis = scrub((analysis as any)?.analysis);

    // Documento minimal y consistente para el historial
    const docToSave: any = {
      uid,                 // Mi Historial filtra por este campo
      userId: uid,         // compat reglas antiguas
      wineName: analysis?.wineName ?? null,
      year: analysis?.year ?? null,
      imageUrl: null,      // 👈 nunca guardamos imagen en historial
      analysis: safeAnalysis ?? null,
      notes: (analysis as any)?.notes ?? "",
      pairingRating: (analysis as any)?.pairingRating ?? null,
      pairingNotes: (analysis as any)?.pairingNotes ?? null,
      country: (analysis as any)?.country ?? null,
      wineryName: (analysis as any)?.wineryName ?? null,
      createdAt: FieldValue.serverTimestamp(),
    };

    console.log("[FLOW] Writing to 'wineAnalyses' (no images):", {
      uid,
      wineName: docToSave.wineName,
      year: docToSave.year,
    });

    await db.collection("wineAnalyses").add(docToSave);
    console.log(`[FLOW] ✅ Wrote doc in 'wineAnalyses' OK for uid=${uid}`);
  } catch (err) {
    console.error(`[FLOW] ❌ Write failed for uid=${uid}:`, err);
  }
}

export const analyzeWineFlow = async (userInput: z.infer<typeof WineAnalysisClientSchema>): Promise<WineAnalysis> => {
// País obligatorio (guardia)
if (!userInput?.country || !String(userInput.country).trim()) {
  throw new Error("Debes indicar el país del vino para continuar el análisis.");
}
const { output } = await analyzeWinePrompt(userInput);
    if (!output) {
      throw new Error('No structured output returned from AI.');
    }

    let result: WineAnalysis;

    const imageGenerationModel = 'googleai/gemini-2.0-flash-preview-image-generation';
    const imageGenerationConfig = { responseModalities: ['TEXT', 'IMAGE'] as const };

    if (!output.analysis) {
      result = {
        isAiGenerated: output.isAiGenerated,
        wineName: output.wineName,
        year: output.year,
        notes: output.notes,
        corrections: output.corrections,
      };
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

      const [visualResult, olfactoryResult, gustatoryResult, glassResult] = await Promise.allSettled([...imagePromises, glassImagePromise]);

      const getUrl = (res: PromiseSettledResult<any>) =>
        res.status === 'fulfilled' && res.value?.media?.url ? res.value.media.url : undefined;

      result = {
        isAiGenerated: output.isAiGenerated,
        wineName: output.wineName,
        year: output.year,
        country: output.country,
        wineryName: output.wineryName,
        notes: output.notes,
        corrections: output.corrections,
        pairingRating: output.pairingRating,
        pairingNotes: output.pairingNotes,
        foodToPair: userInput.foodToPair,
        analysis: {
          ...analysisData,
          visual: { ...analysisData.visual, imageUrl: getUrl(visualResult) },
          olfactory: { ...analysisData.olfactory, imageUrl: getUrl(olfactoryResult) },
          gustatory: { ...analysisData.gustatory, imageUrl: getUrl(gustatoryResult) },
          suggestedGlassTypeImageUrl: getUrl(glassResult),
        },
      };
    }

    console.log(
      "[FLOW] Saving analysis to wineAnalyses for user:",
      userInput.uid,
      "wine:",
      (result as any)?.wineName,
      "year:",
      (result as any)?.year
    );
    if (userInput.uid) {
      await saveAnalysisToHistory(userInput.uid, result);
    }
    return result;
}
