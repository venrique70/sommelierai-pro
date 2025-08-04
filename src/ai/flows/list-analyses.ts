
'use server';
/**
 * @fileOverview A secure Genkit flow to list all wine analyses for a user.
 * This flow is intended to be called only by an authenticated user.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// Esquema de entrada: UID del usuario autenticado.
const ListAnalysesInputSchema = z.object({
  uid: z.string().describe('The UID of the user requesting their analysis history.'),
});
export type ListAnalysesInput = z.infer<typeof ListAnalysesInputSchema>;

// Esquema para un solo análisis en la lista (un subconjunto de los datos completos).
const AnalysisSummarySchema = z.object({
  id: z.string(),
  wineName: z.string(),
  year: z.number(),
  grapeVariety: z.string().optional(),
  createdAt: z.string(), // Usamos string para el timestamp serializado
  imageUrl: z.string().url().optional(),
});

// Esquema de salida: una lista de resúmenes de análisis o un error.
const ListAnalysesOutputSchema = z.object({
  analyses: z.array(AnalysisSummarySchema).optional(),
  error: z.string().optional(),
});
export type ListAnalysesOutput = z.infer<typeof ListAnalysesOutputSchema>;

/**
 * A secure wrapper function that calls the Genkit flow to list wine analyses.
 * @param input The UID of the user.
 * @returns A promise that resolves to a list of analyses or an error.
 */
export async function listAnalyses(input: ListAnalysesInput): Promise<ListAnalysesOutput> {
  return listAnalysesFlow(input);
}

const listAnalysesFlow = ai.defineFlow(
  {
    name: 'listAnalysesFlow',
    inputSchema: ListAnalysesInputSchema,
    outputSchema: ListAnalysesOutputSchema,
  },
  async ({ uid }) => {
    try {
      const analysesRef = collection(db, 'wineAnalyses');
      const q = query(
        analysesRef,
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(20) // Example limit for pagination
      );
      
      const analysesSnapshot = await getDocs(q);
      
      if (analysesSnapshot.empty) {
        return { analyses: [] };
      }

      const analyses = analysesSnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
        
        return {
          id: doc.id,
          wineName: data.wineName || 'N/A',
          year: data.year || 0,
          grapeVariety: data.analysis?.grapeVariety,
          createdAt: createdAtDate.toISOString(),
          imageUrl: data.analysis?.visual?.imageUrl,
        };
      });

      const validatedAnalyses = z.array(AnalysisSummarySchema).parse(analyses);
      return { analyses: validatedAnalyses };

    } catch (e: any) {
      console.error(`Error in listAnalysesFlow for user ${uid}:`, e);
      let errorMessage = `Ocurrió un error inesperado al recuperar tu historial. Detalle: ${e.message}`;
      return { error: errorMessage };
    }
  }
);
