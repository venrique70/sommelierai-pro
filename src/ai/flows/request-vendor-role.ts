
'use server';
/**
 * @fileOverview A Genkit flow for a user to request the 'vendedor' (vendor) role.
 */

import { ai } from '@/ai/genkit';
import {
  RequestVendorRoleInputSchema,
  RequestVendorRoleOutputSchema,
  type RequestVendorRoleInput,
  type RequestVendorRoleOutput,
} from '@/lib/schemas';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';


export async function requestVendorRole(input: RequestVendorRoleInput): Promise<RequestVendorRoleOutput> {
  return requestVendorRoleFlow(input);
}

const requestVendorRoleFlow = ai.defineFlow(
  {
    name: 'requestVendorRoleFlow',
    inputSchema: RequestVendorRoleInputSchema,
    outputSchema: RequestVendorRoleOutputSchema,
  },
  async ({ uid }) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { success: false, error: 'El perfil de usuario no existe.' };
      }

      const userData = userSnap.data();

      if (userData.role === 'vendedor' || userData.role === 'admin') {
         return { success: false, error: 'Ya tienes un rol de vendedor o superior.' };
      }

      if (userData.vendorRequestStatus === 'pending') {
          return { success: false, error: 'Ya tienes una solicitud pendiente.' };
      }

      // Update the user's document to mark that they have requested the role
      await updateDoc(userRef, {
        vendorRequestStatus: 'pending',
        vendorRequestedAt: serverTimestamp()
      });
      
      // Here you could also trigger an email notification to the admin
      // For now, the admin will see it in their dashboard.

      return { success: true, message: 'Tu solicitud ha sido registrada.' };

    } catch (e: any) {
      console.error(`Error in requestVendorRoleFlow for user ${uid}:`, e);
      return { success: false, error: `Ocurrió un error inesperado: ${e.message}` };
    }
  }
);
