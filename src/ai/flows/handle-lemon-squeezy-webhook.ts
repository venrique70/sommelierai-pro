"use server";
/**
 * Webhook para procesar pagos de Lemon Squeezy y actualizar el plan del usuario.
 * Soporta nombres con acentos, capitalización y variantes "anual/yearly".
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { adminDb } from "@/lib/firebase-admin";

// ===== Schemas =====
const LemonSqueezyWebhookInputSchema = z.object({
  user_email: z.string().email().describe("Correo del comprador"),
  plan_name: z.string().describe('Nombre del plan recibido desde Lemon (ej.: "Iniciado", "Copa Premium").'),
});
export type LemonSqueezyWebhookInput = z.infer<typeof LemonSqueezyWebhookInputSchema>;

const LemonSqueezyWebhookOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type LemonSqueezyWebhookOutput = z.infer<typeof LemonSqueezyWebhookOutputSchema>;

// ===== Utilidades =====
const rmAccents = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const normalize = (s?: string) => rmAccents(String(s ?? "").trim()).toLowerCase();
const isYearly = (name: string) => /\b(yearly|anual)\b/i.test(name);

// ===== Claves internas + límites (en línea con src/lib/auth.ts) =====
type PlanKey = "descubrete" | "iniciado" | "una copa" | "copa premium" | "sibarita";
const INTERNAL_LIMITS: Record<PlanKey, { analyzeWine: number; recommendWine: number; pairDinner: number }> = {
  descubrete:   { analyzeWine: 5,  recommendWine: 1,  pairDinner: 0 },
  iniciado:     { analyzeWine: 8,  recommendWine: 2,  pairDinner: 0 },
  "una copa":   { analyzeWine: 12, recommendWine: 5,  pairDinner: 2 },
  "copa premium": { analyzeWine: 30, recommendWine: 15, pairDinner: 10 },
  sibarita:     { analyzeWine: Infinity, recommendWine: Infinity, pairDinner: Infinity },
};

const DISPLAY_NAME: Record<PlanKey, string> = {
  descubrete: "Descúbrete",
  iniciado: "Iniciado",
  "una copa": "Una Copa",
  "copa premium": "Copa Premium",
  sibarita: "Sibarita",
};

// Mapeo por NOMBRE que llega desde Lemon (minúsculas y sin acentos) → clave interna
const NAME_TO_PLANKEY: Record<string, PlanKey> = {
  descubrete: "descubrete",
  iniciado: "iniciado",
  "una copa": "una copa",
  "copa premium": "copa premium",
  sibarita: "sibarita",
  default: "iniciado", // por si en algún evento viene "Default"
};

// ===== Flow =====
export async function handleLemonSqueezyWebhook(
  input: LemonSqueezyWebhookInput
): Promise<LemonSqueezyWebhookOutput> {
  return handleLemonSqueezyWebhookFlow(input);
}

export const handleLemonSqueezyWebhookFlow = ai.defineFlow(
  {
    name: "handleLemonSqueezyWebhookFlow",
    inputSchema: LemonSqueezyWebhookInputSchema,
    outputSchema: LemonSqueezyWebhookOutputSchema,
  },
  async ({ user_email, plan_name }) => {
    // 1) Resolver plan interno desde el nombre recibido
    const baseKey = NAME_TO_PLANKEY[normalize(plan_name)];
    if (!baseKey) {
      const msg = `Plan no reconocido: ${plan_name}`;
      console.error(msg);
      return { success: false, message: msg };
    }
    const yearly = isYearly(plan_name);

    // 2) Datos del plan
    const limits = INTERNAL_LIMITS[baseKey];
    const display = yearly ? `${DISPLAY_NAME[baseKey]} Anual` : DISPLAY_NAME[baseKey];

    try {
      const db = adminDb();

      // 3) Buscar usuario por email
      const snap = await db.collection("users").where("email", "==", user_email).limit(1).get();
      if (snap.empty) throw new Error(`Usuario con email ${user_email} no encontrado.`);
      const userRef = snap.docs[0].ref;

      // 4) Calcular renovación
      const renewalDate = new Date();
      yearly ? renewalDate.setFullYear(renewalDate.getFullYear() + 1) : renewalDate.setMonth(renewalDate.getMonth() + 1);

      // 5) Actualizar plan y límites
      await userRef.update({
        "subscription.plan": display,
        "subscription.status": "active",
        "subscription.renewalDate": renewalDate,
        "usage.analyzeWine.current": 0,
        "usage.analyzeWine.limit": limits.analyzeWine,
        "usage.recommendWine.current": 0,
        "usage.recommendWine.limit": limits.recommendWine,
        "usage.pairDinner.current": 0,
        "usage.pairDinner.limit": limits.pairDinner,
      });

      const message = `Plan '${display}' asignado a ${user_email}.`;
      console.log(message);
      return { success: true, message };
    } catch (e: any) {
      console.error(`Error crítico procesando webhook de Lemon para ${user_email}:`, e);
      return { success: false, message: `Error al procesar webhook: ${e.message}` };
    }
  }
);
