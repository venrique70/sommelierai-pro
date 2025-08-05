
'use server';
/**
 * @fileOverview Webhook para procesar pagos de PayPal y actualizar el plan del usuario.
 * 
 * - handlePaypalWebhook - Procesa el webhook, encuentra al usuario y actualiza su plan.
 * - PaypalWebhookInput - El tipo de entrada para la función (datos del webhook).
 * - PaypalWebhookOutput - El tipo de salida de la función.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

// --- Esquemas de Entrada y Salida ---

const PaypalWebhookInputSchema = z.any().describe('El payload completo del webhook de PayPal.');
export type PaypalWebhookInput = z.infer<typeof PaypalWebhookInputSchema>;

const PaypalWebhookOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type PaypalWebhookOutput = z.infer<typeof PaypalWebhookOutputSchema>;

// --- Mapeo de Planes y Límites ---
// Maps PayPal Plan ID to internal plan names and limits.
const planLimits = {
  // Mensuales
  'P-03451566SM055894PNCEVTYQ': { planName: 'Iniciado', analyzeWine: 8, recommendWine: 2, pairDinner: 0 },
  'P-6V154660MP480493JNCEVZMQ': { planName: 'Una Copa', analyzeWine: 12, recommendWine: 5, pairDinner: 2 },
  'P-82K13295DW5680202NCEV2WY': { planName: 'Copa Premium', analyzeWine: 30, recommendWine: 15, pairDinner: 10 },
  'P-0JK36575PD651091NNCEV3RA': { planName: 'Sibarita', analyzeWine: 60, recommendWine: 20, pairDinner: 15 },
  // Anuales
  'P-6C360058FU8751411NCEVI2A': { planName: 'Iniciado', analyzeWine: 8, recommendWine: 2, pairDinner: 0 },
  'P-73Y70148Y9205371BNCEVPDY': { planName: 'Una Copa', analyzeWine: 12, recommendWine: 5, pairDinner: 2 },
  'P-48C0924078583004PNCEVQBY': { planName: 'Copa Premium', analyzeWine: 30, recommendWine: 15, pairDinner: 10 },
  'P-03U55368J9946653MNCEVRLQ': { planName: 'Sibarita', analyzeWine: 60, recommendWine: 20, pairDinner: 15 },
};
type PayPalPlanId = keyof typeof planLimits;


// --- Flujo Principal del Webhook ---

export async function handlePaypalWebhook(input: PaypalWebhookInput): Promise<PaypalWebhookOutput> {
  return handlePaypalWebhookFlow(input);
}

const handlePaypalWebhookFlow = ai.defineFlow(
  {
    name: 'handlePaypalWebhookFlow',
    inputSchema: PaypalWebhookInputSchema,
    outputSchema: PaypalWebhookOutputSchema,
  },
  async (payload) => {
    
    // Extraer la información necesaria del payload de PayPal
    const planId = payload.resource?.plan_id as PayPalPlanId;
    const userEmail = payload.resource?.subscriber?.email_address;
    const subscriptionStatus = payload.resource?.status;

    if (subscriptionStatus !== 'ACTIVE') {
      const message = `Subscription status is not ACTIVE for user ${userEmail}. Status: ${subscriptionStatus}. Ignoring.`;
      console.log(message);
      return { success: true, message };
    }

    if (!planId || !userEmail) {
      const errorMessage = `Payload de PayPal inválido. Falta plan_id o email del suscriptor.`;
      console.error(errorMessage, { planId, userEmail });
      return { success: false, message: errorMessage };
    }

    if (!(planId in planLimits)) {
      const errorMessage = `Plan de PayPal no reconocido: ${planId}`;
      console.error(errorMessage);
      return { success: false, message: errorMessage };
    }

    try {
      const adminApp = getFirebaseAdminApp();
      if (!adminApp) {
        throw new Error('Error de Credenciales del Servidor: No se pudo inicializar Firebase Admin.');
      }

      const db = adminApp.firestore();
      
      const usersRef = db.collection('users');
      const userQuery = await usersRef.where('email', '==', userEmail).limit(1).get();

      if (userQuery.empty) {
        throw new Error(`Usuario con email ${userEmail} no encontrado en la base de datos.`);
      }

      const userDoc = userQuery.docs[0];
      const userRef = userDoc.ref;
      const planDetails = planLimits[planId];

      const renewalDate = new Date();
      // Asume renovación mensual por simplicidad, PayPal lo maneja.
      renewalDate.setMonth(renewalDate.getMonth() + 1); 

      const subscriptionUpdate = {
        'subscription.plan': planDetails.planName,
        'subscription.status': 'active',
        'subscription.renewalDate': renewalDate,
        'usage.analyzeWine.current': 0,
        'usage.analyzeWine.limit': planDetails.analyzeWine,
        'usage.recommendWine.current': 0,
        'usage.recommendWine.limit': planDetails.recommendWine,
        'usage.pairDinner.current': 0,
        'usage.pairDinner.limit': planDetails.pairDinner,
      };

      await userRef.update(subscriptionUpdate);

      const message = `Éxito con PayPal: El plan '${planDetails.planName}' fue asignado a ${userEmail} (UID: ${userDoc.id}).`;
      console.log(message);
      return { success: true, message };

    } catch (e) {
  const error = e instanceof Error ? e : new Error('Error desconocido');
  console.error(`Error crítico en el flujo del webhook de PayPal para ${userEmail}:`, error);
  return { success: false, message: `Ocurrió un error inesperado al procesar el webhook de PayPal: ${error.message}` };
}

  }
);
