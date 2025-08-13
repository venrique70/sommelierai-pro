'use server';
/**
 * Server-side list of analyses for the logged-in user.
 * Uses Firebase Admin (no client-side security rules involved).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

type AnalysisSummary = {
  id: string;
  wineName: string;
  grapeVariety?: string;
  year?: number;
  imageUrl?: string;
  createdAt: string; // ISO
};

export type ListAnalysesOutput =
  | { analyses: AnalysisSummary[] }
  | { error: string };

const InputSchema = z.object({
  uid: z.string().min(1, 'uid requerido'),
  limit: z.number().min(1).max(200).optional(),
});

function toISO(ts: any): string | undefined {
  if (!ts) return undefined;
  // admin.firestore.Timestamp
  // @ts-ignore
  if (typeof ts?.toDate === 'function') return ts.toDate().toISOString();
  if (ts instanceof Date) return ts.toISOString();
  return undefined;
}

export async function listAnalyses(input: z.infer<typeof InputSchema>): Promise<ListAnalysesOutput> {
  return listAnalysesFlow(input);
}

const listAnalysesFlow = ai.defineFlow(
  {
    name: 'listAnalysesFlow',
    inputSchema: InputSchema,
    // No definimos un zod estricto para output porque es union.
    outputSchema: z.any(),
  },
  async ({ uid, limit }) => {
    try {
      const app = getFirebaseAdminApp();
      const db = admin.firestore(app);
      const max = limit ?? 50;

      // 1) Consulta principal en /history filtrando por uid
      const q1 = db
        .collection('history')
        .where('uid', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(max);

      let snap = await q1.get();

      // 2) Si no hay resultados, intenta en /wineAnalyses con userId
      if (snap.empty) {
        const q2 = db
          .collection('wineAnalyses')
          .where('userId', '==', uid)
          .orderBy('createdAt', 'desc')
          .limit(max);

        snap = await q2.get();
      }

      const analyses: AnalysisSummary[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          wineName: data.wineName ?? 'Análisis',
          grapeVariety: data.analysis?.grapeVariety ?? data.grapeVariety,
          year: data.year,
          imageUrl:
            data.analysis?.visual?.imageUrl ??
            data.imageUrl ??
            data.coverImageUrl,
          createdAt: toISO(data.createdAt) ?? new Date().toISOString(),
        };
      });

      return { analyses };
    } catch (err: any) {
      console.error('listAnalyses error:', err);
      return { error: err?.message ?? 'Error al cargar tu historial.' };
    }
  }
);
