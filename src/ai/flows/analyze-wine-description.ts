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
- Si el texto es insuficiente, pon calificacion = 1.
- Si el nombre es "Desconocido" O el texto es insuficiente, NO escribas un análisis sensorial: en "analisisExperto" escribe solo una frase explicando que no se pudo analizar porque el texto es ilegible o insuficiente y que se necesita otra foto. No incluyas descriptores sensoriales en ese caso.
- "calificacion" debe ser un ENTERO de 1 a 5.

IMAGEN A ANALIZAR:
{{media url=photoDataUri}}

PASOS:
1) Transcribe fielmente el texto legible a "ocrText" (líneas separadas por saltos).
2) Si "nombreVino" NO aparece en "ocrText" (ignorando mayúsculas/acentos), usa "Desconocido" y calificacion=1 y NO hagas análisis sensorial.
3) Si hay texto suficiente y el nombre es legible, entonces sí redacta "analisisExperto".

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
  // Valida con el schema extendido (incluye ocrText)
  const data = AnalyzeWineDescriptionOutputSchema
    .extend({ ocrText: z.string().min(1) })
    .parse(output);

  const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
  const ocr = norm(data.ocrText || '');
  const name = norm(data.nombreVino || '');
  const letters = (s: string) => (s || '').replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '').length;

  const lowEvidence = letters(ocr) < 25; // umbral de evidencia mínima

  if (lowEvidence || name === 'desconocido' || (name && !ocr.includes(name))) {
    // Forzamos salida “no analizable”
    return {
      nombreVino: 'Desconocido',
      calificacion: 1,
      analisisExperto:
        'No se pudo realizar el análisis sensorial porque el texto de la etiqueta es ilegible o insuficiente. Por favor, retoma la foto acercando la cámara y evitando reflejos.',
    };
  }

  // Si pasó las verificaciones, devolvemos lo validado (sin ocrText)
  return {
    nombreVino: data.nombreVino,
    calificacion: data.calificacion,
    analisisExperto: data.analisisExperto,
  };
}
