'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// ===== Schemas =====
export const AnalyzeWineDescriptionInputSchema = z.object({
  photoDataUri: z.string().min(50).describe("data:<mimetype>;base64,<...>"),
});
export type AnalyzeWineDescriptionInput = z.infer<typeof AnalyzeWineDescriptionInputSchema>;

export const AnalyzeWineDescriptionOutputSchema = z.object({
  nombreVino: z.string(),
  calificacion: z.number().min(1).max(5),
  analisisExperto: z.string(),
});
export type AnalyzeWineDescriptionOutput = z.infer<typeof AnalyzeWineDescriptionOutputSchema>;

// ===== Prompt Genkit (SO estricto) =====
const prompt = ai.definePrompt({
  name: 'analyzeWineDescriptionPrompt',
  model: 'googleai/gemini-2.5-pro',
  input: { schema: AnalyzeWineDescriptionInputSchema },
  output: { format: 'json', schema: AnalyzeWineDescriptionOutputSchema },
  prompt: `
Actúas como Master Sommelier. A partir del texto presente en la imagen, devuelve:
- "nombreVino" (string)
- "calificacion" (1-5)
- "analisisExperto" (texto profesional, rico y preciso).

Return one valid JSON object only (no markdown, no backticks, no extra text).
  `,
});

// ===== Server Action invocable desde cliente =====
export async function analyzeWineDescription(
  input: AnalyzeWineDescriptionInput
): Promise<AnalyzeWineDescriptionOutput> {
  const { output } = await prompt(input);
  return AnalyzeWineDescriptionOutputSchema.parse(output);
}
