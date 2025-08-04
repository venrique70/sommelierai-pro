
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
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);

      // If user logs out, we are done loading and have no profile.
      if (!authUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      
      // If user is logged in, listen for their profile document.
      // onSnapshot also returns an unsubscribe function.
      const profileRef = doc(db, 'users', authUser.uid);
      const unsubscribeProfile = onSnapshot(profileRef, async (docSnap) => {
        if (docSnap.exists()) {
          // Profile exists, set it and we are done loading.
          setProfile(docSnap.data() as UserProfile);
          setLoading(false);
        } else {
          // New user, profile doesn't exist yet.
          // Set loading to true while we create it.
          setLoading(true);
          try {
            await setupUserProfile(authUser);
            // After setup, onSnapshot will trigger again with the new data,
            // which will then set profile and set loading to false.
          } catch (err) {
            console.error("Error setting up user profile:", err);
            setProfile(null);
            setLoading(false); // Stop loading on error
          }
        }
      }, (error) => {
        // Handle errors fetching the profile
        console.error("Error fetching user profile:", error);
        setProfile(null);
        setLoading(false);
      });
      
      // Important: Return the profile listener's unsubscribe function
      // to clean it up if the auth state changes before the profile is fetched.
      return () => unsubscribeProfile();
    });

    // Important: Return the auth listener's unsubscribe function
    // for when the AuthProvider component unmounts.
    return () => unsubscribeAuth();
  }, []); // Empty dependency array ensures this runs only once on mount.


  const value = { user, profile, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

