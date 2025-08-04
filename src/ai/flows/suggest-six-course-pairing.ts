
'use server';
/**
 * @fileOverview Recommends a wine for each course of a six-course meal and explains the pairing.
 *
 * - suggestSixCoursePairing - A function that handles the wine pairing suggestion process.
 * - SuggestSixCoursePairingInput - The input type for the suggestSixCoursePairing function.
 * - SuggestSixCoursePairingOutput - The return type for the suggestSixCoursePairing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSixCoursePairingInputSchema = z.object({
  entrada: z.string().describe('Description of the appetizer.'),
  primerPlato: z.string().describe('Description of the first course.'),
  segundoPlato: z.string().describe('Description of the second course.'),
  tercerPlato: z.string().describe('Description of the third course.'),
  cuartoPlato: z.string().describe('Description of the fourth course.'),
  postre: z.string().describe('Description of the dessert.'),
});
export type SuggestSixCoursePairingInput = z.infer<typeof SuggestSixCoursePairingInputSchema>;

const SuggestSixCoursePairingOutputSchema = z.object({
  winePairingEntrada: z.string().describe('Wine pairing suggestion for the appetizer with explanation.'),
  winePairingPrimerPlato: z.string().describe('Wine pairing suggestion for the first course with explanation.'),
  winePairingSegundoPlato: z.string().describe('Wine pairing suggestion for the second course with explanation.'),
  winePairingTercerPlato: z.string().describe('Wine pairing suggestion for the third course with explanation.'),
  winePairingCuartoPlato: z.string().describe('Wine pairing suggestion for the fourth course with explanation.'),
  winePairingPostre: z.string().describe('Wine pairing suggestion for the dessert with explanation.'),
});
export type SuggestSixCoursePairingOutput = z.infer<typeof SuggestSixCoursePairingOutputSchema>;

export async function suggestSixCoursePairing(input: SuggestSixCoursePairingInput): Promise<SuggestSixCoursePairingOutput> {
  return suggestSixCoursePairingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSixCoursePairingPrompt',
  input: {schema: SuggestSixCoursePairingInputSchema},
  output: {schema: SuggestSixCoursePairingOutputSchema},
  prompt: `You are a world-class sommelier. You are given a description of a six-course meal.
For each course, recommend a wine pairing and explain your reasoning. Be concise but elegant in your explanations.

Entrada: {{{entrada}}}
Primer Plato: {{{primerPlato}}}
Segundo Plato: {{{segundoPlato}}}
Tercer Plato: {{{tercerPlato}}}
Cuarto Plato: {{{cuartoPlato}}}
Postre: {{{postre}}}

Provide a pairing for each of the six courses.
`,
});

const suggestSixCoursePairingFlow = ai.defineFlow(
  {
    name: 'suggestSixCoursePairingFlow',
    inputSchema: SuggestSixCoursePairingInputSchema,
    outputSchema: SuggestSixCoursePairingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
