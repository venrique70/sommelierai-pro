"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth";
import { db, auth } from "@/lib/firebase-client";
import { doc, setDoc, getDoc, serverTimestamp, increment, updateDoc } from "firebase/firestore";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const provider = new GoogleAuthProvider();

/** Límites por plan */
const planLimits = {
  descubrete: { analyzeWine: 5, recommendWine: 1, pairDinner: 0 },
  iniciado: { analyzeWine: 8, recommendWine: 2, pairDinner: 0 },
  "una copa": { analyzeWine: 12, recommendWine: 5, pairDinner: 2 },
  "copa premium": { analyzeWine: 30, recommendWine: 15, pairDinner: 10 },
  sibarita: { analyzeWine: Infinity, recommendWine: Infinity, pairDinner: Infinity },
};
type PlanName = keyof typeof planLimits;

/** ───────────────────────────────────────────────────────────────
 * Crea el perfil de usuario si no existe (con nuevos campos por defecto)
 * ─────────────────────────────────────────────────────────────── */
export const setupUserProfile = async (user: User, displayName?: string | null) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const isAdmin = user.email === "venrique70@gmail.com";

  if (!userSnap.exists()) {
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    const initialPlanKey: PlanName = isAdmin ? "sibarita" : "descubrete";
    const planName =
      initialPlanKey.charAt(0).toUpperCase() +
      initialPlanKey.slice(1).replace("_", " ");
    const limits = planLimits[initialPlanKey];

    // Nivel inicial (puedes ajustar esta lógica)
    const defaultLevel: "Nuevo" | "Pregrado" | "Bachelor" | "Pro" | "Master" =
      isAdmin ? "Master" : "Nuevo";

    const profileData = {
      uid: user.uid,
      email: user.email,
      displayName:
        displayName || user.displayName || user.email?.split("@")[0] || "Usuario Anónimo",
      photoURL: user.photoURL || "",
      role: isAdmin ? "admin" : "user",

      /** 🔥 NUEVOS CAMPOS */
      vendorRequestStatus: "pending" as const, // o "approved" si prefieres
      lemonAffiliateLink: null as string | null,
      level: defaultLevel,

      subscription: {
        plan: planName,
        status: "active",
        renewalDate: renewalDate, // Firestore lo guarda como Timestamp
      },
      usage: {
        analyzeWine: { current: 0, limit: limits.analyzeWine },
        recommendWine: { current: 0, limit: limits.recommendWine },
        pairDinner: { current: 0, limit: limits.pairDinner },
      },
      createdAt: serverTimestamp(),
    };

    await setDoc(userRef, profileData);
    console.log(`User profile created for ${user.email} with role: ${profileData.role}`);
  }
};

/** Registro con email / password */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, {
    displayName: displayName || email.split("@")[0] || "Usuario",
  });
  return result.user;
}

/** Login con email / password */
export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/** Login con Google */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

/** Logout */
export async function logout(router?: AppRouterInstance) {
  await signOut(auth);
  if (router) {
    router.push("/login");
  } else {
    window.location.href = "/login";
  }
}

/** Reset password */
export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email);
}

/** Listener de auth (si lo necesitas público) */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/** Incrementa uso de features */
export async function updateUserUsage(
  uid: string,
  feature: "analyzeWine" | "recommendWine" | "pairDinner"
) {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  const fieldToIncrement = `usage.${feature}.current`;
  try {
    await updateDoc(userRef, { [fieldToIncrement]: increment(1) });
  } catch (error) {
    console.error("Error updating user usage:", error);
  }
}
