import type { Wildlife, WithId } from '../types/models.ts'
import type { WildlifeFormValues } from '../types/schemas.ts'
import {
  createDocument,
  getDocument,
  listDocuments,
  removeDocument,
  updateDocument,
} from './firestore.ts'

const COLLECTION = 'wildlife'

/** Builds the Firestore payload, including the automatic `nameLower`. */
export function toWildlifePayload(values: WildlifeFormValues) {
  return {
    name: values.name.trim(),
    nameLower: values.name.trim().toLowerCase(),
    scientificName: values.scientificName.trim(),
    localName: values.localName.trim() || undefined,
    type: values.type,
    region: values.region,
    province: values.province.trim(),
    habitat: values.habitat.trim(),
    characteristics: values.characteristics.trim(),
    description: values.description.trim(),
    conservationStatus: values.conservationStatus,
    funFact: values.funFact.trim() || undefined,
    imageUrl: values.imageUrl.trim(),
    galleryUrls: values.galleryUrls
      .map((entry) => entry.trim())
      .filter(Boolean),
    locations: values.locations,
    relatedForestIds: values.relatedForestIds,
    isPublished: values.isPublished,
  }
}

export async function listWildlife(): Promise<WithId<Wildlife>[]> {
  const wildlife = await listDocuments<Wildlife>(COLLECTION)
  return wildlife.sort((a, b) =>
    (a.nameLower ?? '').localeCompare(b.nameLower ?? '', 'id'),
  )
}

export function getWildlife(id: string) {
  return getDocument<Wildlife>(COLLECTION, id)
}

export function createWildlife(values: WildlifeFormValues) {
  return createDocument(COLLECTION, toWildlifePayload(values))
}

export function updateWildlife(id: string, values: WildlifeFormValues) {
  return updateDocument(COLLECTION, id, toWildlifePayload(values))
}

export function deleteWildlife(id: string) {
  return removeDocument(COLLECTION, id)
}
