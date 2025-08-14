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

// ✅ Usamos los helpers de firebase-admin (no importamos "firebase-admin" directo)
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function approveVendorRequest(
  input: ApproveVendorRequestInput
): Promise<ApproveVendorRequestOutput> {
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
      // ✅ Admin SDK a través de helpers
      const dbAdmin = adminDb();
      const auth = adminAuth();

      // 1) Verificar que quien solicita sea admin
      const adminUserDoc = await dbAdmin.collection('users').doc(adminUid).get();
      if (!adminUserDoc.exists || adminUserDoc.data()?.role !== 'admin') {
        return {
          success: false,
          error: 'Acción no autorizada. Se requieren permisos de administrador.',
        };
      }

      // 2) Cargar el usuario a aprobar
      const userToApproveRef = dbAdmin.collection('users').doc(uidToApprove);
      const userToApproveDoc = await userToApproveRef.get();

      if (!userToApproveDoc.exists) {
        return { success: false, error: 'El usuario a aprobar no fue encontrado.' };
      }

      const userToApproveData = userToApproveDoc.data();
      if (userToApproveData?.vendorRequestStatus !== 'pending') {
        return {
          success: false,
          error: 'El usuario no tiene una solicitud de vendedor pendiente.',
        };
      }

      // 3) Actualizar rol y estado de solicitud
      await userToApproveRef.update({
        role: 'vendedor',
        vendorRequestStatus: 'approved',
        'subscription.plan': 'Sibarita',
      });

      // 4) Actualizar custom claims en Firebase Auth
      await auth.setCustomUserClaims(uidToApprove, { role: 'vendedor' });

      return {
        success: true,
        message: `El usuario ${userToApproveData?.displayName ?? uidToApprove} ha sido aprobado como vendedor.`,
      };
    } catch (e: any) {
      console.error('Error in approveVendorRequestFlow:', e);
      return {
        success: false,
        error: `Ocurrió un error inesperado en el servidor: ${e.message}`,
      };
    }
  }
);
