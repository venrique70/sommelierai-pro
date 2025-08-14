'use server';
/**
 * @fileOverview Webhook para procesar pagos de Lemon Squeezy y actualizar el plan del usuario.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminDb } from '@/lib/firebase-admin'; // ✅ usamos helper de admin

// --- Esquemas de Entrada y Salida ---
const LemonSqueezyWebhookInputSchema = z.object({
  user_email: z.string().email().describe('El correo electrónico del usuario que realizó la compra.'),
  plan_name: z.string().describe('El nombre del plan comprado en Lemon Squeezy (ej. "Starter", "Pro").'),
});
export type LemonSqueezyWebhookInput = z.infer<typeof LemonSqueezyWebhookInputSchema>;

const LemonSqueezyWebhookOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type LemonSqueezyWebhookOutput = z.infer<typeof LemonSqueezyWebhookOutputSchema>;

// --- Mapeo de Planes y Límites ---
const planLimits = {
  'Descubrete': { planName: 'Descúbrete', analyzeWine: 5, recommendWine: 1, pairDinner: 0 },
  'Iniciado': { planName: 'Iniciado', analyzeWine: 8, recommendWine: 2, pairDinner: 0 },
  'Una Copa': { planName: 'Una Copa', analyzeWine: 12, recommendWine: 5, pairDinner: 2 },
  'Copa Premium': { planName: 'Copa Premium', analyzeWine: 30, recommendWine: 15, pairDinner: 10 },
  'Sibarita': { planName: 'Sibarita', analyzeWine: 60, recommendWine: 20, pairDinner: 15 },
  'Descubrete - Yearly': { planName: 'Descúbrete', analyzeWine: 5, recommendWine: 1, pairDinner: 0 },
  'Iniciado - Yearly': { planName: 'Iniciado', analyzeWine: 8, recommendWine: 2, pairDinner: 0 },
  'Una Copa - Yearly': { planName: 'Una Copa', analyzeWine: 12, recommendWine: 5, pairDinner: 2 },
  'Copa Premium - Yearly': { planName: 'Copa Premium', analyzeWine: 30, recommendWine: 15, pairDinner: 10 },
  'Sibarita - Yearly': { planName: 'Sibarita', analyzeWine: 60, recommendWine: 20, pairDinner: 15 },
};
type LemonSqueezyPlanName = keyof typeof planLimits;

// --- Flujo Principal del Webhook ---
export async function handleLemonSqueezyWebhook(
  input: LemonSqueezyWebhookInput
): Promise<LemonSqueezyWebhookOutput> {
  return handleLemonSqueezyWebhookFlow(input);
}

const handleLemonSqueezyWebhookFlow = ai.defineFlow(
  {
    name: 'handleLemonSqueezyWebhookFlow',
    inputSchema: LemonSqueezyWebhookInputSchema,
    outputSchema: LemonSqueezyWebhookOutputSchema,
  },
  async ({ user_email, plan_name }) => {
    const planKey = plan_name as LemonSqueezyPlanName;
    if (!(planKey in planLimits)) {
      const errorMessage = `Plan no reconocido: ${plan_name}`;
      console.error(errorMessage);
      return { success: false, message: errorMessage };
    }

    try {
      const db = adminDb(); // ✅ Firestore Admin listo

      // 1) Encontrar al usuario por su email
      const usersRef = db.collection('users');
      const userQuery = await usersRef.where('email', '==', user_email).limit(1).get();

      if (userQuery.empty) {
        throw new Error(`Usuario con email ${user_email} no encontrado en la base de datos.`);
      }

      const userDoc = userQuery.docs[0];
      const userRef = userDoc.ref;
      const planDetails = planLimits[planKey];

      // 2) Preparar los datos de actualización
      const renewalDate = new Date();
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

      // 3) Actualizar el documento del usuario
      await userRef.update(subscriptionUpdate);

      const message = `Éxito: El plan '${planDetails.planName}' fue asignado a ${user_email} (UID: ${userDoc.id}).`;
      console.log(message);
      return { success: true, message };
    } catch (e: any) {
      console.error(`Error crítico en el flujo del webhook para ${user_email}:`, e);
      return { success: false, message: `Ocurrió un error inesperado al procesar el webhook: ${e.message}` };
    }
  }
);
