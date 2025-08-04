
'use server';
/**
 * @fileOverview A Genkit flow to verify an access code and return corporate plan details.
 */

import { ai } from '@/ai/genkit';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { GetCorporateInfoInputSchema, GetCorporateInfoOutputSchema, GetCorporateInfoOutput } from '@/lib/schemas';

// Static plan data, same as used on the frontend, but held on the server for verification.
const corporatePlansData = {
  copaPremium: {
    name: 'Plan Copa Premium',
    features: ['30 Análisis Sensoriales al mes', '15 Recomendaciones de Vino', '10 Cenas Maridaje'],
    pricing: [
      { subscriptions: 10, monthly: 117.9, yearly: 1109.9 },
      { subscriptions: 15, monthly: 176.9, yearly: 1664.9 },
      { subscriptions: 20, monthly: 235.9, yearly: 2219.9 },
      { subscriptions: 25, monthly: 294.9, yearly: 2774.9 },
    ],
  },
  sibarita: {
    name: 'Plan Sibarita',
    features: [
      '60 Análisis Sensoriales al mes',
      '20 Recomendaciones de Vino',
      '15 Cenas Maridaje',
      'Análisis por Ficha',
      'Mi Bodega Personal',
      'Mi Historial de Análisis',
      'Mi Carta (Restaurante)',
      'Acceso anticipado a funciones beta',
      'Acumulación de análisis no utilizados',
      'Reconocimiento como Embajador',
    ],
    pricing: [
      { subscriptions: 10, monthly: 179.9, yearly: 1707.9 },
      { subscriptions: 15, monthly: 269.9, yearly: 2651.9 },
      { subscriptions: 20, monthly: 362.9, yearly: 3416.9 },
      { subscriptions: 25, monthly: 453.9, yearly: 4269.9 },
    ],
  },
};

export async function getCorporateInfo(input: { accessCode: string }): Promise<GetCorporateInfoOutput> {
  return getCorporateInfoFlow(input);
}

const getCorporateInfoFlow = ai.defineFlow(
  {
    name: 'getCorporateInfoFlow',
    inputSchema: GetCorporateInfoInputSchema,
    outputSchema: GetCorporateInfoOutputSchema,
  },
  async ({ accessCode }) => {
    try {
      const q = query(
        collection(db, 'corporateRequests'),
        where('accessCode', '==', accessCode),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: false, error: 'El código de acceso no es válido o ha expirado.' };
      }

      // If the code is valid, return the static plan data.
      return { success: true, data: corporatePlansData };

    } catch (e: any) {
      console.error('Error in getCorporateInfoFlow:', e);
      return { success: false, error: 'Ocurrió un error en el servidor al verificar el código.' };
    }
  }
);
