'use server';

/**
 * @fileOverview Generates illustrative images based on wine descriptors.
 *
 * - generateDescriptorImages - A function that generates images based on wine descriptors.
 * - GenerateDescriptorImagesInput - The input type for the generateDescriptorImages function.
 * - GenerateDescriptorImagesOutput - The return type for the generateDescriptorImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDescriptorImagesInputSchema = z.object({
  visual: z.string().describe('Visual descriptors of the wine (color, intensity, limpidity, tear, evolution).'),
  olfactory: z.string().describe('Olfactory descriptors of the wine (primary, secondary, tertiary aromas, intensity, complexity).'),
  gustatory: z.string().describe('Gustatory descriptors of the wine (attack, acidity, body, tannins, balance, aftertaste).'),
  structural: z.string().describe('Structural descriptors of the wine (persistence, harmony, elegance, rusticity).'),
  suggestedPlates: z.string().describe('Suggested food pairings with the wine.'),
});
export type GenerateDescriptorImagesInput = z.infer<typeof GenerateDescriptorImagesInputSchema>;

const GenerateDescriptorImagesOutputSchema = z.object({
  visualImage: z.string().describe('Data URI of the generated image for visual descriptors.'),
  olfactoryImage: z.string().describe('Data URI of the generated image for olfactory descriptors.'),
  gustatoryImage: z.string().describe('Data URI of the generated image for gustatory descriptors.'),
  structuralImage: z.string().describe('Data URI of the generated image for structural descriptors.'),
  suggestedPlatesImage: z.string().describe('Data URI of the generated image for suggested food pairings.'),
});
export type GenerateDescriptorImagesOutput = z.infer<typeof GenerateDescriptorImagesOutputSchema>;

export async function generateDescriptorImages(input: GenerateDescriptorImagesInput): Promise<GenerateDescriptorImagesOutput> {
  return generateDescriptorImagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDescriptorImagesPrompt',
  input: {schema: GenerateDescriptorImagesInputSchema},
  output: {schema: GenerateDescriptorImagesOutputSchema},
  prompt: `You are an AI image generator specializing in wine descriptors.

  Generate images based on the provided descriptors to visually represent the wine's characteristics.

  Visual Descriptors: {{{visual}}}
  Olfactory Descriptors: {{{olfactory}}}
  Gustatory Descriptors: {{{gustatory}}}
  Structural Descriptors: {{{structural}}}
  Suggested Food Pairings: {{{suggestedPlates}}}

  Generate corresponding images for each descriptor and suggested plates.
  Ensure each image accurately reflects the provided descriptors.

  Output the images as data URIs.
`,
});

const generateDescriptorImagesFlow = ai.defineFlow(
  {
    name: 'generateDescriptorImagesFlow',
    inputSchema: GenerateDescriptorImagesInputSchema,
    outputSchema: GenerateDescriptorImagesOutputSchema,
  },
  async input => {
    const visualResult = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate an image for the following visual descriptor: ${input.visual}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    const olfactoryResult = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate an image for the following olfactory descriptor: ${input.olfactory}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    const gustatoryResult = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate an image for the following gustatory descriptor: ${input.gustatory}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    const structuralResult = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate an image for the following structural descriptor: ${input.structural}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    const suggestedPlatesResult = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate an image for the following suggested food pairings: ${input.suggestedPlates}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {
      visualImage: visualResult.media!.url,
      olfactoryImage: olfactoryResult.media!.url,
      gustatoryImage: gustatoryResult.media!.url,
      structuralImage: structuralResult.media!.url,
      suggestedPlatesImage: suggestedPlatesResult.media!.url,
    };
  }
);
