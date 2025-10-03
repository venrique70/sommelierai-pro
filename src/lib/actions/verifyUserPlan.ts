// src/lib/actions/verifyUserPlan.ts
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'venrique70@gmail.com')
  .split(',').map(s => s.trim().toLowerCase());
const ADMIN_USERNAMES = (process.env.ADMIN_USERNAMES || 'venrique70')
  .split(',').map(s => s.trim().toLowerCase());

export type AppPlan = 'gratis' | 'premium' | 'pro' | null;

export async function isUnlimitedAdmin(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return false;
    const u = snap.data() || {};
    const email = String(u?.email || '').toLowerCase();
    const username = String(u?.username || '').toLowerCase();
    return u?.role === 'admin' || ADMIN_EMAILS.includes(email) || ADMIN_USERNAMES.includes(username);
  } catch {
    return false;
  }
}

export async function getUserPlan(uid: string): Promise<AppPlan> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return (data?.plan ?? null) as AppPlan;
  } catch (error) {
    console.error('Error al obtener plan del usuario:', error);
    return null;
  }
}

/** Úsalo donde haces el control de cupos */
export async function getUserAccess(uid: string): Promise<{ plan: AppPlan; adminBypass: boolean }> {
  const [plan, adminBypass] = await Promise.all([getUserPlan(uid), isUnlimitedAdmin(uid)]);
  return { plan, adminBypass };
}
