
'use server';
/**
 * @fileOverview A Genkit flow to update a wine in a user's personal cellar in Firestore.
 */

import { ai } from '@/ai/genkit';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import {
  UpdateWineInCellarServerSchema,
  UpdateWineInCellarOutputSchema,
  type UpdateWineInCellarInput,
  type UpdateWineInCellarOutput,
  type WineInCellar,
} from '@/lib/schemas';


export async function updateWineInCellar(input: UpdateWineInCellarInput): Promise<UpdateWineInCellarOutput> {
  return updateWineInCellarFlow(input);
}

const updateWineInCellarFlow = ai.defineFlow(
  {
    name: 'updateWineInCellarFlow',
    inputSchema: UpdateWineInCellarServerSchema,
    outputSchema: UpdateWineInCellarOutputSchema,
  },
  async ({ uid, wineId, ...updateData }) => {
    try {
      const wineDocRef = doc(db, 'users', uid, 'cellar', wineId);
      
      await updateDoc(wineDocRef, updateData);
      const updatedDoc = await getDoc(wineDocRef);
      const wineData = updatedDoc.data();

      if (!wineData) {
        throw new Error("Could not retrieve updated wine data.");
      }
      
      const updatedWine: WineInCellar = {
        id: wineId,
        name: wineData.name,
        variety: wineData.variety,
        year: wineData.year,
        quantity: wineData.quantity,
        status: wineData.status,
        dateAdded: wineData.dateAdded.toDate().toISOString(),
      };

      return { success: true, updatedWine: updatedWine };

    } catch (e: any) {
      console.error(`Error in updateWineInCellarFlow for user ${uid}:`, e);
      let errorMessage = `Ocurrió un error inesperado al actualizar el vino. Detalle: ${e.message}`;
      return { success: false, error: errorMessage };
    }
  }
);
