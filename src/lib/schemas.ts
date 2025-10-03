'use server';
/**
 * @fileOverview A Genkit flow to evaluate a series of dinner pairings, acting as a Master Sommelier.
 * It provides a technical rating and, if the pairing is not perfect, offers superior alternatives.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  EvaluateDinnerPairingsInputSchema,
  EvaluateDinnerPairingsOutputSchema,
  type EvaluateDinnerPairingsOutput,
} from '@/lib/schemas';

export async function evaluateDinnerPairings(
  input: z.infer<typeof EvaluateDinnerPairingsInputSchema>
): Promise<EvaluateDinnerPairingsOutput> {
  return evaluateDinnerPairingsFlow(input);
}

const dinnerPairingsPrompt = ai.definePrompt({
  name: 'dinnerPairingsPrompt',
  model: 'googleai/gemini-2.5-pro',
  input: { schema: EvaluateDinnerPairingsInputSchema },
  output: { format: 'json', schema: EvaluateDinnerPairingsOutputSchema },
  prompt: `
You are a world-renowned Master Sommelier from the Court of Master Sommeliers. Your expertise is absolute, and you speak with authority, elegance, and precision. You are evaluating a user's dinner menu. The user is in {{country}}.

**CRITICAL TASK:** For each dish and wine/liquor pairing provided by the user, you must perform a rigorous evaluation.

**EVALUATION PROCESS FOR EACH PAIRING:**
1. **TECHNICAL RATING (1-5 STARS):** Provide an honest, professional rating. A 5-star rating is reserved for flawless, sublime pairings. Do not award it lightly.
2. **EXPERT EVALUATION:** Write a concise, technical explanation for your rating. Explain *why* the pairing works or fails, referencing specific interactions of acidity, tannins, body, fat, etc.
3. **CONDITIONAL SUGGESTIONS:**
   * **RULE:** If your rating for the user's pairing is **LESS THAN 4 STARS**, you are **REQUIRED** to suggest up to three superior alternative wines that are commonly available in the user's country.
   * **QUALITY:** Every single one of these alternative suggestions **MUST BE A 5-STAR RATED WINE**. You are guiding the user to excellence.
   * **DETAIL:** For each alternative, provide a full analysis including 'wineName', a full sensory 'analysis' object (visual, olfactory, gustatory), a detailed 'justification', and a 'rating' of 5.
   * **ANTI-HALLUCINATION:** Only suggest wines you can verify as available in {{country}} based on your training data. If no suitable alternatives exist, explain this in the evaluation.

**LANGUAGE AND FORMAT:**
* The entire response must be in **{{language}}**.
* Return **one JSON array**. Each item **must** have:
  - "pairingDescription": string (resume del pairing del usuario)
  - "rating": number 1–5
  - "evaluation": string (explicación técnica)
  - "suggestionAvailable": boolean (true solo si rating < 4)
  - "sommelierSuggestions": array **solo si** rating < 4, con 1–3 objetos:
      { "wineName": string,
        "analysis": { "visual": string, "olfactory": string, "gustatory": string },
        "justification": string,
        "rating": 5 }
* No añadas claves extra ni envoltorios.

**User's Menu:**
{{#pairings}}- Dish: {{dish}}, Proposed Wine/Liquor: {{wine}} ({{description}})
{{/pairings}}

Return exactly one JSON array only (no wrapper object, no markdown, no backticks, no extra text).
  `,
});

const evaluateDinnerPairingsFlow = ai.defineFlow(
  {
    name: 'evaluateDinnerPairingsFlow',
    inputSchema: EvaluateDinnerPairingsInputSchema,
    outputSchema: EvaluateDinnerPairingsOutputSchema,
  },
  async (input) => {
    try {
      console.log('[DEBUG] EvaluateDinnerPairingsOutputSchema:', EvaluateDinnerPairingsOutputSchema ? 'Defined' : 'Undefined');
      const { output } = await dinnerPairingsPrompt(input);
      const parsedOutput = EvaluateDinnerPairingsOutputSchema.parse(output);
      console.log('[DEBUG] Dinner Pairings Output:', JSON.stringify(parsedOutput, null, 2));
      return parsedOutput as EvaluateDinnerPairingsOutput;
    } catch (error) {
      console.error('[ERROR] Parsing Dinner Pairings Output failed:', error);
      throw new Error('Error al evaluar los maridajes. Por favor, verifica los datos e intenta de nuevo.');
    }
  }
);
