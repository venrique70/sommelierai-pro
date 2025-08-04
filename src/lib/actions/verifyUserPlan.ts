
// src/lib/actions/verifyUserPlan.ts

import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function getUserPlan(uid: string): Promise<'gratis' | 'premium' | 'pro' | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return data?.plan ?? null;
  } catch (error) {
    console.error('Error al obtener plan del usuario:', error);
    return null;
  }
}
