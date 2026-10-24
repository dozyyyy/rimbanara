import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  BookOpen,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import FormAside from '../../components/FormAside.tsx'
import FormField from '../../components/FormField.tsx'
import FormSection from '../../components/FormSection.tsx'
import ImageUrlInput from '../../components/ImageUrlInput.tsx'
import PageHeader from '../../components/PageHeader.tsx'
import { useToast } from '../../components/toast-context.ts'
import {
  inputClass,
  secondaryButtonClass,
  textareaClass,
} from '../../components/uiClasses.ts'
import {
  createArticle,
  getArticle,
  updateArticle,
} from '../../services/articles.ts'
import { ARTICLE_CATEGORIES } from '../../types/enums.ts'
import type { Article, WithId } from '../../types/models.ts'
import { articleSchema } from '../../types/schemas.ts'
import type { ArticleFormValues } from '../../types/schemas.ts'

const EMPTY_VALUES: ArticleFormValues = {
  title: '',
  summary: '',
  content: '',
  category: 'Edukasi Umum',
  coverImageUrl: '',
  author: 'Tim RIMBANARA',
  readMinutes: 3,
  isPublished: true,
}

function toFormValues(article: WithId<Article>): ArticleFormValues {
  return {
    title: article.title ?? '',
    summary: article.summary ?? '',
    content: article.content ?? '',
    category: article.category,
    coverImageUrl: article.coverImageUrl ?? '',
    author: article.author ?? '',
    readMinutes:
      typeof article.readMinutes === 'number' ? article.readMinutes : 3,
    isPublished: article.isPublished ?? false,
  }
}

export default function ArticleForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showValidationHint, setShowValidationHint] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!id) return

    let active = true

    void (async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const article = await getArticle(id)
        if (!active) return
        if (!article) {
          setLoadError('Data artikel tidak ditemukan.')
          return
        }
        reset(toFormValues(article))
      } catch {
        if (active) setLoadError('Gagal memuat data artikel.')
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [id, reset])

  const isPublished = useWatch({ control, name: 'isPublished' })

  const onSubmit = handleSubmit(
    async (values) => {
      setSaving(true)
      setSaveError(null)
      try {
        if (isEdit && id) {
          await updateArticle(id, values)
          showToast('Artikel diperbarui.')
        } else {
          await createArticle(values)
          showToast('Artikel ditambahkan.')
        }
        navigate('/artikel')
      } catch {
        setSaveError('Gagal menyimpan artikel. Silakan coba lagi.')
      } finally {
        setSaving(false)
      }
    },
    () => setShowValidationHint(true),
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-20 w-full rounded-2xl" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <PageHeader
          eyebrow="Konten"
          title="Artikel"
          backTo="/artikel"
          backLabel="Kembali ke daftar artikel"
        />
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="flex items-center gap-2 text-sm text-red-700">
            <AlertCircle size={16} aria-hidden="true" />
            {loadError}
          </p>
          <Link to="/artikel" className={secondaryButtonClass}>
            Kembali ke daftar artikel
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <PageHeader
        eyebrow="Konten"
        title={isEdit ? 'Ubah Artikel' : 'Tambah Artikel'}
        description="Tulis artikel edukasi dalam teks biasa; pisahkan paragraf dengan satu baris kosong."
        backTo="/artikel"
        backLabel="Kembali ke daftar artikel"
      />

      {saveError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {saveError}
        </div>
      ) : null}

      {showValidationHint && Object.keys(errors).length > 0 ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          Periksa kembali isian yang ditandai merah sebelum menyimpan.
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]"
        noValidate
      >
        <div className="space-y-6">
          <FormSection
            icon={BookOpen}
            title="Informasi artikel"
            description="Judul dan atribut yang tampil pada kartu daftar artikel."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Judul"
                htmlFor="article-title"
                required
                error={errors.title?.message}
                className="sm:col-span-2"
              >
                <input
                  id="article-title"
                  type="text"
                  className={inputClass}
                  {...register('title')}
                />
              </FormField>

              <FormField
                label="Penulis"
                htmlFor="article-author"
                required
                error={errors.author?.message}
              >
                <input
                  id="article-author"
                  type="text"
                  className={inputClass}
                  {...register('author')}
                />
              </FormField>

              <FormField
                label="Kategori"
                htmlFor="article-category"
                required
                error={errors.category?.message}
              >
                <select
                  id="article-category"
                  className={inputClass}
                  {...register('category')}
                >
                  {ARTICLE_CATEGORIES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Menit baca"
                htmlFor="article-read-minutes"
                required
                hint="Perkiraan waktu baca dalam menit."
                error={errors.readMinutes?.message}
              >
                <input
                  id="article-read-minutes"
                  type="number"
                  min="1"
                  step="1"
                  className={inputClass}
                  {...register('readMinutes', { valueAsNumber: true })}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection
            icon={FileText}
            title="Ringkasan & isi"
            description="Ringkasan tampil di kartu; isi lengkap tampil di layar baca."
          >
            <FormField
              label="Ringkasan"
              htmlFor="article-summary"
              required
              hint="Satu atau dua kalimat singkat."
              error={errors.summary?.message}
            >
              <textarea
                id="article-summary"
                className={textareaClass}
                {...register('summary')}
              />
            </FormField>

            <FormField
              label="Isi artikel"
              htmlFor="article-content"
              required
              hint="Pisahkan setiap paragraf dengan satu baris kosong."
              error={errors.content?.message}
            >
              <textarea
                id="article-content"
                className={`${textareaClass} min-h-72`}
                {...register('content')}
              />
            </FormField>
          </FormSection>

          <FormSection
            icon={ImageIcon}
            title="Sampul"
            description="Gambar sampul artikel pada daftar dan layar baca."
          >
            <FormField label="Foto sampul" htmlFor="article-cover">
              <Controller
                control={control}
                name="coverImageUrl"
                render={({ field }) => (
                  <ImageUrlInput
                    id="article-cover"
                    value={field.value}
                    onChange={field.onChange}
                    invalid={Boolean(errors.coverImageUrl)}
                  />
                )}
              />
            </FormField>
          </FormSection>
        </div>

        <FormAside
          published={Boolean(isPublished)}
          onPublishedChange={(value) =>
            setValue('isPublished', value, { shouldDirty: true })
          }
          saving={saving}
          cancelTo="/artikel"
          tip="Ringkasan yang jelas membantu pembaca memilih artikel. Pisahkan paragraf isi dengan satu baris kosong."
        />
      </form>
    </div>
  )
}
