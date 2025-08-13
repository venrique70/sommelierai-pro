'use server';
/**
 * @fileOverview Secure server-side flow to fetch a wine analysis detail.
 * Uses Firebase Admin (no client-side security rules involved).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { WineAnalysis } from '@/types';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

type WineAnalysisError = { error: string };

// ── Schemas ───────────────────────────────────────────────────────────────────
const GetAnalysisDetailInputSchema = z.object({
  analysisId: z.string().describe('ID del documento del análisis en Firestore.'),
  uid: z.string().describe('UID del usuario solicitante para verificar propiedad.'),
});
export type GetAnalysisDetailInput = z.infer<typeof GetAnalysisDetailInputSchema>;

const GetAnalysisDetailOutputSchema = z.custom<WineAnalysis | WineAnalysisError>();
export type GetAnalysisDetailOutput = WineAnalysis | WineAnalysisError;

// ── Public API ────────────────────────────────────────────────────────────────
export async function getAnalysisDetail(
  input: GetAnalysisDetailInput
): Promise<GetAnalysisDetailOutput> {
  return getAnalysisDetailFlow(input);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function toISO(ts: any): string | undefined {
  // Convierte admin.firestore.Timestamp o Date a ISO
  if (!ts) return undefined;
  // Timestamp de Admin
  // @ts-ignore
  if (typeof ts?.toDate === 'function') return ts.toDate().toISOString();
  if (ts instanceof Date) return ts.toISOString();
  return undefined;
}

// ── Flow ─────────────────────────────────────────────────────────────────────
const getAnalysisDetailFlow = ai.defineFlow(
  {
    name: 'getAnalysisDetailFlow',
    inputSchema: GetAnalysisDetailInputSchema,
    outputSchema: GetAnalysisDetailOutputSchema,
  },
  async ({ analysisId, uid }) => {
    try {
      if (!analysisId || !uid) return { error: 'Faltan parámetros.' };

      const app = getFirebaseAdminApp();
      const db = admin.firestore(app);

      // 1) Intenta en /history/{analysisId}
      let snap = await db.collection('history').doc(analysisId).get();

      // 2) Si no existe, intenta en /wineAnalyses/{analysisId}
      if (!snap.exists) {
        snap = await db.collection('wineAnalyses').doc(analysisId).get();
        if (!snap.exists) return { error: 'Análisis no encontrado.' };
      }

      const data = snap.data() as any;

      // Validación de propiedad: acepta `uid` o `userId` en el documento
      const ownerUid: string | undefined = data?.uid ?? data?.userId;
      if (!ownerUid || ownerUid !== uid) {
        console.warn(
          `Acceso denegado: uid=${uid} intentó leer analysisId=${analysisId} de owner=${ownerUid}`
        );
        return { error: 'Acceso denegado. No tienes permiso para ver este análisis.' };
      }

      // Normaliza campos comunes
      const createdAtISO = toISO(data?.createdAt) ?? new Date().toISOString();

      // Devuelve el documento tipado (si tu tipo tiene otras props, se mantienen)
      const result: WineAnalysis = {
        ...data,
        createdAt: createdAtISO,
      };

      return result;
    } catch (e: any) {
      console.error('getAnalysisDetail error:', e);
      return { error: e?.message || 'Error interno al obtener el análisis.' };
    }
  }
);
