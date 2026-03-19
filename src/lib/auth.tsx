// ─── Auth Context (Firebase) ──────────────────────────────────────────────
// Single-tier auth backed by Firebase Auth.
// Exports the same useAuth() interface consumed by all components.

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth } from "./firebase/client";
import { getFirebaseDb } from "./firebase/client";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  updateProfile: (updates: Partial<Pick<User, "name" | "avatar">>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Helper: Firebase user → our User ────────────────────────────────────

function firebaseUserToUser(fu: FirebaseUser): User {
  return {
    id: fu.uid,
    name: fu.displayName || fu.email?.split("@")[0] || "User",
    email: fu.email || "",
    avatar: fu.photoURL || undefined,
    createdAt: fu.metadata.creationTime || new Date().toISOString(),
  };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Helper: ensure Firestore profile doc exists ──────────────────────────

async function ensureProfileDoc(fu: FirebaseUser) {
  try {
    const db = getFirebaseDb();
    const profileRef = doc(db, "users", fu.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      await setDoc(profileRef, {
        email: fu.email || "",
        name: fu.displayName || fu.email?.split("@")[0] || "User",
        currency: "INR",
        country: "IN",
        isPremium: false,
        premiumExpiresAt: null,
        tripsCreated: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (e) {
    console.warn("[Auth] Failed to ensure profile doc:", e);
  }
}

// ─── Provider ──────────────────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();

export function AuthProviderComponent({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Listen for auth state changes ──────────────────────────────────────

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUserToUser(firebaseUser));
        // Ensure Firestore profile exists (fire-and-forget)
        ensureProfileDoc(firebaseUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ─── Sign Up ─────────────────────────────────────────────────────────────

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();

      if (!trimmedName || trimmedName.length < 2) {
        return { success: false, error: "Name must be at least 2 characters" };
      }
      if (!trimmedEmail || !trimmedEmail.includes("@")) {
        return { success: false, error: "Please enter a valid email" };
      }
      if (!password || password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters" };
      }

      try {
        const auth = getFirebaseAuth();
        const { user: firebaseUser } = await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          password
        );

        // Set display name
        await updateProfile(firebaseUser, { displayName: trimmedName });

        // Create Firestore profile
        await ensureProfileDoc(firebaseUser);

        setUser(firebaseUserToUser(firebaseUser));
        return { success: true };
      } catch (error: unknown) {
        const firebaseError = error as { code?: string; message?: string };
        if (firebaseError.code === "auth/email-already-in-use") {
          return { success: false, error: "An account with this email already exists" };
        }
        if (firebaseError.code === "auth/weak-password") {
          return { success: false, error: "Password must be at least 6 characters" };
        }
        if (firebaseError.code === "auth/invalid-email") {
          return { success: false, error: "Please enter a valid email" };
        }
        return { success: false, error: firebaseError.message || "Sign up failed" };
      }
    },
    []
  );

  // ─── Sign In ─────────────────────────────────────────────────────────────

  const signIn = useCallback(
    async (email: string, password: string) => {
      const trimmedEmail = email.trim().toLowerCase();

      if (!trimmedEmail || !password) {
        return { success: false, error: "Please enter email and password" };
      }

      try {
        const auth = getFirebaseAuth();
        const { user: firebaseUser } = await signInWithEmailAndPassword(
          auth,
          trimmedEmail,
          password
        );

        setUser(firebaseUserToUser(firebaseUser));
        return { success: true };
      } catch (error: unknown) {
        const firebaseError = error as { code?: string; message?: string };
        if (
          firebaseError.code === "auth/wrong-password" ||
          firebaseError.code === "auth/user-not-found" ||
          firebaseError.code === "auth/invalid-credential"
        ) {
          return { success: false, error: "Invalid email or password" };
        }
        return { success: false, error: firebaseError.message || "Sign in failed" };
      }
    },
    []
  );

  // ─── Google OAuth Sign In ────────────────────────────────────────────────

  const handleSignInWithGoogle = useCallback(async () => {
    try {
      const auth = getFirebaseAuth();
      const { user: firebaseUser } = await signInWithPopup(auth, googleProvider);

      // Ensure Firestore profile exists
      await ensureProfileDoc(firebaseUser);

      setUser(firebaseUserToUser(firebaseUser));
      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === "auth/popup-closed-by-user") {
        return { success: false, error: "Sign in cancelled" };
      }
      return { success: false, error: firebaseError.message || "Google sign in failed" };
    }
  }, []);

  // ─── Sign Out ────────────────────────────────────────────────────────────

  const handleSignOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
    setUser(null);
  }, []);

  // ─── Update Profile ──────────────────────────────────────────────────────

  const handleUpdateProfile = useCallback(
    async (updates: Partial<Pick<User, "name" | "avatar">>) => {
      if (!user) return;

      try {
        const auth = getFirebaseAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const profileUpdates: { displayName?: string; photoURL?: string } = {};
        if (updates.name) profileUpdates.displayName = updates.name;
        if (updates.avatar) profileUpdates.photoURL = updates.avatar;

        await updateProfile(currentUser, profileUpdates);

        // Also update Firestore profile
        const db = getFirebaseDb();
        const profileRef = doc(db, "users", currentUser.uid);
        const firestoreUpdates: Record<string, unknown> = { updatedAt: serverTimestamp() };
        if (updates.name) firestoreUpdates.name = updates.name;
        await setDoc(profileRef, firestoreUpdates, { merge: true });

        setUser((prev) => (prev ? { ...prev, ...updates } : null));
      } catch (e) {
        console.warn("[Auth] Failed to update profile:", e);
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signUp,
        signIn,
        signInWithGoogle: handleSignInWithGoogle,
        signOut: handleSignOut,
        updateProfile: handleUpdateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Keep the old name as the default export for backward compatibility
export { AuthProviderComponent as AuthProvider };

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { getInitials };
