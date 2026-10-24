/**
 * Enum values from PRD §5.2.
 *
 * The string values are stored in Firestore as-is, so they must never be
 * translated or renamed. UI labels reuse these values directly.
 */

export const REGIONS = [
  'Sumatera',
  'Jawa',
  'Kalimantan',
  'Sulawesi',
  'Bali & Nusa Tenggara',
  'Maluku',
  'Papua',
] as const
export type Region = (typeof REGIONS)[number]

export const WILDLIFE_TYPES = [
  'Mamalia',
  'Burung',
  'Reptil',
  'Amfibi',
  'Ikan',
  'Serangga',
  'Lainnya',
] as const
export type WildlifeType = (typeof WILDLIFE_TYPES)[number]

/** IUCN conservation categories, PRD §5.2. */
export const CONSERVATION_STATUSES = [
  'LC',
  'NT',
  'VU',
  'EN',
  'CR',
  'EW',
  'EX',
  'DD',
] as const
export type ConservationStatus = (typeof CONSERVATION_STATUSES)[number]

export const FOREST_TYPES = [
  'Hutan Hujan Tropis',
  'Hutan Mangrove',
  'Hutan Rawa Gambut',
  'Hutan Pegunungan',
  'Hutan Muson',
  'Lainnya',
] as const
export type ForestType = (typeof FOREST_TYPES)[number]

export const PROTECTION_STATUSES = [
  'Taman Nasional',
  'Cagar Alam',
  'Suaka Margasatwa',
  'Hutan Lindung',
  'Hutan Produksi',
  'Lainnya',
] as const
export type ProtectionStatus = (typeof PROTECTION_STATUSES)[number]

export const ARTICLE_CATEGORIES = [
  'Pelestarian Hutan',
  'Perlindungan Satwa',
  'Edukasi Umum',
] as const
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number]

/** Quiz topics used by `quizQuestions.topic`, PRD §5.3. */
export const QUIZ_TOPICS = ['Hutan', 'Satwa', 'Umum'] as const
export type QuizTopic = (typeof QUIZ_TOPICS)[number]

/**
 * Topics recorded on `users/{uid}/quizHistory`. Unlike `quizQuestions.topic`
 * this enum also has "Semua" (a mixed quiz), PRD §5.3.
 */
export const QUIZ_HISTORY_TOPICS = ['Semua', 'Hutan', 'Satwa'] as const
export type QuizHistoryTopic = (typeof QUIZ_HISTORY_TOPICS)[number]

export const QUIZ_DIFFICULTIES = ['Mudah', 'Sedang', 'Sulit'] as const
export type QuizDifficulty = (typeof QUIZ_DIFFICULTIES)[number]

export const AUTH_PROVIDERS = ['password', 'google'] as const
export type AuthProvider = (typeof AUTH_PROVIDERS)[number]
