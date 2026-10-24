/**
 * Thin Firestore helpers shared by the CRUD services.
 *
 * The admin panel reads a full collection per visit (client-side search, filter
 * and pagination, PRD §8.2) and always uses `serverTimestamp()` for
 * `createdAt`/`updatedAt`.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'

import { db } from '../lib/firebase.ts'
import type { ContentCollection, WithId } from '../types/models.ts'

/** Firestore rejects `undefined` values, so optional fields are dropped. */
export function stripUndefined<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as T
}

export async function listDocuments<T>(
  collectionName: ContentCollection,
): Promise<WithId<T>[]> {
  const snapshot = await getDocs(collection(db, collectionName))
  return snapshot.docs.map((entry) => ({
    id: entry.id,
    ...(entry.data() as T),
  }))
}

export async function getDocument<T>(
  collectionName: ContentCollection,
  id: string,
): Promise<WithId<T> | null> {
  const snapshot = await getDoc(doc(db, collectionName, id))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...(snapshot.data() as T) }
}

export async function createDocument(
  collectionName: ContentCollection,
  data: Record<string, unknown>,
): Promise<string> {
  const created = await addDoc(collection(db, collectionName), {
    ...stripUndefined(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return created.id
}

export async function updateDocument(
  collectionName: ContentCollection,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await updateDoc(doc(db, collectionName, id), {
    ...stripUndefined(data),
    updatedAt: serverTimestamp(),
  })
}

export async function removeDocument(
  collectionName: ContentCollection,
  id: string,
): Promise<void> {
  await deleteDoc(doc(db, collectionName, id))
}
