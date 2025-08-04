
'use server';
/**
 * @fileOverview A Genkit flow for an affiliate to register a corporate sale.
 * This flow will eventually calculate commissions.
 */

import { ai } from '@/ai/genkit';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import {
    RegisterCorporateSaleInput,
    RegisterCorporateSaleOutputSchema,
    RegisterCorporateSaleSchema,
} from '@/lib/schemas';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export async function registerCorporateSale(input: RegisterCorporateSaleInput): Promise<{ success: boolean; message?: string; error?: string }> {
  return registerCorporateSaleFlow(input);
}

const registerCorporateSaleFlow = ai.defineFlow(
  {
    name: 'registerCorporateSaleFlow',
    inputSchema: RegisterCorporateSaleSchema,
    outputSchema: RegisterCorporateSaleOutputSchema,
  },
  async ({ vendedorUid, accessCode, plan, subscriptions, billingCycle }) => {
    try {
        const adminApp = getFirebaseAdminApp();
        const dbAdmin = admin.firestore(adminApp);

        // 1. Verify the company exists with the given access code
        const corporateReqQuery = query(
            collection(db, 'corporateRequests'),
            where('accessCode', '==', accessCode)
        );
        const corporateReqSnapshot = await getDocs(corporateReqQuery);

        if (corporateReqSnapshot.empty) {
            return { success: false, error: 'No se encontró ninguna empresa con ese código de acceso.' };
        }

        const companyDoc = corporateReqSnapshot.docs[0];
        const companyName = companyDoc.data().companyName;

        // 2. TODO: Calculate commission based on the corporate commission structure.
        // For now, we just log the sale. In the future, this would calculate the amount
        // and update the affiliate's `totalCommission` field.
        const commissionAmount = 0; // Placeholder

        // 3. Log the sale event (e.g., in a 'sales' collection or update the affiliate)
        console.log(`Sale registered by affiliate ${vendedorUid}:
            - Company: ${companyName} (${accessCode})
            - Plan: ${plan}
            - Subscriptions: ${subscriptions}
            - Cycle: ${billingCycle}
            - Commission: $${commissionAmount} (placeholder)
        `);

        // Example of how you might update the affiliate's stats in the future
        // const affiliateRef = dbAdmin.collection('users').doc(vendedorUid);
        // await affiliateRef.update({
        //     totalCommission: increment(commissionAmount),
        //     corporateSales: increment(1)
        // });


      return { success: true, message: `Venta para ${companyName} registrada con éxito.` };

    } catch (e: any) {
      console.error(`Error in registerCorporateSaleFlow for affiliate ${vendedorUid}:`, e);
      return { success: false, error: `Ocurrió un error inesperado en el servidor: ${e.message}` };
    }
  }
);
