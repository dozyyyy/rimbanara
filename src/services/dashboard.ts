/**
 * Dashboard totals (PRD §8.2 A2): document count per content collection plus
 * how many of them are drafts. Uses `getCountFromServer`, which costs a single
 * aggregation read instead of reading every document. User data is never
 * counted or shown.
 */

import {
  collection,
  getCountFromServer,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../lib/firebase.ts'
import { CONTENT_COLLECTIONS } from '../types/models.ts'
import type { ContentCollection } from '../types/models.ts'

export interface CollectionStats {
  collection: ContentCollection
  total: number
  drafts: number
}

export async function getContentStats(): Promise<CollectionStats[]> {
  return Promise.all(
    CONTENT_COLLECTIONS.map(async (collectionName) => {
      const reference = collection(db, collectionName)
      const [totalSnapshot, draftSnapshot] = await Promise.all([
        getCountFromServer(reference),
        getCountFromServer(
          query(reference, where('isPublished', '==', false)),
        ),
      ])

      return {
        collection: collectionName,
        total: totalSnapshot.data().count,
        drafts: draftSnapshot.data().count,
      }
    }),
  )
}
