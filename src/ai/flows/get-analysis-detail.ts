
'use server';
/**
 * @fileOverview A secure Genkit flow to get the full details of a specific wine analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { WineAnalysis, WineAnalysisError } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';


// Esquema de entrada: ID del documento y UID del usuario (para verificación de propiedad).
const GetAnalysisDetailInputSchema = z.object({
  analysisId: z.string().describe('The ID of the wine analysis document in Firestore.'),
  uid: z.string().describe('The UID of the user requesting the detail, for ownership verification.'),
});
export type GetAnalysisDetailInput = z.infer<typeof GetAnalysisDetailInputSchema>;

// Esquema de salida: el objeto de análisis completo o un error.
// Usamos z.any() porque el tipo WineAnalysis es complejo y ya está definido en TypeScript.
const GetAnalysisDetailOutputSchema = z.custom<WineAnalysis | WineAnalysisError>();
export type GetAnalysisDetailOutput = WineAnalysis | WineAnalysisError;


export async function getAnalysisDetail(input: GetAnalysisDetailInput): Promise<GetAnalysisDetailOutput> {
   return getAnalysisDetailFlow(input);
}

const getAnalysisDetailFlow = ai.defineFlow(
  {
    name: 'getAnalysisDetailFlow',
    inputSchema: GetAnalysisDetailInputSchema,
    outputSchema: GetAnalysisDetailOutputSchema,
  },
  async ({ analysisId, uid }) => {
    try {
      const docRef = doc(db, 'wineAnalyses', analysisId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists) {
        return { error: 'Análisis no encontrado.' };
      }

      const data = docSnap.data() as WineAnalysis;

      // Security Check: Ensure the requested analysis belongs to the user making the request.
      if (data.userId !== uid) {
        console.warn(`Security warning: User ${uid} attempted to access analysis ${analysisId} belonging to user ${data.userId}.`);
        return { error: 'Acceso denegado. No tienes permiso para ver este análisis.' };
      }
      
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();

      return { ...data, createdAt };

    } catch (e: any) {
      console.error(`Error in getAnalysisDetailFlow for user ${uid}, analysis ${analysisId}:`, e);
      return { error: `Ocurrió un error inesperado al recuperar el detalle del análisis: ${e.message}` };
    }
  }
);
