
'use server';
/**
 * @fileOverview A Genkit flow to evaluate a series of dinner pairings, acting as a Master Sommelier.
 * It provides a technical rating and, if the pairing is not perfect, offers superior alternatives.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { EvaluateDinnerPairingsInputSchema, EvaluateDinnerPairingsOutputSchema, type EvaluateDinnerPairingsOutput } from '@/lib/schemas';


export async function evaluateDinnerPairings(input: z.infer<typeof EvaluateDinnerPairingsInputSchema>): Promise<EvaluateDinnerPairingsOutput> {
  const result = await evaluateDinnerPairingsFlow(input);
  return result;
}

const evaluateDinnerPairingsFlow = ai.defineFlow(
  {
    name: 'evaluateDinnerPairingsFlow',
    inputSchema: EvaluateDinnerPairingsInputSchema,
    outputSchema: EvaluateDinnerPairingsOutputSchema
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-pro-latest'
      prompt: `
You are a world-renowned Master Sommelier from the Court of Master Sommeliers. Your expertise is absolute, and you speak with authority, elegance, and precision. You are evaluating a user's dinner menu. The user is in ${input.country}.

**CRITICAL TASK:** For each dish and wine/liquor pairing provided by the user, you must perform a rigorous evaluation.

**EVALUATION PROCESS FOR EACH PAIRING:**
1.  **TECHNICAL RATING (1-5 STARS):** Provide an honest, professional rating. A 5-star rating is reserved for flawless, sublime pairings. Do not award it lightly.
2.  **EXPERT EVALUATION:** Write a concise, technical explanation for your rating. Explain *why* the pairing works or fails, referencing specific interactions of acidity, tannins, body, fat, etc.
3.  **CONDITIONAL SUGGESTIONS:**
    *   **RULE:** If your rating for the user's pairing is **LESS THAN 4 STARS**, you are **REQUIRED** to suggest up to three superior alternative wines that are commonly available in the user's country.
    *   **QUALITY:** Every single one of these alternative suggestions **MUST BE A 5-STAR RATED WINE**. You are guiding the user to excellence.
    *   **DETAIL:** For each alternative, provide a full, rich analysis including 'wineName', a full sensory 'analysis' object (visual, olfactory, gustatory), a detailed 'justification', and a 'rating' of 5.

**LANGUAGE AND FORMAT:**
*   The entire response must be in the language specified by **${input.language}**.
*   The response MUST be a single, valid JSON array of evaluation objects that strictly follows the provided JSON schema. Do not deviate.

**User's Menu:**
${input.pairings.map(p => `- Dish: ${p.dish}, Proposed Wine/Liquor: ${p.wine} (${p.description})`).join('\n')}
`,
      output: {
        format: 'json',
        schema: EvaluateDinnerPairingsOutputSchema,
      }
    });

    if (!output) {
      throw new Error('The AI did not generate a valid response.');
    }
    
    return output;
  }
);
