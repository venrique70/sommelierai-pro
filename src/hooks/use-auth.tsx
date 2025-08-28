"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { ensureUserProfile } from "@/lib/ensure-user-profile"; // 👈 usa esta

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: "admin" | "vendedor" | "user";
  vendorRequestStatus?: "pending" | "approved" | "rejected" | null | undefined;
  subscription?: {
    plan: string;
    status: string;
    renewalDate?: { seconds: number; nanoseconds: number };
  };
  usage?: {
    analyzeWine: { current: number; limit?: number };
    recommendWine?: { current: number; limit?: number };
    pairDinner?: { current: number; limit?: number };
  };
  createdAt?: any;
  vendorRequestedAt?: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      console.log("AUTH UID:", authUser?.uid);

      if (!authUser?.uid) {
        // 👇 sin UID: no intentamos leer perfil
        setProfile(null);
        setLoading(false);
        return;
      }

      // 👇 garantiza que el doc exista antes de escuchar
      try {
        await ensureUserProfile({ uid: authUser.uid, email: authUser.email ?? null });
      } catch (e) {
        console.error("ensureUserProfile error:", e);
      }

      const profileRef = doc(db, "users", authUser.uid);
      const unsubscribeProfile = onSnapshot(
        profileRef,
        (docSnap) => {
          setProfile(docSnap.exists() ? (docSnap.data() as UserProfile) : null);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching user profile:", error);
          setProfile(null);
          setLoading(false);
        }
      );

      return () => unsubscribeProfile();
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
