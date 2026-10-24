/**
 * Zod schemas for the content forms (PRD §8.2). They mirror the Firestore
 * fields from PRD §5.3; the inferred types are what react-hook-form works with,
 * and the services convert the values into Firestore documents.
 */

import { z } from 'zod'

import { isHttpsUrl } from '../lib/driveUrl.ts'
import {
  ARTICLE_CATEGORIES,
  CONSERVATION_STATUSES,
  FOREST_TYPES,
  PROTECTION_STATUSES,
  QUIZ_DIFFICULTIES,
  QUIZ_TOPICS,
  REGIONS,
  WILDLIFE_TYPES,
} from './enums.ts'

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} wajib diisi`)

/** Photos are links, never uploads: `https://` or empty (PRD §5.4). */
const imageUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || isHttpsUrl(value),
    'URL harus diawali https://',
  )

/** Gallery rows may be added empty while editing; empty rows are ignored. */
const galleryUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || isHttpsUrl(value),
    'URL harus diawali https://',
  )

export const geoLocationSchema = z.object({
  label: requiredText('Label lokasi'),
  lat: z
    .number({ error: 'Latitude harus berupa angka' })
    .min(-90, 'Latitude minimal -90')
    .max(90, 'Latitude maksimal 90'),
  lng: z
    .number({ error: 'Longitude harus berupa angka' })
    .min(-180, 'Longitude minimal -180')
    .max(180, 'Longitude maksimal 180'),
})

export const forestSchema = z.object({
  name: requiredText('Nama hutan'),
  forestType: z.enum(FOREST_TYPES, { error: 'Pilih jenis hutan' }),
  protectionStatus: z.enum(PROTECTION_STATUSES, {
    error: 'Pilih status perlindungan',
  }),
  region: z.enum(REGIONS, { error: 'Pilih wilayah' }),
  province: requiredText('Provinsi'),
  areaHa: z
    .number({ error: 'Luas harus berupa angka' })
    .positive('Luas harus lebih dari 0')
    .optional(),
  description: requiredText('Deskripsi'),
  characteristics: requiredText('Karakteristik'),
  flora: z.array(z.string().trim()),
  imageUrl,
  galleryUrls: z.array(galleryUrl),
  locations: z.array(geoLocationSchema),
  relatedWildlifeIds: z.array(z.string()),
  isPublished: z.boolean(),
})

export const wildlifeSchema = z.object({
  name: requiredText('Nama satwa'),
  scientificName: requiredText('Nama ilmiah'),
  localName: z.string().trim(),
  type: z.enum(WILDLIFE_TYPES, { error: 'Pilih jenis satwa' }),
  region: z.enum(REGIONS, { error: 'Pilih wilayah' }),
  province: requiredText('Provinsi'),
  habitat: requiredText('Habitat'),
  characteristics: requiredText('Karakteristik'),
  description: requiredText('Deskripsi'),
  conservationStatus: z.enum(CONSERVATION_STATUSES, {
    error: 'Pilih status konservasi',
  }),
  funFact: z.string().trim(),
  imageUrl,
  galleryUrls: z.array(galleryUrl),
  locations: z.array(geoLocationSchema),
  relatedForestIds: z.array(z.string()),
  isPublished: z.boolean(),
})

export const articleSchema = z.object({
  title: requiredText('Judul'),
  summary: requiredText('Ringkasan'),
  content: requiredText('Isi artikel'),
  category: z.enum(ARTICLE_CATEGORIES, { error: 'Pilih kategori artikel' }),
  coverImageUrl: imageUrl,
  author: requiredText('Penulis'),
  readMinutes: z
    .number({ error: 'Menit baca harus berupa angka' })
    .int('Menit baca harus bilangan bulat')
    .min(1, 'Minimal 1 menit')
    .max(60, 'Maksimal 60 menit'),
  isPublished: z.boolean(),
})

export const quizQuestionSchema = z.object({
  question: requiredText('Pertanyaan'),
  options: z
    .array(z.string().trim().min(1, 'Opsi wajib diisi'))
    .length(4, 'Soal harus punya tepat 4 opsi'),
  correctIndex: z
    .number({ error: 'Pilih jawaban benar' })
    .int()
    .min(0, 'Pilih jawaban benar')
    .max(3, 'Pilih jawaban benar'),
  explanation: requiredText('Pembahasan'),
  topic: z.enum(QUIZ_TOPICS, { error: 'Pilih topik' }),
  difficulty: z.enum(QUIZ_DIFFICULTIES, { error: 'Pilih tingkat kesulitan' }),
  imageUrl,
  isPublished: z.boolean(),
})

export type ForestFormValues = z.infer<typeof forestSchema>
export type WildlifeFormValues = z.infer<typeof wildlifeSchema>
export type GeoLocationFormValues = z.infer<typeof geoLocationSchema>
export type ArticleFormValues = z.infer<typeof articleSchema>
export type QuizQuestionFormValues = z.infer<typeof quizQuestionSchema>
