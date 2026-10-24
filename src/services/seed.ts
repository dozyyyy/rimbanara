/**
 * One-time sample data import (PRD §8.2 A7).
 *
 * The JSON file lives in `seed/seed-data.json` and is bundled by Vite, so the
 * import works without an extra HTTP request. Documents are written with the
 * same field shape the forms use: `nameLower` for forests/wildlife and
 * `createdAt`/`updatedAt` timestamps are added here, not stored in the file.
 */

import seedData from '../../seed/seed-data.json'
import type {
  Article,
  Forest,
  QuizQuestion,
  Wildlife,
} from '../types/models.ts'
import { createDocument } from './firestore.ts'

type SeedForest = Omit<Forest, 'createdAt' | 'updatedAt' | 'nameLower'>
type SeedWildlife = Omit<Wildlife, 'createdAt' | 'updatedAt' | 'nameLower'>
type SeedArticle = Omit<Article, 'createdAt' | 'updatedAt'>
type SeedQuizQuestion = Omit<QuizQuestion, 'createdAt' | 'updatedAt'>

interface SeedData {
  wildlife: SeedWildlife[]
  forests: SeedForest[]
  articles: SeedArticle[]
  quizQuestions: SeedQuizQuestion[]
}

const seed = seedData as unknown as SeedData

export interface SeedCounts {
  wildlife: number
  forests: number
  articles: number
  quizQuestions: number
}

export function getSeedCounts(): SeedCounts {
  return {
    wildlife: seed.wildlife.length,
    forests: seed.forests.length,
    articles: seed.articles.length,
    quizQuestions: seed.quizQuestions.length,
  }
}

export interface ImportProgress {
  step: string
  done: number
  total: number
}

export async function importSeedData(
  onProgress?: (progress: ImportProgress) => void,
): Promise<SeedCounts> {
  const counts = getSeedCounts()
  const total =
    counts.wildlife + counts.forests + counts.articles + counts.quizQuestions
  let done = 0

  const report = (step: string) => {
    done += 1
    onProgress?.({ step, done, total })
  }

  for (const forest of seed.forests) {
    await createDocument('forests', {
      ...forest,
      nameLower: forest.name.trim().toLowerCase(),
    } as unknown as Record<string, unknown>)
    report(`Hutan: ${forest.name}`)
  }

  for (const wildlife of seed.wildlife) {
    await createDocument('wildlife', {
      ...wildlife,
      nameLower: wildlife.name.trim().toLowerCase(),
    } as unknown as Record<string, unknown>)
    report(`Satwa: ${wildlife.name}`)
  }

  for (const article of seed.articles) {
    await createDocument(
      'articles',
      article as unknown as Record<string, unknown>,
    )
    report(`Artikel: ${article.title}`)
  }

  for (const question of seed.quizQuestions) {
    await createDocument(
      'quizQuestions',
      question as unknown as Record<string, unknown>,
    )
    report(`Soal kuis: ${question.question}`)
  }

  return counts
}
