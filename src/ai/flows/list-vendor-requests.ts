
'use server';
/**
 * @fileOverview A secure Genkit flow for an admin to list pending vendor requests.
 */

import { ai } from '@/ai/genkit';
import {
  ListVendorRequestsInputSchema,
  ListVendorRequestsOutputSchema,
  type ListVendorRequestsInput,
  type ListVendorRequestsOutput,
  VendorRequestSchema,
} from '@/lib/schemas';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { z } from 'zod';
import * as admin from 'firebase-admin';


export async function listVendorRequests(input: ListVendorRequestsInput): Promise<ListVendorRequestsOutput> {
  return listVendorRequestsFlow(input);
}

const listVendorRequestsFlow = ai.defineFlow(
  {
    name: 'listVendorRequestsFlow',
    inputSchema: ListVendorRequestsInputSchema,
    outputSchema: ListVendorRequestsOutputSchema,
  },
  async ({ adminUid }) => {
    try {
      const adminApp = getFirebaseAdminApp();
      const dbAdmin = admin.firestore(adminApp);

      // 1. Verify the user is an admin
      const adminUserDoc = await dbAdmin.collection('users').doc(adminUid).get();
      if (!adminUserDoc.exists || adminUserDoc.data()?.role !== 'admin') {
        return { error: 'Acción no autorizada. Se requieren permisos de administrador.' };
      }

      // 2. Fetch users with a pending vendor request
      const requestsSnapshot = await dbAdmin.collection('users')
        .where('vendorRequestStatus', '==', 'pending')
        .get();
        
      if (requestsSnapshot.empty) {
        return { requests: [] };
      }

      const requests = requestsSnapshot.docs.map(doc => {
        const data = doc.data();
        const requestedAt = data.vendorRequestedAt?.toDate ? data.vendorRequestedAt.toDate().toISOString() : new Date().toISOString();
        return {
          uid: doc.id,
          displayName: data.displayName || 'N/A',
          email: data.email || 'N/A',
          requestedAt: requestedAt
        };
      });

      const validatedRequests = z.array(VendorRequestSchema).parse(requests);

      return { requests: validatedRequests };

    } catch (e: any) {
      console.error('Error in listVendorRequestsFlow:', e);
      return { error: `Ocurrió un error inesperado en el servidor: ${e.message}` };
    }
  }
);
