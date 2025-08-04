
'use server';
/**
 * @fileOverview A secure Genkit flow for an admin to list corporate information requests.
 */

import { ai } from '@/ai/genkit';
import {
  ListCorporateRequestsInputSchema,
  ListCorporateRequestsOutputSchema,
  type ListCorporateRequestsInput,
  type ListCorporateRequestsOutput,
} from '@/lib/schemas';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { z } from 'zod';
import { CorporateRequestSchema } from '@/lib/schemas';
import * as admin from 'firebase-admin';


export async function listCorporateRequests(input: ListCorporateRequestsInput): Promise<ListCorporateRequestsOutput> {
  return listCorporateRequestsFlow(input);
}

const listCorporateRequestsFlow = ai.defineFlow(
  {
    name: 'listCorporateRequestsFlow',
    inputSchema: ListCorporateRequestsInputSchema,
    outputSchema: ListCorporateRequestsOutputSchema,
  },
  async ({ adminUid }) => {
    try {
      // Use Admin SDK for secure access
      const adminApp = getFirebaseAdminApp();
      const dbAdmin = admin.firestore(adminApp);

      // 1. Verify the requesting user is an admin
      const adminUserDoc = await dbAdmin.collection('users').doc(adminUid).get();
      if (!adminUserDoc.exists || adminUserDoc.data()?.role !== 'admin') {
        return { error: 'Acción no autorizada. Se requieren permisos de administrador.' };
      }

      // 2. Fetch all corporate requests
      const requestsRef = dbAdmin.collection('corporateRequests');
      const q = requestsRef.orderBy('requestedAt', 'desc');
      const requestsSnapshot = await q.get();

      if (requestsSnapshot.empty) {
        return { requests: [] };
      }

      const requests = requestsSnapshot.docs.map(doc => {
        const data = doc.data();
        const requestedAtDate = data.requestedAt?.toDate ? data.requestedAt.toDate() : new Date();
        return {
          id: doc.id,
          companyName: data.companyName || 'N/A',
          contactName: data.contactName || 'N/A',
          contactEmail: data.contactEmail || 'N/A',
          accessCode: data.accessCode || 'N/A',
          requestedAt: requestedAtDate.toISOString(),
        };
      });
      
      const validatedRequests = z.array(CorporateRequestSchema).parse(requests);

      return { requests: validatedRequests };

    } catch (e: any) {
      console.error('Error in listCorporateRequestsFlow:', e);
      return { error: `Ocurrió un error inesperado en el servidor: ${e.message}` };
    }
  }
);
