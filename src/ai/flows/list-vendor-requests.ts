// src/ai/flows/analize-wine.ts
// @ts-nocheck
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { WineAnalysisClientSchema } from '@/lib/schemas';
import type { WineAnalysis } from '@/types';
import { adminDb, FieldValue } from '@/lib/firebase-admin';

/* ───────────────────────── Utilidades ───────────────────────── */
const clampBytes = (text: string | undefined, limit = 3000) => {
  if (!text) return '';
  const enc = new TextEncoder();
  let t = String(text).replace(/\s+/g, ' ').trim();
  while (enc.encode(t).length > limit) t = t.slice(0, Math.floor(t.length * 0.9));
  return t;
};
const trim = (s: any, n = 4000) =>
  typeof s === 'string' ? s.trim().slice(0, n) : s ?? null;
const keepUrl = (u?: string) =>
  u && /^(https?:|gs:)/i.test(u) ? u : undefined;
/** Firestore no admite undefined */
const pruneUndefined = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(pruneUndefined).filter(v => v !== undefined);
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v === undefined) delete obj[k];
    else if (typeof v === 'object' && v !== null) obj[k] = pruneUndefined(v);
  }
  return obj;
};
/** Normaliza string para comparar nombres */
const norm = (s?: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
/** Extrae URL de imagen soportando objetos o arreglos */
const extractImageUrl = (val: any): string | undefined => {
  if (!val) return undefined;
  const v = val.value ?? val; // por si pasamos res o res.value
  const m = v?.media ?? v?.output?.media ?? v?.result?.media ?? v?.images;
  if (Array.isArray(m) && m.length) {
    const item = m.find((x: any) => typeof x?.url === 'string') ?? m[0];
    return keepUrl(item?.url);
  }
  if (m && typeof m?.url === 'string') return keepUrl(m.url);
  if (typeof v?.url === 'string') return keepUrl(v.url);
  if (typeof v?.mediaUrl === 'string') return keepUrl(v.mediaUrl);
  return undefined;
};

/* ───────── Schema salida (capamos campos EN para imagen) ─────── */
const AiResponseSchema = z.object({
  isAiGenerated: z.boolean(),
  wineName: z.string(),
  year: z.number(),
  country: z.string().optional(),
  wineryName: z.string().optional(),
  notes: z.string(),
  corrections: z.array(z.object({
    field: z.enum(['Vino','AÃƒÂ±o','Cepa','Bodega','PaÃƒÂ­s','Wine','Year','Grape','Winery','Country']),
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
    visualDescriptionEn: z.string().max(300),
    olfactoryAnalysisEn: z.string().max(300),
    gustatoryPhaseEn: z.string().max(300),
  }).optional(),
});

/* ───────────────────────── Prompt ───────────────────────── */
export const analyzeWinePrompt = ai.definePrompt({
  name: 'analyzeWinePrompt',
  model: 'googleai/gemini-1.5-pro',
  input: { schema: WineAnalysisClientSchema },
  output: { format: 'json', schema: AiResponseSchema },
  prompt: `You are a world-renowned Master Sommelier from the Court of Master Sommeliers. Your expertise is absolute...

**HARD CONSTRAINTS:**
- The output 'wineName' MUST be the corrected official name of the user's wine. NEVER replace it with another unrelated wine. If not identifiable with high confidence, set isAiGenerated=true and keep the user's wineName (optionally with "(Genérico)").
- If user fields (country, winery, grape) contradict known facts, CORRECT them and include them in 'corrections' only if the user provided a non-empty (wrong) value.

**SPECIFIC KNOWLEDGE EXAMPLE:**
- Amador Diez (Verdejo): winery 'Bodega Cuatro Rayas', Appellation 'D.O. Rueda', wineryLocation 'La Seca, Valladolid, España', pre-phylloxera vines, fermentation/aging on lees in French & Caucasian oak. Fill 'barrelInfo' and 'appellation' correctly.

**IMAGE PROMPTS BUDGET (MANDATORY):**
- 'visualDescriptionEn', 'olfactoryAnalysisEn' and 'gustatoryPhaseEn' MUST be compact phrases (no paragraphs), max 240 characters each. No lists; avoid repetition.

...`,
});

/* ─── Guardado en historial (capado, sin data-URL y sin undefined) ─── */
export async function saveAnalysisToHistory(uid: string, analysis: WineAnalysis): Promise<string | void> {
  if (!uid) return;

  const db = adminDb();
  const a: any = analysis;
  const ad: any = a?.analysis ?? {};

  const safeAnalysis: any = {
    grapeVariety: ad.grapeVariety,
    wineryLocation: ad.wineryLocation,
    visual: {
      description: trim(ad?.visual?.description, 2000),
      imageUrl: keepUrl(ad?.visual?.imageUrl),
    },
    olfactory: {
      description: trim(ad?.olfactory?.description, 2000),
      imageUrl: keepUrl(ad?.olfactory?.imageUrl),
    },
    gustatory: {
      description: trim(ad?.gustatory?.description, 2000),
      imageUrl: keepUrl(ad?.gustatory?.imageUrl),
    },
    body: trim(ad.body, 800),
    finalSensations: trim(ad.finalSensations, 1200),
    recommendedPairings: trim(ad.recommendedPairings, 1500),
    avoidPairings: trim(ad.avoidPairings, 1500),
    wineType: ad.wineType,
    qualityLevel: ad.qualityLevel,
    qualityRating: ad.qualityRating,
    targetAudience: ad.targetAudience,
    appellation: ad.appellation,
    barrelInfo: trim(ad.barrelInfo, 1200),
    servingTemperature: ad.servingTemperature,
    suggestedGlassType: ad.suggestedGlassType,
    decanterRecommendation: ad.decanterRecommendation,
    agingPotential: ad.agingPotential,
    tanninLevel: ad.tanninLevel,
    visualDescriptionEn: trim(ad.visualDescriptionEn, 300),
    olfactoryAnalysisEn: trim(ad.olfactoryAnalysisEn, 300),
    gustatoryPhaseEn: trim(ad.gustatoryPhaseEn, 300),
  };

  const base: any = {
    userId: uid,
    wineName: a?.wineName,
    year: a?.year ?? null,
    grapeVariety: ad?.grapeVariety ?? a?.grapeVariety ?? null,
    imageUrl: keepUrl(ad?.visual?.imageUrl) ?? keepUrl(a?.imageUrl),
    country: a?.country ?? null,
    wineryName: a?.wineryName ?? null,
    analysis: safeAnalysis,
    notes: trim(a?.notes, 3500),
    pairingNotes: trim(a?.pairingNotes, 1500),
    pairingRating: a?.pairingRating ?? null,
    createdAt: FieldValue.serverTimestamp(),
  };

  const batch = adminDb().batch();
  const topRef = adminDb().collection('wineAnalyses').doc();
  const userRef = adminDb().collection('users').doc(uid).collection('history').doc(topRef.id);

  batch.set(topRef, pruneUndefined({ ...base }));
  batch.set(userRef, pruneUndefined({ ...base, _topId: topRef.id }));

  await batch.commit();
  return topRef.id;
}

/* ───────────────────────── Flujo principal ───────────────────────── */
export const analyzeWineFlow = async (
  userInput: z.infer<typeof WineAnalysisClientSchema>
): Promise<WineAnalysis> => {
  const { output } = await analyzeWinePrompt(userInput);
  if (!output) throw new Error('No structured output returned from AI.');

  // ⚖️ Verificación dura del nombre: no aceptamos vinos no relacionados.
  const inName = norm(userInput.wineName);
  let outName = norm(output.wineName);
  if (inName && outName && !outName.includes(inName)) {
    output.isAiGenerated = true;                // marcamos genérico
    output.wineName = userInput.wineName;       // anclamos al vino pedido
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
    const A = output.analysis;

    // Fallbacks y límites para prompts de imagen
    const visSrc = A.visualDescriptionEn || `Wine glass, ${trim(A.visual?.description, 240)}`;
    const olfSrc = A.olfactoryAnalysisEn || `Abstract aromas, ${trim(A.olfactory?.description, 240)}`;
    const gusSrc = A.gustatoryPhaseEn || `Abstract flavors, ${trim(A.gustatory?.description, 240)}`;

    const visEn = clampBytes(visSrc, 3000);
    const olfEn = clampBytes(olfSrc, 3000);
    const gusEn = clampBytes(gusSrc, 3000);
    const glassType = clampBytes(A.suggestedGlassType, 200);

    const imagePromises = [
      ai.generate({
        model: imageGenerationModel,
        prompt: `Hyper-realistic product photo of a wine glass. ${visEn}. Studio lightin
