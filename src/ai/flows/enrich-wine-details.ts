
'use server';
/**
 * @fileOverview This file defines a Genkit flow for enriching wine details.
 * It takes a wine name and grape variety and returns a more detailed description.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const EnrichWineDetailsInputSchema = z.object({
  wineName: z.string().describe('The name of the wine (brand and variety).'),
  grapeVariety: z.string().describe('The grape variety of the wine.'),
});
export type EnrichWineDetailsInput = z.infer<typeof EnrichWineDetailsInputSchema>;

const EnrichWineDetailsOutputSchema = z.object({
  description: z.string().describe('A detailed description of the wine, including its visual, olfactory, gustative characteristics, and structure.'),
  visual: z.object({
    description: z.string(),
    imageUrl: z.string().url().optional(),
  }),
  olfactory: z.object({
    description: z.string(),
    imageUrl: z.string().url().optional(),
  }),
  gustatory: z.object({
    description: z.string(),
    imageUrl: z.string().url().optional(),
  }),
});
export type EnrichWineDetailsOutput = z.infer<typeof EnrichWineDetailsOutputSchema>;

/**
 * Enriches wine details by generating descriptions and image URLs.
 * @param input The wine name and grape variety.
 * @returns A promise that resolves to the enriched wine details.
 */
export async function enrichWineDetails(input: EnrichWineDetailsInput): Promise<EnrichWineDetailsOutput> {
  return enrichWineDetailsFlow(input);
}

const enrichWineDetailsPrompt = ai.definePrompt({
  name: 'enrichWineDetailsPrompt',
  input: { schema: EnrichWineDetailsInputSchema },
  output: { schema: EnrichWineDetailsOutputSchema },
  prompt: `
You are a sommelier. Generate a detailed description for the following wine:
- Wine Name: {{{wineName}}}
- Grape Variety: {{{grapeVariety}}}

Provide a general description, as well as detailed visual, olfactory, and gustatory analyses.
For each of the visual, olfactory, and gustatory analyses, also provide a placeholder image URL: https://placehold.co/512x512.png
`,
});

const enrichWineDetailsFlow = ai.defineFlow(
  {
    name: 'enrichWineDetailsFlow',
    inputSchema: EnrichWineDetailsInputSchema,
    outputSchema: EnrichWineDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await enrichWineDetailsPrompt(input);
    if (!output) {
      throw new Error('The AI did not generate a valid response.');
    }
    return output;
  }
);
