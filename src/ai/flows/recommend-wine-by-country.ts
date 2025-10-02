'use server';
/**
 * @fileOverview This file defines a Genkit flow for recommending wines based on a dish and country.
 *
 * It takes a description of a dish and the user's country, and returns a list of
 * up to three suitable wine recommendations, complete with sensory analysis for each.
 */
import { toJson } from '@/lib/ai-json';
import { RecommendWineByCountryOutputSchema } from '@/lib/schemas';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { RecommendWineByCountryInputSchema, type RecommendWineByCountryOutput } from '@/lib/schemas';

/**
 * Recommends wines for a dish, considering the user's country.
 * @param input The dish description and country.
 * @returns A promise that resolves to an array of wine recommendations.
 */
export async function recommendWineByCountry(input: z.infer<typeof RecommendWineByCountryInputSchema>): Promise<RecommendWineByCountryOutput> {
  return recommendWineByCountryFlow(input);
}

const recommendWineByCountryPrompt = ai.definePrompt({
  name: 'recommendWineByCountryPrompt',
  model: 'googleai/gemini-2.5-pro',
  input: { schema: RecommendWineByCountryInputSchema },
  output: { format: 'json' },
  prompt: `
You are a Master Sommelier. A user is eating the following dish: "{{dishDescription}}".
Your task is to recommend FIVE excellent wines that are commonly available in {{country}} to pair with this dish. They do not have to be from that country, just available there.

**CRITICAL INSTRUCTION:**
- The response MUST be entirely in the language specified by **{{language}}**.
- The first THREE recommendations must be 5-star rated wines.
- The next TWO recommendations must be 4-star rated wines.

For each recommendation, you must provide the following in a single JSON array:
- \`wineName\`: (string) The full name of the recommended wine.
- \`justificacionExperta\`: (string) A concise, elegant, and expert justification for the pairing. This should merge sensory notes of the wine with the reasons it pairs well with the dish. The justification MUST be in {{language}}.
- \`rating\`: (number) Your personal rating of the wine pairing on a scale of 1 to 5, following the critical instruction above.

Dish: {{dishDescription}}
Country: {{country}}
Language: {{language}}

Provide only the JSON array of exactly 5 items as your response.
`,
});

const recommendWineByCountryFlow = ai.defineFlow(
  {
    name: 'recommendWineByCountryFlow',
    inputSchema: RecommendWineByCountryInputSchema,
    outputSchema: RecommendWineByCountryOutputSchema,
  },
  async (input) => {
    const gen = await recommendWineByCountryPrompt(input);
    const output = RecommendWineByCountryOutputSchema.parse(toJson(gen));
    return output;
  }
);
