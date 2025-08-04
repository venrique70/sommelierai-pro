
'use server';
/**
 * @fileOverview A secure Genkit flow for an admin to approve a vendor request.
 */

import { ai } from '@/ai/genkit';
import {
  ApproveVendorRequestInputSchema,
  ApproveVendorRequestOutputSchema,
  type ApproveVendorRequestInput,
  type ApproveVendorRequestOutput,
} from '@/lib/schemas';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';


export async function approveVendorRequest(input: ApproveVendorRequestInput): Promise<ApproveVendorRequestOutput> {
  return approveVendorRequestFlow(input);
}

const approveVendorRequestFlow = ai.defineFlow(
  {
    name: 'approveVendorRequestFlow',
    inputSchema: ApproveVendorRequestInputSchema,
    outputSchema: ApproveVendorRequestOutputSchema,
  },
  async ({ adminUid, uidToApprove }) => {
    try {
      const adminApp = getFirebaseAdminApp();
      const dbAdmin = admin.firestore(adminApp);
      const auth = adminApp.auth();

      // 1. Verify the requesting user is an admin
      const adminUserDoc = await dbAdmin.collection('users').doc(adminUid).get();
      if (!adminUserDoc.exists || adminUserDoc.data()?.role !== 'admin') {
        return { success: false, error: 'Acción no autorizada. Se requieren permisos de administrador.' };
      }

      // 2. Get the user document to approve
      const userToApproveRef = dbAdmin.collection('users').doc(uidToApprove);
      const userToApproveDoc = await userToApproveRef.get();

      if (!userToApproveDoc.exists) {
        return { success: false, error: 'El usuario a aprobar no fue encontrado.' };
      }
      
      const userToApproveData = userToApproveDoc.data();
      if (userToApproveData?.vendorRequestStatus !== 'pending') {
         return { success: false, error: 'El usuario no tiene una solicitud de vendedor pendiente.' };
      }

      // 3. Update the user's role and request status
      await userToApproveRef.update({
        role: 'vendedor',
        vendorRequestStatus: 'approved',
        'subscription.plan': 'Sibarita', // Asignar plan Sibarita al aprobar
      });

      // (Opcional pero recomendado) Actualizar custom claims en Firebase Auth
      await auth.setCustomUserClaims(uidToApprove, { role: 'vendedor' });

      return { success: true, message: `El usuario ${userToApproveData.displayName} ha sido aprobado como vendedor.` };

    } catch (e: any) {
      console.error('Error in approveVendorRequestFlow:', e);
      return { success: false, error: `Ocurrió un error inesperado en el servidor: ${e.message}` };
    }
  }
);
