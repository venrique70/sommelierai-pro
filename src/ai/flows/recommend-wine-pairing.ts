// Recommend a wine to pair with a dish.

'use server';

/**
 * @fileOverview Recommends a wine pairing for a given dish description.
 *
 * - recommendWinePairing - A function that recommends a wine pairing for a given dish description.
 * - RecommendWinePairingInput - The input type for the recommendWinePairing function.
 * - RecommendWinePairingOutput - The return type for the recommendWinePairing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendWinePairingInputSchema = z.object({
  dishDescription: z.string().describe('The description of the dish to pair with wine.'),
});
export type RecommendWinePairingInput = z.infer<typeof RecommendWinePairingInputSchema>;

const RecommendWinePairingOutputSchema = z.object({
  wineRecommendation: z.string().describe('The recommended wine for the dish.'),
  reasoning: z.string().describe('The reasoning behind the wine recommendation.'),
});
export type RecommendWinePairingOutput = z.infer<typeof RecommendWinePairingOutputSchema>;

export async function recommendWinePairing(input: RecommendWinePairingInput): Promise<RecommendWinePairingOutput> {
  return recommendWinePairingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendWinePairingPrompt',
  input: {schema: RecommendWinePairingInputSchema},
  output: {schema: RecommendWinePairingOutputSchema},
  prompt: `You are a sommelier. A user is eating the following dish: {{{dishDescription}}}. Recommend a wine pairing, including a brief explanation of why the pairing works well.`,
});

const recommendWinePairingFlow = ai.defineFlow(
  {
    name: 'recommendWinePairingFlow',
    inputSchema: RecommendWinePairingInputSchema,
    outputSchema: RecommendWinePairingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
