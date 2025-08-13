'use server';
/**
 * Server-side list of wines in the user's cellar (sin índices compuestos).
 * Usamos Firebase Admin y evitamos orderBy; ordenamos en memoria.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

import type {
  ListWinesFromCellarInput,
  ListWinesFromCellarOutput,
} from '@/lib/schemas';

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
  // Si ya es string (ISO), lo devolvemos igual
  if (typeof ts === 'string') return ts;
  return undefined;
}

export async function listWinesFromCellar(
  input: ListWinesFromCellarInput
): Promise<ListWinesFromCellarOutput> {
  return listWinesFromCellarFlow(input);
}

const listWinesFromCellarFlow = ai.defineFlow(
  {
    name: 'listWinesFromCellarFlow',
    inputSchema: InputSchema,
    outputSchema: z.any(),
  },
  async ({ uid, limit }) => {
    try {
      const max = limit ?? 100;
      const app = getFirebaseAdminApp();
      const db = admin.firestore(app);

      // 1) /cellar con igualdad por uid (SIN orderBy -> no necesita índice compuesto)
      let snap = await db
        .collection('cellar')
        .where('uid', '==', uid)
        .limit(max)
        .get();

      // 2) /cellars si vacío
      if (snap.empty) {
        snap = await db
          .collection('cellars')
          .where('uid', '==', uid)
          .limit(max)
          .get();
      }

      // 3) /users/{uid}/cellar si aún vacío
      if (snap.empty) {
        snap = await db
          .collection('users')
          .doc(uid)
          .collection('cellar')
          .limit(max)
          .get();
      }

      let wines = snap.docs.map((d) => {
        const data = d.data() as any;
        const createdAtISO = toISO(data.createdAt) ?? new Date().toISOString();
        return {
          id: d.id,
          name: data.name ?? 'Vino',
          variety: data.variety ?? data.cepa,
          year: data.year,
          quantity: data.quantity ?? 1,
          status: data.status ?? 'Listo para Beber',
          createdAt: createdAtISO,
          uid,
        };
      });

      // Ordenamos en memoria por fecha desc y aplicamos límite
      wines.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      if (wines.length > max) wines = wines.slice(0, max);

      return { wines };
    } catch (err: any) {
      console.error('listWinesFromCellar error:', err);
      return { error: err?.message ?? 'Error al cargar tu bodega.' };
    }
  }
);
