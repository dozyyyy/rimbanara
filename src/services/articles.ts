import type { Article, WithId } from '../types/models.ts'
import type { ArticleFormValues } from '../types/schemas.ts'
import {
  createDocument,
  getDocument,
  listDocuments,
  removeDocument,
  updateDocument,
} from './firestore.ts'

const COLLECTION = 'articles'

export function toArticlePayload(values: ArticleFormValues) {
  return {
    title: values.title.trim(),
    summary: values.summary.trim(),
    content: values.content.trim(),
    category: values.category,
    coverImageUrl: values.coverImageUrl.trim(),
    author: values.author.trim(),
    readMinutes: values.readMinutes,
    isPublished: values.isPublished,
  }
}

export async function listArticles(): Promise<WithId<Article>[]> {
  const articles = await listDocuments<Article>(COLLECTION)
  return articles.sort((a, b) =>
    (a.title ?? '').localeCompare(b.title ?? '', 'id'),
  )
}

export function getArticle(id: string) {
  return getDocument<Article>(COLLECTION, id)
}

export function createArticle(values: ArticleFormValues) {
  return createDocument(COLLECTION, toArticlePayload(values))
}

export function updateArticle(id: string, values: ArticleFormValues) {
  return updateDocument(COLLECTION, id, toArticlePayload(values))
}

export function deleteArticle(id: string) {
  return removeDocument(COLLECTION, id)
}
