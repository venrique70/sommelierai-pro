'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// ✅ ya NO exportamos estos
const AnalyzeWineDescriptionInputSchema = z.object({
  photoDataUri: z.string().min(50).describe("data:<mimetype>;base64,<...>"),
});

const AnalyzeWineDescriptionOutputSchema = z.object({
  nombreVino: z.string(),
  calificacion: z.number().min(1).max(5),
  analisisExperto: z.string(),
});

const prompt = ai.definePrompt({
  name: 'analyzeWineDescriptionPrompt',
  model: 'googleai/gemini-2.5-pro',
  input: { schema: AnalyzeWineDescriptionInputSchema },
  output: { format: 'json', schema: AnalyzeWineDescriptionOutputSchema },
  prompt: `
Actúas como Master Sommelier...
Return one valid JSON object only (no markdown, no backticks, no extra text).
  `,
});

// ✅ ÚNICA exportación
export async function analyzeWineDescription(input: { photoDataUri: string }) {
  const { output } = await prompt(input);
  return AnalyzeWineDescriptionOutputSchema.parse(output);
}
