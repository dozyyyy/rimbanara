/**
 * TypeScript mirrors of the Firestore data model in PRD §5.3.
 *
 * Field names must match the PRD exactly: they are the storage contract used by
 * the Flutter app and the security rules. Optional fields are marked with `?`
 * and are allowed to be missing in existing documents.
 */

import type { Timestamp } from 'firebase/firestore'
import type {
  ArticleCategory,
  AuthProvider,
  ConservationStatus,
  ForestType,
  ProtectionStatus,
  QuizDifficulty,
  QuizHistoryTopic,
  QuizTopic,
  Region,
  WildlifeType,
} from './enums.ts'

/** `GeoLocation` object from PRD §5.2, stored inside `locations` arrays. */
export interface GeoLocation {
  label: string
  lat: number
  lng: number
}

/** Fields every content document carries, PRD §5.3. */
export interface Timestamps {
  createdAt: Timestamp
  updatedAt: Timestamp
}

/** `wildlife/{id}` */
export interface Wildlife extends Timestamps {
  name: string
  nameLower: string
  scientificName: string
  localName?: string
  type: WildlifeType
  region: Region
  province: string
  habitat: string
  characteristics: string
  description: string
  conservationStatus: ConservationStatus
  funFact?: string
  /** HTTPS URL or empty string; photos are links, never uploads (PRD §5.4). */
  imageUrl: string
  galleryUrls: string[]
  /** At least one entry is needed for the item to appear on the map. */
  locations: GeoLocation[]
  relatedForestIds: string[]
  isPublished: boolean
}

/** `forests/{id}` */
export interface Forest extends Timestamps {
  name: string
  nameLower: string
  forestType: ForestType
  protectionStatus: ProtectionStatus
  region: Region
  province: string
  areaHa?: number
  description: string
  characteristics: string
  flora: string[]
  imageUrl: string
  galleryUrls: string[]
  locations: GeoLocation[]
  relatedWildlifeIds: string[]
  isPublished: boolean
}

/** `articles/{id}` */
export interface Article extends Timestamps {
  title: string
  summary: string
  /** Plain text; paragraphs are separated by blank lines (PRD §4). */
  content: string
  category: ArticleCategory
  coverImageUrl: string
  author: string
  readMinutes: number
  isPublished: boolean
}

/** `quizQuestions/{id}` */
export interface QuizQuestion extends Timestamps {
  question: string
  /** Exactly four options, PRD §5.3. */
  options: string[]
  /** 0-3, index into `options`. */
  correctIndex: number
  explanation: string
  topic: QuizTopic
  difficulty: QuizDifficulty
  imageUrl?: string
  isPublished: boolean
}

/** `users/{uid}.bestScores`, percentages 0-100. */
export interface BestScores {
  Semua: number
  Hutan: number
  Satwa: number
}

/** `users/{uid}` — created by the mobile app, never by the admin panel. */
export interface AppUser extends Timestamps {
  displayName: string
  email: string
  photoUrl?: string
  provider: AuthProvider
  /** Keys are `wildlife:<id>` | `forest:<id>` | `article:<id>`, max 500. */
  favorites: string[]
  bestScores: BestScores
}

/** `users/{uid}/quizHistory/{id}` — append-only. */
export interface QuizHistoryEntry {
  topic: QuizHistoryTopic
  correctCount: number
  totalQuestions: number
  scorePercent: number
  createdAt: Timestamp
}

/** `admins/{uid}` — created manually in the Firebase console. */
export interface Admin {
  email: string
  role: 'admin'
}

/** The four content collections an admin can read and write (PRD §6). */
export const CONTENT_COLLECTIONS = [
  'wildlife',
  'forests',
  'articles',
  'quizQuestions',
] as const
export type ContentCollection = (typeof CONTENT_COLLECTIONS)[number]

/** Favorite key format stored in `users/{uid}.favorites`, PRD §5.3. */
export type FavoriteKey =
  | `wildlife:${string}`
  | `forest:${string}`
  | `article:${string}`

/** A Firestore document read together with its document ID. */
export type WithId<T> = T & { id: string }
