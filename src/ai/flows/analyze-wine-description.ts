'use server';
/**
 * @fileOverview Flujo de IA que recomienda vinos por país.
 *
 * - recommendWineByCountry - Recomienda vinos basados en el país especificado.
 * - RecommendWineByCountryInput - El tipo de entrada para la función.
 * - RecommendWineByCountryOutput - El tipo de salida de la función (el JSON de recomendaciones).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Esquema de entrada: país y preferencias opcionales.
const RecommendWineByCountryInputSchema = z.object({
  country: z.string().describe("El país del cual se desean recomendaciones de vinos."),
  preferences: z.string().optional().describe("Preferencias adicionales del usuario, como tipo de vino o maridaje.")
});
export type RecommendWineByCountryInput = z.infer<typeof RecommendWineByCountryInputSchema>;

// Esquema de salida: lista de recomendaciones de vinos.
const RecommendWineByCountryOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      wineName: z.string().describe("El nombre del vino recomendado."),
      winery: z.string().optional().describe("La bodega que produce el vino, si se conoce."),
      grapeVariety: z.string().describe("La variedad de uva o composición del vino."),
      description: z.string().describe("Descripción detallada del vino, incluyendo características sensoriales y razones de la recomendación."),
      rating: z.number().min(1).max(5).describe("Calificación del vino (1-5, donde 5 es excelente).")
    })
  ).min(3).max(5).describe("Lista de 3 a 5 vinos recomendados basados en el país.")
});
export type RecommendWineByCountryOutput = z.infer<typeof RecommendWineByCountryOutputSchema>;

/**
 * Recomienda vinos basados en el país especificado por el usuario.
 * @param input El país y preferencias opcionales.
 * @returns Una promesa que se resuelve con una lista de recomendaciones en formato JSON.
 */
export async function recommendWineByCountry(input: RecommendWineByCountryInput): Promise<RecommendWineByCountryOutput> {
  return recommendWineByCountryFlow(input);
}

// Definición del prompt para la IA.
const recommendWineByCountryPrompt = ai.definePrompt({
  name: 'recommendWineByCountryPrompt',
  model: 'googleai/gemini-2.5-pro',
  input: { schema: RecommendWineByCountryInputSchema },
  output: { format: 'json', schema: RecommendWineByCountryOutputSchema },
  prompt: `
Actúas como un Master Sommelier, certificado por el prestigioso Court of Master Sommeliers. Tu tarea es recomendar una lista de vinos de alta calidad originarios del país especificado por el usuario, considerando cualquier preferencia adicional proporcionada.

Tu tarea es:
1. Basándote en el país proporcionado, identificar y recomendar entre 3 y 5 vinos representativos de alta calidad.
2. Para cada vino, proporcionar: nombre del vino, bodega (si se conoce), variedad de uva, descripción detallada (características sensoriales, estilo, razones para recomendarlo) y una calificación de 1 a 5.
3. Asegúrate de que las recomendaciones sean precisas, basadas en conocimiento verificable, y reflejen la excelencia vinícola del país.
4. Proporcionar la respuesta **EXCLUSIVAMENTE EN ESPAÑOL y en formato JSON**.

El JSON debe contener un campo "recommendations" con una lista de objetos, cada uno con:
- "wineName": El nombre del vino.
- "winery": La bodega (opcional, solo si se conoce con certeza).
- "grapeVariety": La variedad de uva o composición del vino (dejar "" si es desconocida, pero el campo debe existir).
- "description": Descripción detallada del vino, incluyendo características sensoriales y razones de recomendación.
- "rating": Calificación de 1 a 5, donde 5 es excelente.

**Reglas estrictas:**
- No inventes datos. Usa solo información verificable.
- Si el país no tiene una tradición vinícola clara, explica en la descripción por qué las opciones son limitadas.
- Si se proporcionan preferencias, adáptalas a las recomendaciones (e.g., tipo de vino, maridaje).
- Responde únicamente en español, con gramática impecable y vocabulario profesional de sommelier.

**Entrada del usuario:**
- País: {{country}}
{{#if preferences}}- Preferencias: {{preferences}}{{/if}}

Return one valid JSON object only (no markdown, no backticks, no extra text).
  `,
});

// Definición del flujo de Genkit.
const recommendWineByCountryFlow = ai.defineFlow(
  {
    name: 'recommendWineByCountryFlow',
    inputSchema: RecommendWineByCountryInputSchema,
    outputSchema: RecommendWineByCountryOutputSchema,
  },
  async (input) => {
    const { output } = await recommendWineByCountryPrompt(input);
    RecommendWineByCountryOutputSchema.parse(output);
    return output;
  }
);
