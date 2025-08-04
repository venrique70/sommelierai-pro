
'use server';
/**
 * @fileOverview A Genkit flow to add a wine to a user's personal cellar in Firestore.
 * 
 * - addWineToCellar - Adds a wine to the cellar.
 * - AddWineToCellarInput - The input type for the flow.
 * - AddWineToCellarOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  AddWineToCellarServerSchema,
  AddWineToCellarOutputSchema,
  type AddWineToCellarInput,
  type AddWineToCellarOutput,
  type WineInCellar,
} from '@/lib/schemas';
import { doc } from 'firebase/firestore';


/**
 * Adds a wine to the user's cellar subcollection in Firestore.
 * @param input The wine details and user UID.
 * @returns A promise that resolves to the result of the operation.
 */
export async function addWineToCellar(input: AddWineToCellarInput): Promise<AddWineToCellarOutput> {
  return addWineToCellarFlow(input);
}

const addWineToCellarFlow = ai.defineFlow(
  {
    name: 'addWineToCellarFlow',
    inputSchema: AddWineToCellarServerSchema,
    outputSchema: AddWineToCellarOutputSchema,
  },
  async (input) => {
    try {
      const userCellarRef = collection(db, 'users', input.uid, 'cellar');

      const wineData = {
        name: input.name,
        variety: input.variety,
        year: input.year,
        quantity: input.quantity,
        status: input.status,
        dateAdded: serverTimestamp(),
      };

      const docRef = await addDoc(userCellarRef, wineData);
      
      const newWine: WineInCellar = {
        ...input,
        id: docRef.id,
        dateAdded: new Date().toISOString(),
      }

      return { success: true, wineId: docRef.id, wine: newWine };

    } catch (e: any) {
      console.error(`Error in addWineToCellarFlow for user ${input.uid}:`, e);
      let errorMessage = `Ocurrió un error inesperado al guardar el vino. Detalle: ${e.message}`;
      return { success: false, error: errorMessage };
    }
  }
);
