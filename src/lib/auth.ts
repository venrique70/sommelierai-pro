
'use client';

import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { app, db, auth } from '@/lib/firebase-client';
import { doc, setDoc, getDoc, serverTimestamp, increment, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

const provider = new GoogleAuthProvider();

const planLimits = {
    descubrete: { analyzeWine: 5, recommendWine: 1, pairDinner: 0 },
    iniciado: { analyzeWine: 8, recommendWine: 2, pairDinner: 0 },
    'una copa': { analyzeWine: 12, recommendWine: 5, pairDinner: 2 },
    'copa premium': { analyzeWine: 30, recommendWine: 15, pairDinner: 10 },
    sibarita: { analyzeWine: Infinity, recommendWine: Infinity, pairDinner: Infinity },
};
type PlanName = keyof typeof planLimits;


/**
 * Sets up or updates a user profile in Firestore if it doesn't exist.
 * This is crucial for storing app-specific data like roles and subscriptions.
 */
export const setupUserProfile = async (user: User, displayName?: string | null) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const isAdmin = user.email === 'venrique70@gmail.com';

    if (!userSnap.exists()) {
        const renewalDate = new Date();
        renewalDate.setMonth(renewalDate.getMonth() + 1);

        const initialPlanKey: PlanName = isAdmin ? 'sibarita' : 'descubrete';
        const planName = initialPlanKey.charAt(0).toUpperCase() + initialPlanKey.slice(1).replace('_', ' ');
        const limits = planLimits[initialPlanKey];
        
        const profileData = {
            uid: user.uid,
            email: user.email,
            displayName: displayName || user.displayName || user.email?.split('@')[0] || 'Usuario Anónimo',
            photoURL: user.photoURL || '',
            role: isAdmin ? 'admin' : 'user', 
            subscription: {
                plan: planName, 
                status: 'active',
                renewalDate: renewalDate,
            },
            usage: {
                analyzeWine: { current: 0, limit: limits.analyzeWine },
                recommendWine: { current: 0, limit: limits.recommendWine },
                pairDinner: { current: 0, limit: limits.pairDinner }
            },
            createdAt: serverTimestamp(),
        };

        await setDoc(userRef, profileData);
        console.log(`User profile created for ${user.email} with role: ${profileData.role}`);
    }
};

export async function signUpWithEmail(email: string, password: string, displayName: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    // setupUserProfile is now called by the onAuthStateChanged listener
    return result.user;
}

export async function signInWithEmail(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    // setupUserProfile is now called by the onAuthStateChanged listener
    return result.user;
}

export async function signInWithGoogle() {
    const result = await signInWithPopup(auth, provider);
    // setupUserProfile is now called by the onAuthStateChanged listener
    return result.user;
}

export async function logout(router?: AppRouterInstance) {
  await signOut(auth);
  if (router) {
    router.push('/login');
  } else {
    window.location.href = '/login';
  }
}

export async function sendPasswordReset(email: string) {
    return sendPasswordResetEmail(auth, email);
}

export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}

export async function updateUserUsage(uid: string, feature: 'analyzeWine' | 'recommendWine' | 'pairDinner') {
    if (!uid) return;
    const userRef = doc(db, 'users', uid);
    
    const fieldToIncrement = `usage.${feature}.current`;
    try {
      await updateDoc(userRef, {
          [fieldToIncrement]: increment(1)
      });
    } catch (error) {
      console.error("Error updating user usage:", error);
    }
}
