'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { WineAnalysisClientSchema } from '@/lib/schemas';
import type { WineAnalysis } from '@/types';
import { fetchPublicFactsByName } from "@/ai/facts/webFacts";
import { adminDb, FieldValue } from '@/lib/firebase-admin';
import { Buffer } from "buffer";

// ──────────────────────────────────────────────────────────────────────────────
// SCHEMAS + PROMPT
// ──────────────────────────────────────────────────────────────────────────────

const AiResponseSchema = z.object({
  isAiGenerated: z.boolean().describe("Set to true ONLY if you cannot find the specific wine and have to analyze a similar one or if key facts are missing."),
  wineName: z.string().describe("The full, corrected name of the wine."),
  year: z.number().describe("The specific vintage year."),
  country: z.string().optional().describe("Country must come from user input or a verified correction when uniquely identifiable. Do NOT infer if missing."),
  wineryName: z.string().optional().describe("Winery is OPTIONAL. Only fill it if identification is unambiguous given name, grape, year, and country. Never guess."),
  notes: z.string().describe("Your final expert opinion and conclusion. Comment on the wine's typicity, style, aging potential, and origin country. Maintain a warm, technical, and mentoring tone. This is your personal seal."),
  corrections: z.array(z.object({
    field: z.enum(['Vino', 'Año', 'Cepa', 'Bodega', 'País', 'Wine', 'Year', 'Grape', 'Winery', 'Country', 'Barrel']),
    original: z.string(),
    corrected: z.string(),
  })).optional().describe("A list of corrections made to the user's input. ONLY report a correction if the user provided a non-empty value that was wrong. Do NOT report a correction if you are filling in a field the user left blank."),
  pairingRating: z.number().min(1).max(5).optional().describe("If foodToPair was provided, a rating from 1 to 5 for the pairing. Otherwise, null."),
  pairingNotes: z.string().optional().describe("If foodToPair was provided, detailed notes explaining the pairing rating. Otherwise, null."),
  analysis: z.object({
    grapeVariety: z.string().describe("Crucial. The grape variety or a detailed blend composition (e.g., 'Cabernet Franc 77%, Cabernet Sauvignon 23%'). For blends, this is mandatory if known. Dejar '' si es desconocida, pero el campo debe existir."),
    wineryLocation: z.string().optional().describe("The specific location/region of the winery (e.g., 'La Seca, Valladolid, España'). You MUST research and provide this if available."),
    visual: z.object({
      description: z.string().describe("A rich, evocative visual description. Detail the color, hue, and reflections. Comment on the clarity (limpidity) and brightness. Describe the density of the legs (tears) and what it implies about the wine's body and alcohol content."),
    }).describe("Visual analysis of the wine."),
    olfactory: z.object({
      description: z.string().describe("A complex olfactory analysis. Differentiate clearly between primary (fruit, floral), secondary (from fermentation/aging, e.g., vanilla, toast, butter), and tertiary (from evolution, e.g., leather, tobacco) aromas. Comment on the aromatic intensity and complexity."),
    }).describe("Olfactory analysis of the wine."),
    gustatory: z.object({
      description: z.string().describe("A thorough gustatory description. Describe the attack (initial impression), the evolution on the palate, and the finish. Detail the acidity, alcohol, body, and tannin structure. Explain how these elements are balanced and what the texture feels like (e.g., silky, astringent)."),
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
    barrelInfo: z.string().optional().describe("Detailed information about barrel aging: time, percentage of different oaks, type of oak, and usage. THIS IS CRITICAL. For example, Amador Diez has barrel aging. Leave empty ('') if unknown."),
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
    sources: z.array(z.string().url()).min(1).optional().describe("1–3 URLs confiables que respalden uvas, D.O. y barrica."),
  }).describe("The detailed sensory analysis."),
});

export const analyzeWinePrompt = ai.definePrompt({
  name: 'analyzeWinePrompt',
  model: 'googleai/gemini-2.5-pro',
  input: { schema: WineAnalysisClientSchema },
  output: { format: 'json', schema: AiResponseSchema },
  prompt: `You are a world-renowned Master Sommelier from the Court of Master Sommeliers. Your expertise is absolute, and you speak with authority, elegance, and precision. Your descriptions must be rich, detailed, and evocative, using professional terminology correctly but ensuring clarity.
**YOUR GOLDEN RULES - NON-NEGOTIABLE:**
1. **UNBREAKABLE AUTHORITY:** You NEVER use phrases of uncertainty (e.g., "it seems", "it could be"). YOU ARE THE AUTHORITY.
2. **FACTUAL INFALLIBILITY & PROACTIVITY:** You do not invent information. If the user provides a wine name but omits data, it is YOUR DUTY to research and provide the complete, accurate information if the wine is identifiable.
3. **REQUIRED COUNTRY (PAÍS):** Country is user-provided. If clearly wrong for a uniquely identifiable product, correct it and report in 'corrections'. Do NOT invent a country if missing.
4. **OPTIONAL WINERY (BODEGA):** Winery is OPTIONAL. If omitted, attempt to infer it ONLY when the identification is unambiguous with name + grape + year + country. If there is any ambiguity, leave [wineryName] blank. Never guess.
5. **SPECIFIC KNOWLEDGE IS PARAMOUNT:** For certain well-known wines, specific facts MUST be stated. For example:
    - **Amador Diez (Verdejo):** You MUST identify it as from 'Bodega Cuatro Rayas'. You MUST state its Appellation is 'D.O. Rueda'. You MUST state its [wineryLocation] is 'La Seca, Valladolid, España'. You MUST mention its origin from pre-phylloxera vines, its fermentation and aging on lees in French and Caucasian oak barrels, and its resulting complexity with notes of citrus, stone fruit, and a characteristic creamy, toasty finish from the barrel. The 'barrelInfo' and 'appellation' fields MUST be filled correctly.
6. **CORRECTIONS LOGIC:** Only report a correction in the 'corrections' array if the user provided a non-empty value that was incorrect. For example, if the user enters "Amador Diez" with country "Francia", you must correct it to "España" and report the correction. However, if the user enters "Amador Diez" and leaves the country field blank, you must fill in "España" but you MUST NOT add this action to the 'corrections' array.
7. **CRITICAL LANGUAGE RULE:** Respond entirely in the language specified by '{{language}}'.
8. Do not write disclaimers like “no dispongo…”, “no puedo confirmar…”. If a field is unknown, omit the disclaimer.
9. **ANTI-HALLUCINATION PROTOCOL:** You MUST follow this to avoid inventing facts. For ALL factual fields (e.g., grapeVariety, barrelInfo, appellation, wineryLocation):
    - Only provide information if it is 100% verifiable from your training data (no speculation or inference).
    - NEVER use phrases like "probably", "typically", "I believe", or disclaimers—simply omit the data.
    - Self-check: Before outputting, ask yourself: "Is this exact for THIS wine/year?" If no, blank.
**BARREL DETAIL (MANDATORY):**
- If the wine is identified and barrel aging is EXPLICITLY known from verified sources in your training (e.g., "12 months in American oak" for a specific wine), provide precise details: time in months/years, oak type, and percentage (e.g., “12 meses en roble americano”, “6 meses en roble francés y 6 meses en depósito”).
- Do NOT invent or generalize (e.g., no "typical for region"). If unknown or not declared, leave "barrelInfo" COMPLETELY EMPTY ("").
- Do NOT write disclaimers like “no dispongo…”, “no puedo confirmar…”, or “probablemente…”. If the producer truly does not declare any barrel aging, leave "barrelInfo" empty (do not output placeholders like “sin barrica declarada”).
**GRAPE DETAIL (MANDATORY):**
- Provide the EXACT grape composition ONLY if known 100% for this specific wine/year from your training (with percentages if available, e.g., "Cabernet Sauvignon 35%, Merlot 35%"). If percentages are not published, list varieties explicitly (e.g., "Cabernet Sauvignon, Merlot, Monastrell").
- Do NOT invent blends or guess (avoid generic “blend tinto” or regional assumptions). If unknown or ambiguous, leave "grapeVariety" COMPLETELY EMPTY ("") and set isAiGenerated: true.
**YOUR MANDATORY PROCESS:**
**Preconditions:** If country is missing, do not infer; require country from the user. For winery, only fill when the match is uniquely clear; otherwise proceed without it.
1. Identify & research the wine by name, grape, and year, applying your specific knowledge and correction logic. If facts like grapes or barrel are unknown after identification, set isAiGenerated: true and leave those fields empty. Do not proceed to sensory analysis without core facts.
2. Provide rich sensory analysis (visual, olfactory, gustatory). The descriptions must be elaborate, following the detailed instructions in the output schema. For visual, describe hue, intensity, and what the legs imply. For olfactory, differentiate primary, secondary, and tertiary aromas. For gustatory, detail the attack, evolution, and finish, describing the interplay of acidity, tannins, and body.
3. Recommend food pairings with justifications.
4. Provide expert conclusion notes. This must include a mention of the country of origin.
5. Generate concise English descriptors for image generation (the 'En' fields).
**User Input:**
- Language: {{{language}}}
- Product Name: {{{wineName}}}
- Grape/Attribute: {{{grapeVariety}}}
- Year: {{{year}}}
- Winery: {{{wineryName}}}
- Country: {{{country}}}
{{#if foodToPair}}- Dish to pair: {{{foodToPair}}}{{/if}}
- Note: Base ALL facts on verifiable knowledge only—no external search simulation.
Return one valid JSON object only (no markdown, no backticks, no extra text).
`,
});

// ──────────────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────────────

async function saveAnalysisToHistory(uid: string, analysis: WineAnalysis): Promise<void> {
  if (!uid) {
    console.error("[FLOW] No UID provided, cannot save analysis.");
    return;
  }
  try {
    const db = adminDb();
    db.settings?.({ ignoreUndefinedProperties: true });
    const STRIP_KEYS = /^(image_urls)$/i;
    const scrub = (v: any): any => {
      if (v === undefined || typeof v === "function" || v instanceof Promise) return null;
      if (v === null) return null;
      if (typeof v === "string") {
        if (v.startsWith("data:")) return null;
        return v;
      }
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
      wineName: analysis?.wineName ?? null,
      year: analysis?.year ?? null,
      imageUrl: null,
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
    console.log(`[FLOW] Wrote doc in 'wineAnalyses' OK for uid=${uid}`);
  } catch (err) {
    console.error(`[FLOW] Write failed for uid=${uid}:`, err);
  }
}

function _norm(s?: string) {
  return (s || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

const _KNOWN: Record<string, {
  grapesPct: string;
  country?: string;
  winery?: string;
  aliases?: string[];
  sources?: string[];
  barrelInfo?: string;
  appellation?: string;
}> = {
  "ophiusa": {
    grapesPct: "Cabernet Sauvignon 35%, Merlot 35%, Monastrell 25%, Fogoneu 5%",
    country: "España",
    winery: "Cap de Barbaria",
    aliases: ["ophiusa cap de barbaria", "ophiusa formentera"],
    barrelInfo: "12 meses en roble francés",
    appellation: "Vino de la Tierra de Formentera"
  },
  "amador diez": {
    grapesPct: "Verdejo 100%",
    country: "España",
    winery: "Bodega Cuatro Rayas",
    aliases: ["amador diez verdejo", "cuatro rayas amador diez"],
    barrelInfo: "Fermentado y criado sobre lías en barricas de roble francés y caucásico durante 11 meses",
    appellation: "D.O. Rueda",
    sources: ["https://www.cuatrorayas.es/amador-diez"]
  }
};

function _findKnown(name?: string) {
  const k = _norm(name);
  if (!k) return null;
  if (_KNOWN[k]) return _KNOWN[k];
  for (const v of Object.values(_KNOWN)) {
    if (v.aliases?.some(a => _norm(a) === k)) return v;
  }
  return null;
}

function _verifyWineFacts<T extends Record<string, any>>(result: T): T {
  if (!result) return result;
  const gv = String(result?.analysis?.grapeVariety || "");
  const barrel = String(result?.analysis?.barrelInfo || "");
  const k = _findKnown(result?.wineName);
  if (!k) return result;

  const hasGSM = /\b(garnacha|grenache|syrah|shiraz|monastrell)\b/i.test(gv);
  const grapesWrong = hasGSM || (k.grapesPct && gv !== k.grapesPct);

  if (grapesWrong) {
    result.analysis = result.analysis || {};
    const original = gv || "—";
    result.analysis.grapeVariety = k.grapesPct;
    result.isAiGenerated = false;
    result.corrections = [
      ...(result.corrections || []),
      { field: "Grape", original, corrected: k.grapesPct }
    ];
  }

  if (k.barrelInfo && barrel !== k.barrelInfo) {
    result.analysis = result.analysis || {};
    const original = barrel || "—";
    result.analysis.barrelInfo = k.barrelInfo;
    result.isAiGenerated = false;
    result.corrections = [
      ...(result.corrections || []),
      { field: "Barrel", original, corrected: k.barrelInfo }
    ];
  }

  if (k.country && _norm(result.country) !== _norm(k.country)) {
    result.corrections = [
      ...(result.corrections || []),
      { field: "Country", original: String(result.country || ""), corrected: k.country }
    ];
    result.country = k.country;
  }

  if (k.winery && !result.wineryName) {
    result.wineryName = k.winery;
  }

  if (k.appellation && result.analysis && !result.analysis.appellation) {
    result.analysis.appellation = k.appellation;
  }

  return result;
}

// ──────────────────────────────────────────────────────────────────────────────
// IMAGEN HELPERS
// ──────────────────────────────────────────────────────────────────────────────

const API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.GOOGLE_GENAI_API_KEY;

const hostOf = (u: string) => {
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; }
};

const withKeyIfNeeded = (url: string) => {
  if (!API_KEY) return url;
  if (!url || url.startsWith("data:")) return url;
  if (/[?&]key=/.test(url)) return url;

  const h = hostOf(url);
  const needsKey =
    h.endsWith("generativelanguage.googleapis.com") ||
    h.endsWith("aiplatform.googleapis.com");

  if (!needsKey) return url;

  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}key=${API_KEY}`;
};

type MediaHit = { url?: string; dataB64?: string; contentType?: string };

const asBase64 = (d: any): string | undefined => {
  if (!d) return undefined;
  if (typeof d === "string") return d;
  try {
    if (d instanceof ArrayBuffer) return Buffer.from(d).toString("base64");
    if (ArrayBuffer.isView(d)) {
      return Buffer.from(d.buffer, d.byteOffset, d.byteLength).toString("base64");
    }
  } catch {}
  return undefined;
};

const toDataUrl = (ct: string, b64: string) => {
  const contentType = ct || "image/png";
  if (b64.startsWith("data:")) return b64;
  return `data:${contentType};base64,${b64}`;
};

const extractMedia = (v: any): MediaHit | null => {
  if (!v) return null;

  // Caso 1: image como string directo
  const imgVal = v?.image ?? v?.output?.image;
  if (typeof imgVal === "string") {
    const s = imgVal.trim();
    if (s) {
      if (s.startsWith("data:") || /^https?:\/\//i.test(s)) return { url: s };
      return { dataB64: s, contentType: "image/png" };
    }
  }

  // Caso 2: media como string directo
  const mediaVal = v?.media ?? v?.output?.media;
  if (typeof mediaVal === "string") {
    const s = mediaVal.trim();
    if (s) {
      if (s.startsWith("data:") || /^https?:\/\//i.test(s)) return { url: s };
      return { dataB64: s, contentType: "image/png" };
    }
  }

  // Caso 3: media como objeto con .url
  if (mediaVal && typeof mediaVal?.url === "string") {
    return { url: mediaVal.url, contentType: mediaVal.contentType || mediaVal.mimeType };
  }

  // Caso 4: image como objeto estructurado (solo si es object)
  const img = v?.image || v?.output?.image;
  if (img && typeof img === "object") {
    const ct = img.contentType || img.mimeType;
    const b64Raw =
      img.data ||
      img.base64 ||
      img.inlineData?.data ||
      img.inline_data?.data;
    const b64 = asBase64(b64Raw);
    if (typeof img.url === "string") return { url: img.url, contentType: ct };
    if (b64) return { dataB64: b64, contentType: ct || img.inlineData?.mimeType || img.inline_data?.mime_type };
  }

  // Caso 5: media directo (array o primer elemento)
  const direct =
    (Array.isArray(v.media) ? v.media[0] : v.media) ||
    (Array.isArray(v.output?.media) ? v.output.media[0] : v.output?.media);
  const m1 = direct?.media ? direct.media : direct;
  if (m1) {
    const ct = m1.contentType || m1.mimeType;
    const b64Raw =
      m1.data ||
      m1.base64 ||
      m1.inlineData?.data ||
      m1.inline_data?.data;
    const b64 = asBase64(b64Raw);
    if (typeof m1.url === "string") return { url: m1.url, contentType: ct };
    if (b64) return { dataB64: b64, contentType: ct || m1.inlineData?.mimeType || m1.inline_data?.mime_type };
  }

  // Caso 6: estructura de candidates / parts
  const rawContent =
    v.output?.message?.content ??
    v.message?.content ??
    v.output?.content ??
    v.content;
  const parts =
    (Array.isArray(rawContent) ? rawContent : undefined) ??
    (Array.isArray(rawContent?.parts) ? rawContent.parts : undefined) ??
    v.output?.message?.parts ??
    v.output?.candidates?.[0]?.content?.parts ??
    v.candidates?.[0]?.content?.parts;

  if (Array.isArray(parts)) {
    for (const p of parts) {
      const pm = p?.media || p;
      const ct = pm?.contentType || pm?.mimeType || p?.inlineData?.mimeType || p?.inline_data?.mime_type;
      const b64Raw =
        pm?.data ||
        pm?.base64 ||
        pm?.inlineData?.data ||
        pm?.inline_data?.data ||
        p?.inlineData?.data ||
        p?.inline_data?.data;
      const b64 = asBase64(b64Raw);
      if (typeof pm?.url === "string") return { url: pm.url, contentType: ct };
      if (b64) return { dataB64: b64, contentType: ct };
    }
  }

  return null;
};

const getImageSrc = async (
  res: PromiseSettledResult<any> | undefined,
  label: string
): Promise<string | undefined> => {
  if (!res) return undefined;
  if (res.status !== "fulfilled" || !res.value) {
    console.error(`[IMG] ${label} rejected:`, (res as any)?.reason);
    return undefined;
  }

  const hit = extractMedia(res.value);
  if (!hit) {
    console.error(`[IMG] ${label} no media found. Keys:`, Object.keys(res.value || {}));
    return undefined;
  }

  if (hit.dataB64) {
    return toDataUrl(hit.contentType || "image/png", hit.dataB64);
  }

  if (hit.url) {
    const u = hit.url.trim();

    if (u.startsWith("data:")) return u;

    if (!/^https?:\/\//i.test(u)) {
      return toDataUrl(hit.contentType || "image/png", u);
    }

    try {
      const url = withKeyIfNeeded(u);
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const ct = r.headers.get("content-type") || hit.contentType || "image/png";
      const buf = Buffer.from(await r.arrayBuffer());
      return `data:${ct};base64,${buf.toString("base64")}`;
    } catch (e) {
      console.error(`[IMG] ${label} fetch failed:`, e);
      return undefined;
    }
  }

  return undefined;
};

// ──────────────────────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ──────────────────────────────────────────────────────────────────────────────

export const analyzeWineFlow = async (userInput: z.infer<typeof WineAnalysisClientSchema>): Promise<WineAnalysis> => {
  if (!userInput?.country || !String(userInput.country).trim()) {
    throw new Error("Debes indicar el país del vino para continuar el análisis.");
  }
  if (userInput.year == null || isNaN(Number(userInput.year))) {
    throw new Error("Debes indicar una añada válida para el vino.");
  }

  const { output } = await analyzeWinePrompt(userInput);
  let result: WineAnalysis = AiResponseSchema.parse(output);

  console.log('[DEBUG] AI Output facts:', {
    grapes: result.analysis?.grapeVariety,
    barrel: result.analysis?.barrelInfo,
    sources: result.analysis?.sources,
    isAiGenerated: result.isAiGenerated
  });

  result = _verifyWineFacts(result);

  try {
    const webFacts = await fetchPublicFactsByName(String(result.wineName || userInput.wineName || ""));
    if (webFacts) {
      if (webFacts.country && _norm(String(result.country || "")) !== _norm(webFacts.country)) {
        result.corrections = [...(result.corrections || []), { field: "Country", original: String(result.country || "—"), corrected: webFacts.country }];
        result.country = webFacts.country;
      }
      if (webFacts.barrel) {
        const cur = String(result.analysis?.barrelInfo || "");
        if (!cur || /tiempo no declarado|tipo no declarado|sin\s+barrica/i.test(cur)) {
          result.analysis = result.analysis || {};
          result.analysis.barrelInfo = webFacts.barrel;
        }
      }
      if (webFacts.grapes) {
        const gv = String(result.analysis?.grapeVariety || "");
        const generic = /\b(blend|coupage|mezcla)\b/i.test(gv) && !/%/.test(gv) && !/,/.test(gv);
        if (!gv || generic) {
          result.analysis = result.analysis || {};
          result.analysis.grapeVariety = webFacts.grapes;
        }
      }
      if (webFacts.sources?.length) {
        result.analysis = result.analysis || {};
        const prev = new Set(result.analysis.sources || []);
        webFacts.sources.forEach(s => prev.add(s));
        (result.analysis as any).sources = Array.from(prev);
      }
    }
  } catch { /* silencioso */ }

  if (result?.analysis?.grapeVariety) {
    const gv = String(result.analysis.grapeVariety).trim();
    const generic = /\b(blend|coupage|mezcla)\b/i.test(gv) && !/%/.test(gv) && !/,/.test(gv);
    const gsmTokens = ['garnacha', 'grenache', 'syrah', 'shiraz', 'monastrell'];
    const countGsm = gsmTokens.reduce((n, t) => n + (new RegExp(`\\b${t}\\b`, 'i').test(gv) ? 1 : 0), 0);
    const guessedGSM = (/\bgsm\b/i.test(gv) || countGsm >= 3) && !/%/.test(gv);
    if (generic || guessedGSM) {
      result.corrections = [...(result.corrections || []), { field: "Grape", original: gv, corrected: "—" }];
      result.analysis.grapeVariety = "";
      result.isAiGenerated = true;
    }
  }

  const imageGenerationModel = 'googleai/gemini-2.5-flash-image';
  const imageGenerationConfig = { responseModalities: ['IMAGE', 'TEXT'] as const };
  const analysisData = result.analysis;

  const visualTxt =
    (analysisData.visualDescriptionEn || "").trim() ||
    (analysisData.visual?.description || "").trim();
  const olfTxt =
    (analysisData.olfactoryAnalysisEn || "").trim() ||
    (analysisData.olfactory?.description || "").trim();
  const gustTxt =
    (analysisData.gustatoryPhaseEn || "").trim() ||
    (analysisData.gustatory?.description || "").trim();

  const okImg = visualTxt.length >= 10 && olfTxt.length >= 10 && gustTxt.length >= 10;

  let visualResult: PromiseSettledResult<any> | undefined;
  let olfactoryResult: PromiseSettledResult<any> | undefined;
  let gustatoryResult: PromiseSettledResult<any> | undefined;
  let glassResult: PromiseSettledResult<any> | undefined;

  if (okImg) {
    const imagePromises = [
      ai.generate({
        model: imageGenerationModel,
        prompt: `Hyper-realistic photo, a glass of wine. ${visualTxt}. Studio lighting, neutral background.`,
        config: imageGenerationConfig,
      }),
      ai.generate({
        model: imageGenerationModel,
        prompt: `Abstract art, captures the essence of wine aromas. ${olfTxt}. No text, no glass.`,
        config: imageGenerationConfig,
      }),
      ai.generate({
        model: imageGenerationModel,
        prompt: `Abstract textured art, evokes the sensation of wine flavors. ${gustTxt}. No text, no glass.`,
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

    [visualResult, olfactoryResult, gustatoryResult, glassResult] =
      await Promise.allSettled([...imagePromises, glassImagePromise]);
  }

  const [visualUrl, olfactoryUrl, gustatoryUrl, glassUrl] = okImg
    ? await Promise.all([
        getImageSrc(visualResult, "visual"),
        getImageSrc(olfactoryResult, "olfactory"),
        getImageSrc(gustatoryResult, "gustatory"),
        getImageSrc(glassResult, "glass"),
      ])
    : [undefined, undefined, undefined, undefined];

  result = {
    isAiGenerated: result.isAiGenerated,
    wineName: result.wineName,
    year: result.year,
    country: result.country,
    wineryName: result.wineryName,
    notes: result.notes,
    corrections: result.corrections,
    pairingRating: result.pairingRating,
    pairingNotes: result.pairingNotes,
    foodToPair: userInput.foodToPair,
    analysis: {
      ...analysisData,
      visual: { ...analysisData.visual, imageUrl: visualUrl },
      olfactory: { ...analysisData.olfactory, imageUrl: olfactoryUrl },
      gustatory: { ...analysisData.gustatory, imageUrl: gustatoryUrl },
      suggestedGlassTypeImageUrl: glassUrl,
    },
  };

  if (typeof userInput.country === "string" && userInput.country.trim()) {
    const provided = userInput.country.trim();
    const identified = String((result as any)?.country || "");
    if (!identified) {
      (result as any).country = provided;
    } else if (_norm(identified) !== _norm(provided)) {
      result.corrections = [...((result as any).corrections || []), { field: "Country", original: provided, corrected: identified }];
    }
  } else {
    throw new Error("Debes indicar el país del vino para continuar el análisis.");
  }

  console.log(`[FLOW] Saving analysis to wineAnalyses for user: ${userInput.uid} | wine: ${((result as any)?.wineName)} | year: ${((result as any)?.year)}`);

  if (!result.isAiGenerated && typeof result.notes === "string") {
    result.notes = result.notes
      .replace(/\s*\[Nota\][^\n]*fuentes verificables\.?/gi, "")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+\./g, ".")
      .trim();
  }

  const countryFix = result.corrections?.find(c => /^(País|Country)$/i.test(c.field));
  if (countryFix && typeof result.notes === "string") {
    const wrong = String(countryFix.original || "").trim();
    const right = String(countryFix.corrected || "").trim();
    if (wrong && right) {
      result.notes = result.notes
        .replace(new RegExp(`\\b${wrong}\\b`, "gi"), right)
        .replace(/(origen|origin)\s+en\s+(francia|france)/gi, `$1 en ${right}`);
      if (/^España$/i.test(right)) {
        result.notes = result.notes.replace(/\bfranc[eé]s(a)?\b/gi, (_m, a) => (a ? "española" : "español"));
      }
      result.notes = result.notes.trim();
    }
  }

  if (userInput.uid) {
    await saveAnalysisToHistory(userInput.uid, result);
  }

  return result;
};
