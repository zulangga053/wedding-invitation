'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { firebaseConfigured, getAuthInstance } from '@/lib/firebase/client';
import { ApiError } from '@/lib/api/client';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  /** Fresh Firebase ID token for API Bearer auth. */
  getToken: () => Promise<string | null>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured) return;
    const auth = getAuthInstance();
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (next) => {
      setUser(next);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken(true);
    } catch {
      return user.getIdToken().catch(() => null);
    }
  }, [user]);

  const signInEmail = useCallback(async (email: string, password: string) => {
    const auth = getAuthInstance();
    if (!auth) throw new ApiError('Firebase auth is not configured', 400);
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUpEmail = useCallback(async (email: string, password: string) => {
    const auth = getAuthInstance();
    if (!auth) throw new ApiError('Firebase auth is not configured', 400);
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const signInGoogle = useCallback(async () => {
    const auth = getAuthInstance();
    if (!auth) throw new ApiError('Firebase auth is not configured', 400);
    await signInWithPopup(auth, new GoogleAuthProvider());
  }, []);

  const logout = useCallback(async () => {
    const auth = getAuthInstance();
    if (!auth) return;
    await fbSignOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      authenticated: Boolean(user),
      getToken,
      signInEmail,
      signUpEmail,
      signInGoogle,
      logout,
    }),
    [user, loading, getToken, signInEmail, signUpEmail, signInGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}