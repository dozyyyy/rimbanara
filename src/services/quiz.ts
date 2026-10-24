import type { QuizQuestion, WithId } from '../types/models.ts'
import type { QuizQuestionFormValues } from '../types/schemas.ts'
import {
  createDocument,
  getDocument,
  listDocuments,
  removeDocument,
  updateDocument,
} from './firestore.ts'

const COLLECTION = 'quizQuestions'

export function toQuizPayload(values: QuizQuestionFormValues) {
  return {
    question: values.question.trim(),
    options: values.options.map((option) => option.trim()),
    correctIndex: values.correctIndex,
    explanation: values.explanation.trim(),
    topic: values.topic,
    difficulty: values.difficulty,
    imageUrl: values.imageUrl.trim() || undefined,
    isPublished: values.isPublished,
  }
}

export async function listQuizQuestions(): Promise<WithId<QuizQuestion>[]> {
  const questions = await listDocuments<QuizQuestion>(COLLECTION)
  return questions.sort((a, b) => {
    const byTopic = (a.topic ?? '').localeCompare(b.topic ?? '', 'id')
    if (byTopic !== 0) return byTopic
    return (a.question ?? '').localeCompare(b.question ?? '', 'id')
  })
}

export function getQuizQuestion(id: string) {
  return getDocument<QuizQuestion>(COLLECTION, id)
}

export function createQuizQuestion(values: QuizQuestionFormValues) {
  return createDocument(COLLECTION, toQuizPayload(values))
}

export function updateQuizQuestion(id: string, values: QuizQuestionFormValues) {
  return updateDocument(COLLECTION, id, toQuizPayload(values))
}

export function deleteQuizQuestion(id: string) {
  return removeDocument(COLLECTION, id)
}
