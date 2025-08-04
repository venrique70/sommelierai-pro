
'use server';
/**
 * @fileOverview A Genkit flow for processing affiliate commissions for a given month.
 * This flow is intended to be triggered manually by an administrator.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

// --- Schemas ---

const ProcessCommissionsInputSchema = z.object({
  month: z.number().min(1).max(12).describe('The month (1-12) to process commissions for.'),
  year: z.number().min(2023).describe('The year to process commissions for.'),
});
export type ProcessCommissionsInput = z.infer<typeof ProcessCommissionsInputSchema>;

const ProcessCommissionsOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  processedAffiliates: z.number().optional(),
  totalCommissionCalculated: z.number().optional(),
});
export type ProcessCommissionsOutput = z.infer<typeof ProcessCommissionsOutputSchema>;


// --- Commission & Plan Logic ---

const commissionTiers = {
  "Nuevo": { req: 0, "Iniciado": 0, "Una Copa": 0, "Copa Premium": 0, "Sibarita": 0 },
  "Pregrado": { req: 5, "Iniciado": 0.05, "Una Copa": 0.08, "Copa Premium": 0.10, "Sibarita": 0.15 },
  "Bachelor": { req: 10, "Iniciado": 0.07, "Una Copa": 0.10, "Copa Premium": 0.12, "Sibarita": 0.17 },
  "Pro": { req: 20, "Iniciado": 0.09, "Una Copa": 0.12, "Copa Premium": 0.15, "Sibarita": 0.18 },
  "Master": { req: 30, "Iniciado": 0.11, "Una Copa": 0.15, "Copa Premium": 0.17, "Sibarita": 0.20 },
};
type TierName = keyof typeof commissionTiers;

const planPrices = {
  'Iniciado': 3.99,
  'Una Copa': 7.99,
  'Copa Premium': 12.99,
  'Sibarita': 19.99,
};
type PlanName = keyof typeof planPrices;

// --- Main Flow ---

export async function processAffiliateCommissions(input: ProcessCommissionsInput): Promise<ProcessCommissionsOutput> {
  return processAffiliateCommissionsFlow(input);
}

const processAffiliateCommissionsFlow = ai.defineFlow(
  {
    name: 'processAffiliateCommissionsFlow',
    inputSchema: ProcessCommissionsInputSchema,
    outputSchema: ProcessCommissionsOutputSchema,
  },
  async ({ month, year }) => {
    try {
      const adminApp = getFirebaseAdminApp();
      if (!adminApp) {
        throw new Error('Server Credentials Error: Firebase Admin could not be initialized.');
      }
      const dbAdmin = admin.firestore(adminApp);

      // 1. Get all affiliates (vendedores)
      const affiliatesSnapshot = await dbAdmin.collection('users').where('role', '==', 'vendedor').get();
      if (affiliatesSnapshot.empty) {
        return { success: true, message: "No affiliates (vendedores) found to process." };
      }

      let totalCommission = 0;
      const batch = dbAdmin.batch();

      // For now, we simulate referrals as we don't have the tracking yet.
      // In a real scenario, you would query a 'referrals' collection.
      const allUsersSnapshot = await dbAdmin.collection('users').where('subscription.plan', '!=', 'Descubrete').get();
      
      for (const affiliateDoc of affiliatesSnapshot.docs) {
        const affiliateId = affiliateDoc.id;
        const affiliateData = affiliateDoc.data();
        
        // SIMULATION: Assign some users to this affiliate for calculation purposes.
        // This part needs to be replaced with actual referral data.
        const mockReferredUsers = allUsersSnapshot.docs.filter(doc => (doc.id.charCodeAt(0) % affiliatesSnapshot.size) === (affiliateId.charCodeAt(0) % affiliatesSnapshot.size));
        const activeReferralsCount = mockReferredUsers.length;
        
        // 2. Determine affiliate's tier
        let affiliateTier: TierName = "Nuevo";
        if (activeReferralsCount >= 30) affiliateTier = "Master";
        else if (activeReferralsCount >= 20) affiliateTier = "Pro";
        else if (activeReferralsCount >= 10) affiliateTier = "Bachelor";
        else if (activeReferralsCount >= 5) affiliateTier = "Pregrado";

        // 3. Calculate commission for this affiliate based on their mock referrals
        let affiliateMonthlyCommission = 0;
        mockReferredUsers.forEach(userDoc => {
            const userData = userDoc.data();
            const planName = userData.subscription?.plan as PlanName;
            if(planName && planPrices[planName]) {
                const planPrice = planPrices[planName];
                const commissionRate = commissionTiers[affiliateTier][planName] ?? 0;
                affiliateMonthlyCommission += planPrice * commissionRate;
            }
        });

        totalCommission += affiliateMonthlyCommission;

        // 4. Update the affiliate's document in Firestore
        const affiliateRef = dbAdmin.collection('users').doc(affiliateId);
        batch.update(affiliateRef, {
            activeReferrals: activeReferralsCount,
            totalCommission: FieldValue.increment(affiliateMonthlyCommission),
            // We could also store historical data
            [`commissionHistory.${year}-${month}`]: affiliateMonthlyCommission,
        });
      }

      // 5. Commit all updates in a single batch
      await batch.commit();

      const message = `Successfully processed commissions for ${month}/${year}. Affiliates processed: ${affiliatesSnapshot.size}. Total commission calculated: $${totalCommission.toFixed(2)}`;
      console.log(message);
      return { 
          success: true, 
          message,
          processedAffiliates: affiliatesSnapshot.size,
          totalCommissionCalculated: totalCommission,
      };

    } catch (e: any) {
      console.error(`Critical error in commissions flow for ${month}/${year}:`, e);
      return { success: false, message: `An unexpected error occurred: ${e.message}` };
    }
  }
);
