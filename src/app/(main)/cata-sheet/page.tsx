'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// ✅ ya NO exportamos estos
const AnalyzeWineDescriptionInputSchema = z.object({
  photoDataUri: z.string().min(50).describe("data:<mimetype>;base64,<...>"),
});

const AnalyzeWineDescriptionOutputSchema = z.object({
  nombreVino: z.string().min(1),     // evita string vacío
  calificacion: z.number().int().min(1).max(5), // fuerza entero 1–5
  analisisExperto: z.string(),
});

const prompt = ai.definePrompt({
  name: 'analyzeWineDescriptionPrompt',
  model: 'googleai/gemini-2.5-pro',
  input: { schema: AnalyzeWineDescriptionInputSchema },
  output: { format: 'json', schema: AnalyzeWineDescriptionOutputSchema },
  prompt: `
Eres Master Sommelier. Debes basarte EXCLUSIVAMENTE en el texto que puedas leer en la imagen.
- NO inventes nombres, añadas ni descripciones que no estén legibles.
- Si el nombre del vino no se puede leer claramente, usa "Desconocido".
- Si el texto es insuficiente, pon calificacion = 1 y explica que no se pudo leer suficiente texto.
- "calificacion" debe ser un ENTERO de 1 a 5.

IMAGEN A ANALIZAR:
{{media url=photoDataUri}}

Devuelve solo este JSON:
{
  "nombreVino": string,
  "calificacion": number (1-5 entero),
  "analisisExperto": string
}

Return one valid JSON object only (no markdown, no backticks, no extra text).
  `,
});

// ✅ ÚNICA exportación
export async function analyzeWineDescription(input: { photoDataUri: string }) {
  const { output } = await prompt(input);
  return AnalyzeWineDescriptionOutputSchema.parse(output);
}
