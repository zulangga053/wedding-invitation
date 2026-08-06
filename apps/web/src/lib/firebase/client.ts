import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigured = Boolean(config.apiKey && config.projectId);

/** Firebase client app — null when env config is absent. */
export const firebaseApp: FirebaseApp | null = isConfigured
  ? (getApps()[0] ?? initializeApp(config))
  : null;

export const firebaseConfigured = isConfigured;

/** Auth singleton wired to the local emulator when enabled. */
let cachedAuth: Auth | null = null;
export function getAuthInstance(): Auth | null {
  if (!firebaseApp) return null;
  if (cachedAuth) return cachedAuth;

  const auth = getAuth(firebaseApp);

  // In development, wire up to the local emulators
  if (process.env.NODE_ENV === 'development') {
    // connectAuthEmulator is idempotent, so it's safe to call this multiple times.
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  }

  cachedAuth = auth;
  return auth;
}

/** Firestore singleton wired to the local emulator when enabled. */
let cachedDb: Firestore | null = null;
export function getDbInstance(): Firestore | null {
  if (!firebaseApp) return null;
  if (cachedDb) return cachedDb;

  const db = getFirestore(firebaseApp);

  if (process.env.NODE_ENV === 'development') {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }

  cachedDb = db;
  return db;
}
