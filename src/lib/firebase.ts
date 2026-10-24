/**
 * Firebase initialization for the admin panel (PRD §4).
 *
 * Configuration comes only from `import.meta.env.VITE_FIREBASE_*`, which Vite
 * reads from `.env` (git-ignored). No key or secret is hardcoded here.
 */

import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

type FirebaseEnvKey =
  | 'VITE_FIREBASE_API_KEY'
  | 'VITE_FIREBASE_AUTH_DOMAIN'
  | 'VITE_FIREBASE_PROJECT_ID'
  | 'VITE_FIREBASE_STORAGE_BUCKET'
  | 'VITE_FIREBASE_MESSAGING_SENDER_ID'
  | 'VITE_FIREBASE_APP_ID'

function readEnv(name: FirebaseEnvKey): string {
  const value = import.meta.env[name]
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env and fill in the Firebase web app configuration.`,
    )
  }
  return value.trim()
}

const firebaseConfig = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('VITE_FIREBASE_APP_ID'),
}

/** Reuses the existing app during Vite HMR instead of initializing twice. */
export const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
