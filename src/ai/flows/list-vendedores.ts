
'use server';
/**
 * @fileOverview A secure Genkit flow to list all users with the 'vendedor' role.
 * This flow is intended to be called only by an administrator and uses the Firebase Admin SDK.
 */

import { ai } from '@/ai/genkit';
import {
  ListVendedoresInputSchema,
  ListVendedoresOutputSchema,
  type ListVendedoresInput,
  type ListVendedoresOutput,
} from '@/lib/schemas';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { z } from 'zod';
import { VendedorSchema } from '@/lib/schemas';
import * as admin from 'firebase-admin';


/**
 * A secure wrapper function that calls the Genkit flow to list sellers.
 * @param input The UID of the admin user.
 * @returns A promise that resolves to a list of sellers or an error.
 */
export async function listVendedores(input: ListVendedoresInput): Promise<ListVendedoresOutput> {
  return listVendedoresFlow(input);
}

const listVendedoresFlow = ai.defineFlow(
  {
    name: 'listVendedoresFlow',
    inputSchema: ListVendedoresInputSchema,
    outputSchema: ListVendedoresOutputSchema,
  },
  async ({ adminUid }) => {
    try {
      // Use Admin SDK for secure access
      const adminApp = getFirebaseAdminApp();
      const dbAdmin = admin.firestore(adminApp);

      // Step 1: Verify the user making the request is an admin.
      const adminUserDoc = await dbAdmin.collection('users').doc(adminUid).get();
      if (!adminUserDoc.exists || adminUserDoc.data()?.role !== 'admin') {
         return { error: 'Acceso Denegado: Tu cuenta no tiene permisos de administrador.' };
      }
      
      // Step 2: Fetch all users with the 'vendedor' role.
      const usersSnapshot = await dbAdmin.collection('users').where('role', '==', 'vendedor').get();
      
      if (usersSnapshot.empty) {
        return { vendedores: [] };
      }

      const vendedores = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: data.uid || doc.id,
          displayName: data.displayName || 'N/A',
          email: data.email || 'N/A',
          role: data.role || 'vendedor',
          activeReferrals: data.activeReferrals || 0,
          totalCommission: data.totalCommission || 0,
        };
      });

      const validatedVendedores = z.array(VendedorSchema).parse(vendedores);

      return { vendedores: validatedVendedores };

    } catch (e: any) {
      console.error('Error in listVendedoresFlow:', e);
      let errorMessage = e.message || 'Ocurrió un error inesperado en el servidor.';
      return { error: `Ocurrió un error inesperado en el servidor: ${errorMessage}` };
    }
  }
);
