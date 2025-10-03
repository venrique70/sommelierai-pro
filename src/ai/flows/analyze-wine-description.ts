import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  RecommendWineByCountryInputSchema,     // <- alias de RecommendWineSchema (dishDescription, country, language)
  RecommendWineByCountryOutputSchema,    // <- array de recomendaciones
  type RecommendWineByCountryOutput,
} from '@/lib/schemas';

export async function recommendWineByCountry(
  input: z.infer<typeof RecommendWineByCountryInputSchema>
): Promise<RecommendWineByCountryOutput> {
  'use server';
  return recommendWineByCountryFlow(input);
}

const recommendWineByCountryPrompt = ai.definePrompt({
  name: 'recommendWineByCountryPrompt',
  model: 'googleai/gemini-2.5-pro',
  input: { schema: RecommendWineByCountryInputSchema },
  output: { format: 'json', schema: RecommendWineByCountryOutputSchema }, // <- ARRAY
  prompt: `
Actúas como un Master Sommelier. 
Recomienda entre 3 y 5 vinos (array) adecuados para el platillo y país dados.

Devuelve **un ARRAY JSON** únicamente. Cada item debe tener:
- "wineName": string
- "justificacionExperta": string (explica por qué marida)
- "rating": number (1–5)

Entrada del usuario:
- Platillo: {{dishDescription}}
- País: {{country}}
- Idioma: {{language}}

Return exactly one JSON array only (no wrapper object, no markdown, no backticks, no extra text).
  `,
});

const recommendWineByCountryFlow = ai.defineFlow(
  {
    name: 'recommendWineByCountryFlow',
    inputSchema: RecommendWineByCountryInputSchema,
    outputSchema: RecommendWineByCountryOutputSchema, // <- ARRAY
  },
  async (input) => {
    const { output } = await recommendWineByCountryPrompt(input);
    RecommendWineByCountryOutputSchema.parse(output);
    return output; // <- array que la UI ya mapea con result.map(...)
  }
);
