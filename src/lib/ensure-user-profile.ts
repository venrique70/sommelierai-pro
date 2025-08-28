// src/lib/ensure-user-profile.ts
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function ensureUserProfile(u: { uid: string; email?: string | null }) {
  const ref = doc(db, "users", u.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: u.uid,
      email: u.email ?? null,
      role: "user",
      createdAt: serverTimestamp(),
      usage: { analyzeWine: { current: 0 } },
    }, { merge: true });
  }
}
