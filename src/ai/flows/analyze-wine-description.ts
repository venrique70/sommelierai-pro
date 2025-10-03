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
  ocrText: z.string().min(1),     // ← texto transcrito de la etiqueta
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

PASOS:
1) Transcribe fielmente el texto visible de la etiqueta a "ocrText" (líneas separadas por saltos).
2) Si "nombreVino" NO aparece literalmente dentro de "ocrText" (ignorando mayúsculas/acentos), establece "nombreVino":"Desconocido" y "calificacion":1.
3) Escribe "analisisExperto" basado SOLO en lo legible, sin inventar.

Devuelve solo este JSON:
{
  "nombreVino": string,
  "calificacion": number (1-5 entero),
  "analisisExperto": string,
  "ocrText": string
}

Return one valid JSON object only (no markdown, no backticks, no extra text).
  `,
});

// ✅ ÚNICA exportación
export async function analyzeWineDescription(input: { photoDataUri: string }) {
  const { output } = await prompt(input);
  const data = AnalyzeWineDescriptionOutputSchema.parse(output);

  // Normaliza (quita acentos y pasa a minúsculas)
  const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
  const ocr = norm(data.ocrText || '');
  const name = norm(data.nombreVino || '');

  // Si el nombre no aparece en el OCR, marca como desconocido y baja calificación
  if (name.length < 3 || (name !== 'desconocido' && !ocr.includes(name))) {
    data.nombreVino = 'Desconocido';
    data.calificacion = 1;
    // (opcional) añade una nota breve al análisis si no la trae
    if (!/no se pudo leer|insuficiente|ilegible/i.test(data.analisisExperto)) {
      data.analisisExperto = `${data.analisisExperto}\n\nNota: no se pudo verificar el nombre en el texto de la etiqueta, por lo que se marca como Desconocido.`;
    }
  }
  return data;
}
