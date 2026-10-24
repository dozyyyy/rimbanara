import type { Forest, WithId } from '../types/models.ts'
import type { ForestFormValues } from '../types/schemas.ts'
import {
  createDocument,
  getDocument,
  listDocuments,
  removeDocument,
  updateDocument,
} from './firestore.ts'

const COLLECTION = 'forests'

/** Builds the Firestore payload, including the automatic `nameLower`. */
export function toForestPayload(values: ForestFormValues) {
  return {
    name: values.name.trim(),
    nameLower: values.name.trim().toLowerCase(),
    forestType: values.forestType,
    protectionStatus: values.protectionStatus,
    region: values.region,
    province: values.province.trim(),
    areaHa: values.areaHa,
    description: values.description.trim(),
    characteristics: values.characteristics.trim(),
    flora: values.flora.map((entry) => entry.trim()).filter(Boolean),
    imageUrl: values.imageUrl.trim(),
    galleryUrls: values.galleryUrls
      .map((entry) => entry.trim())
      .filter(Boolean),
    locations: values.locations,
    relatedWildlifeIds: values.relatedWildlifeIds,
    isPublished: values.isPublished,
  }
}

export async function listForests(): Promise<WithId<Forest>[]> {
  const forests = await listDocuments<Forest>(COLLECTION)
  return forests.sort((a, b) =>
    (a.nameLower ?? '').localeCompare(b.nameLower ?? '', 'id'),
  )
}

export function getForest(id: string) {
  return getDocument<Forest>(COLLECTION, id)
}

export function createForest(values: ForestFormValues) {
  return createDocument(COLLECTION, toForestPayload(values))
}

export function updateForest(id: string, values: ForestFormValues) {
  return updateDocument(COLLECTION, id, toForestPayload(values))
}

export function deleteForest(id: string) {
  return removeDocument(COLLECTION, id)
}
