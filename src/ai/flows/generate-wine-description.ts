'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a detailed description of a wine based on its name.
 *
 * - generateWineDescription - A function that takes a wine name as input and returns a detailed description of the wine.
 * - GenerateWineDescriptionInput - The input type for the generateWineDescription function.
 * - GenerateWineDescriptionOutput - The return type for the generateWineDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWineDescriptionInputSchema = z.object({
  wineName: z.string().describe('The name of the wine (brand, variety).'),
});
export type GenerateWineDescriptionInput = z.infer<typeof GenerateWineDescriptionInputSchema>;

const GenerateWineDescriptionOutputSchema = z.object({
  description: z.string().describe('A detailed description of the wine, including its visual, olfactory, gustative characteristics, and structure.'),
});
export type GenerateWineDescriptionOutput = z.infer<typeof GenerateWineDescriptionOutputSchema>;

export async function generateWineDescription(input: GenerateWineDescriptionInput): Promise<GenerateWineDescriptionOutput> {
  return generateWineDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWineDescriptionPrompt',
  input: {schema: GenerateWineDescriptionInputSchema},
  output: {schema: GenerateWineDescriptionOutputSchema},
  prompt: `You are a sommelier. Generate a detailed description of the following wine, including its visual, olfactory, gustative characteristics, and structure.

Wine Name: {{{wineName}}}

Description:`,
});

const generateWineDescriptionFlow = ai.defineFlow(
  {
    name: 'generateWineDescriptionFlow',
    inputSchema: GenerateWineDescriptionInputSchema,
    outputSchema: GenerateWineDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
