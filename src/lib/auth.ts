"use client";

import { db, auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, increment, updateDoc } from "firebase/firestore";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const provider = new GoogleAuthProvider();

/** Límites por plan (claves internas) */
export const planLimits = {
  descubrete:     { analyzeWine: 5,  recommendWine: 1,  pairDinner: 0 },
  iniciado:       { analyzeWine: 8,  recommendWine: 2,  pairDinner: 0 },
  "una copa":     { analyzeWine: 12, recommendWine: 5,  pairDinner: 2 },
  "copa premium": { analyzeWine: 30, recommendWine: 15, pairDinner: 10 },
  sibarita:       { analyzeWine: Infinity, recommendWine: Infinity, pairDinner: Infinity },
} as const;
export type PlanName = keyof typeof planLimits;

/** Nombres visibles para el usuario */
const DISPLAY_NAME: Record<PlanName, string> = {
  descubrete: "Descúbrete",
  iniciado: "Iniciado",
  "una copa": "Una Copa",
  "copa premium": "Copa Premium",
  sibarita: "Sibarita",
};

export function humanizeAuthError(code?: string, fallback?: string) {
  const map: Record<string, string> = {
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
    "auth/operation-not-allowed": "El método Email/Contraseña no está habilitado.",
    "auth/network-request-failed": "Problema de red. Verifica tu conexión.",
    "auth/invalid-email": "Introduce un correo válido.",
  };
  return map[code ?? ""] ?? (fallback || "No se pudo iniciar sesión.");
}

export const setupUserProfile = async (user: User, displayName?: string | null) => {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const isAdmin = (user.email || "").toLowerCase() === "venrique70@gmail.com";

  if (!snap.exists()) {
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    const initialPlanKey: PlanName = isAdmin ? "sibarita" : "descubrete";
    const limits = planLimits[initialPlanKey];
    const visibleName = DISPLAY_NAME[initialPlanKey];

    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName || user.email?.split("@")[0] || "Usuario",
      photoURL: user.photoURL || "",
      role: isAdmin ? "admin" : "user",
      vendorRequestStatus: "pending",
      lemonAffiliateLink: null,
      level: isAdmin ? "Master" : "Nuevo",
      subscription: { plan: visibleName, status: "active", renewalDate },
      usage: {
        analyzeWine: { current: 0, limit: limits.analyzeWine },
        recommendWine: { current: 0, limit: limits.recommendWine },
        pairDinner: { current: 0, limit: limits.pairDinner },
      },
      createdAt: serverTimestamp(),
    });
  }
};

export async function signInWithEmail(email: string, password: string) {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (e: any) {
    throw Object.assign(new Error(humanizeAuthError(e?.code, e?.message)), { code: e?.code });
  }
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(res.user, { displayName });
    await setupUserProfile(res.user, displayName);
    return res.user;
  } catch (e: any) {
    throw Object.assign(new Error(humanizeAuthError(e?.code, e?.message)), { code: e?.code });
  }
}

export async function signInWithGoogle() {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const res = await signInWithPopup(auth, provider);
    await setupUserProfile(res.user);
    return res.user;
  } catch (e: any) {
    throw Object.assign(new Error(humanizeAuthError(e?.code, e?.message)), { code: e?.code });
  }
}

export async function logout(router?: AppRouterInstance) {
  await signOut(auth);
  if (router) router.push("/login");
  else window.location.href = "/login";
}

export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export function onAuthChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

/** Incrementa uso de una funcionalidad (lado cliente) */
export async function updateUserUsage(
  uid: string,
  feature: "analyzeWine" | "recommendWine" | "pairDinner"
) {
  if (!uid) return;
  const ref = doc(db, "users", uid);
  try {
    await updateDoc(ref, { [`usage.${feature}.current`]: increment(1) });
  } catch {}
}
