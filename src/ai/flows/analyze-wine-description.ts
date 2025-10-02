'use server';
/**
 * @fileOverview Flujo de IA que actúa como un sommelier profesional para analizar un vino.
 *
 * - analyzeWineDescription - Realiza un análisis sensorial completo a partir de una descripción.
 * - AnalyzeWineDescriptionInput - El tipo de entrada para la función.
 * - AnalyzeWineDescriptionOutput - El tipo de salida de la función (el JSON del análisis).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Esquema de entrada: una descripción textual del vino.
const AnalyzeWineDescriptionInputSchema = z.object({
  photoDataUri: z.string().describe(
    "A photo of a wine tasting note or label, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  )
});
export type AnalyzeWineDescriptionInput = z.infer<typeof AnalyzeWineDescriptionInputSchema>;

// Esquema de salida: el objeto JSON con el análisis del sommelier.
const AnalyzeWineDescriptionOutputSchema = z.object({
  nombreVino: z.string().describe('El nombre del vino o una descripción breve si no se especifica.'),
  calificacion: z.number().min(1).max(5).describe('Una calificación del 1 al 5, donde 5 es excelente.'),
  analisisExperto: z.string().describe('Un párrafo detallado con el análisis sensorial (apariencia visual, perfil olfativo, gusto, taninos, temperatura recomendada, potencial de guarda y maridajes sugeridos).'),
});
export type AnalyzeWineDescriptionOutput = z.infer<typeof AnalyzeWineDescriptionOutputSchema>;

/**
 * Realiza un análisis sensorial profesional de un vino basado en su descripción.
 * @param input La descripción del vino.
 * @returns Una promesa que se resuelve con el análisis en formato JSON.
 */
export async function analyzeWineDescription(input: AnalyzeWineDescriptionInput): Promise<AnalyzeWineDescriptionOutput> {
  return analyzeWineDescriptionFlow(input);
}

// Definición del prompt para la IA.
const prompt = ai.definePrompt({
  name: 'analyzeWineDescriptionPrompt',
  model: 'googleai/gemini-2.5-pro',
  input: { schema: AnalyzeWineDescriptionInputSchema },
  output: {
    format: 'json',
    schema: AnalyzeWineDescriptionOutputSchema,
  },
  prompt: `
Actúas como un Master Sommelier, certificado por el prestigioso Court of Master Sommeliers. Se te proporcionará una imagen que contiene una ficha de cata o una descripción de un vino.

Tu tarea es:
1. Extraer el texto relevante de la imagen.
2. Basándote en ese texto, realizar un análisis sensorial completo del vino descrito, con la elegancia y precisión que te caracterizan.
3. Proporcionar la respuesta **EXCLUSIVAMENTE EN ESPAÑOL y en formato JSON**.

El JSON debe contener los siguientes campos en español:
- "nombreVino": El nombre del vino o una descripción breve si no se especifica.
- "calificacion": Una calificación del 1 al 5, donde 5 es excelente, basada en la descripción.
- "analisisExperto": Un párrafo detallado con el análisis sensorial (apariencia visual, perfil olfativo, gusto, taninos, temperatura recomendada, potencial de guarda y maridajes sugeridos) que sintetice y elabore la información del texto extraído.

Asegúrate de que todo el contenido dentro del campo "analisisExperto" esté perfectamente redactado en español, con gramática impecable y vocabulario profesional de sommelier.

Imagen con la descripción del vino a analizar:
{{media url=photoDataUri}}

Por favor, proporciona únicamente el objeto JSON como respuesta.
  `,
});

// Definición del flujo de Genkit.
const analyzeWineDescriptionFlow = ai.defineFlow(
  {
    name: 'analyzeWineDescriptionFlow',
    inputSchema: AnalyzeWineDescriptionInputSchema,
    outputSchema: AnalyzeWineDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    // Aseguramos que la salida no sea nula.
    if (!output) {
      throw new Error('La IA no generó una respuesta válida.');
    }
    return output;
  }
);
