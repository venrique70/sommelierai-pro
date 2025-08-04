
'use server';
/**
 * @fileOverview A Genkit flow to delete a wine from a user's personal cellar in Firestore.
 */

import { ai } from '@/ai/genkit';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import {
  DeleteWineFromCellarInputSchema,
  DeleteWineFromCellarOutputSchema,
  type DeleteWineFromCellarInput,
  type DeleteWineFromCellarOutput,
} from '@/lib/schemas';


export async function deleteWineFromCellar(input: DeleteWineFromCellarInput): Promise<DeleteWineFromCellarOutput> {
  return deleteWineFromCellarFlow(input);
}

const deleteWineFromCellarFlow = ai.defineFlow(
  {
    name: 'deleteWineFromCellarFlow',
    inputSchema: DeleteWineFromCellarInputSchema,
    outputSchema: DeleteWineFromCellarOutputSchema,
  },
  async ({ uid, wineId }) => {
    try {
      const wineDocRef = doc(db, 'users', uid, 'cellar', wineId);
      await deleteDoc(wineDocRef);

      return { success: true };

    } catch (e: any) {
      console.error(`Error in deleteWineFromCellarFlow for user ${uid}:`, e);
      let errorMessage = `Ocurrió un error inesperado al eliminar el vino. Detalle: ${e.message}`;
      return { success: false, error: errorMessage };
    }
  }
);
