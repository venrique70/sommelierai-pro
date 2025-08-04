
'use server';
/**
 * @fileOverview A Genkit flow to list all wines from a user's personal cellar.
 */

import { ai } from '@/ai/genkit';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import {
  ListWinesFromCellarInputSchema,
  ListWinesFromCellarOutputSchema,
  type ListWinesFromCellarInput,
  type ListWinesFromCellarOutput,
} from '@/lib/schemas';
import { z } from 'zod';
import { WineInCellarSchema } from '@/lib/schemas';

/**
 * Retrieves the list of wines from a user's cellar.
 * @param input The UID of the user.
 * @returns A promise that resolves to the list of wines or an error.
 */
export async function listWinesFromCellar(input: ListWinesFromCellarInput): Promise<ListWinesFromCellarOutput> {
  return listWinesFromCellarFlow(input);
}

const listWinesFromCellarFlow = ai.defineFlow(
  {
    name: 'listWinesFromCellarFlow',
    inputSchema: ListWinesFromCellarInputSchema,
    outputSchema: ListWinesFromCellarOutputSchema,
  },
  async ({ uid }) => {
    try {
      const cellarCollectionRef = collection(db, 'users', uid, 'cellar');
      const q = query(cellarCollectionRef, orderBy('dateAdded', 'desc'));
      const cellarSnapshot = await getDocs(q);
      
      if (cellarSnapshot.empty) {
        return { success: true, wines: [] };
      }

      const wines = cellarSnapshot.docs.map(doc => {
        const data = doc.data();
        const dateAdded = data.dateAdded?.toDate ? data.dateAdded.toDate().toISOString() : new Date().toISOString();
        
        return {
          id: doc.id,
          name: data.name || 'N/A',
          variety: data.variety || 'N/A',
          year: data.year || 0,
          quantity: data.quantity || 0,
          status: data.status || "Listo para Beber",
          dateAdded: dateAdded,
        };
      });

      const validatedWines = z.array(WineInCellarSchema).parse(wines);
      return { success: true, wines: validatedWines };

    } catch (e: any)
      {
      console.error(`Error in listWinesFromCellarFlow for user ${uid}:`, e);
      let errorMessage = `Ocurrió un error inesperado al cargar tu bodega. Detalle: ${e.message}`;
      return { success: false, error: errorMessage };
    }
  }
);
