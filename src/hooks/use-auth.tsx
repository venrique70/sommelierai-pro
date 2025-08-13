"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from "firebase/firestore";
import { setupUserProfile } from '@/lib/auth';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'vendedor' | 'user';
  vendorRequestStatus?: 'pending' | 'approved' | 'rejected' | null | undefined;
  subscription: {
    plan: string;
    status: string;
    renewalDate: { seconds: number; nanoseconds: number; };
  };
  usage: {
    analyzeWine: { current: number; limit: number };
    recommendWine: { current: number; limit: number };
    pairDinner: { current: number; limit: number };
  };
  createdAt: any;
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
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);

      // 📌 Log para verificar UID de sesión
      console.log("AUTH UID:", authUser?.uid);

      // 🔒 Evita consultas a Firestore si no hay usuario autenticado
      if (!authUser?.uid) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const profileRef = doc(db, 'users', authUser.uid);
      const unsubscribeProfile = onSnapshot(
        profileRef,
        async (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
            setLoading(false);
          } else {
            // Perfil no existe, crearlo
            setLoading(true);
            try {
              await setupUserProfile(authUser);
              // onSnapshot se volverá a disparar después de crear el perfil
            } catch (err) {
              console.error("Error setting up user profile:", err);
              setProfile(null);
              setLoading(false);
            }
          }
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

  const value = { user, profile, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
