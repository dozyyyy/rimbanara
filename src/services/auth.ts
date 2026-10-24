/**
 * Admin authentication (PRD §8.2 A1).
 *
 * Email/Password only: there is no registration and no Google sign-in on the
 * web. A signed-in Firebase user is only an admin when `admins/{uid}` exists,
 * which also rejects regular mobile users.
 */

import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

import { auth, db } from '../lib/firebase.ts'

export const NOT_ADMIN_MESSAGE = 'Akun ini tidak memiliki akses admin'

/** Thrown when the credentials are valid but the account is not an admin. */
export class NotAdminError extends Error {
  constructor() {
    super(NOT_ADMIN_MESSAGE)
    this.name = 'NotAdminError'
  }
}

export async function hasAdminDocument(uid: string): Promise<boolean> {
  try {
    const snapshot = await getDoc(doc(db, 'admins', uid))
    return snapshot.exists()
  } catch {
    return false
  }
}

/** Maps Firebase Auth error codes to Indonesian messages. */
export function authErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : ''

  switch (code) {
    case 'auth/invalid-email':
      return 'Format email tidak valid.'
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email atau password salah.'
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.'
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah. Periksa jaringan Anda.'
    case 'auth/user-disabled':
      return 'Akun ini dinonaktifkan.'
    default:
      return 'Gagal masuk. Silakan coba lagi.'
  }
}

export async function signInAdmin(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  const isAdmin = await hasAdminDocument(credential.user.uid)
  if (!isAdmin) {
    await signOut(auth)
    throw new NotAdminError()
  }
  return credential.user
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth)
}
