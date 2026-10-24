import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  FileText,
  Image as ImageIcon,
  MapPin,
  Plus,
  Trash2,
  Trees,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import FormAside from '../../components/FormAside.tsx'
import FormField from '../../components/FormField.tsx'
import FormSection from '../../components/FormSection.tsx'
import IdMultiSelect from '../../components/IdMultiSelect.tsx'
import ImageUrlInput from '../../components/ImageUrlInput.tsx'
import LocationsEditor from '../../components/LocationsEditor.tsx'
import PageHeader from '../../components/PageHeader.tsx'
import { useToast } from '../../components/toast-context.ts'
import {
  ghostButtonClass,
  inputClass,
  secondaryButtonClass,
  textareaClass,
} from '../../components/uiClasses.ts'
import { FOREST_TYPES, PROTECTION_STATUSES, REGIONS } from '../../types/enums.ts'
import type { Forest, WithId } from '../../types/models.ts'
import { forestSchema } from '../../types/schemas.ts'
import type { ForestFormValues } from '../../types/schemas.ts'
import {
  createForest,
  getForest,
  updateForest,
} from '../../services/forests.ts'
import { listWildlife } from '../../services/wildlife.ts'

const EMPTY_VALUES: ForestFormValues = {
  name: '',
  forestType: 'Hutan Hujan Tropis',
  protectionStatus: 'Taman Nasional',
  region: 'Sumatera',
  province: '',
  areaHa: undefined,
  description: '',
  characteristics: '',
  flora: [''],
  imageUrl: '',
  galleryUrls: [''],
  locations: [],
  relatedWildlifeIds: [],
  isPublished: true,
}

function toFormValues(forest: WithId<Forest>): ForestFormValues {
  return {
    name: forest.name ?? '',
    forestType: forest.forestType,
    protectionStatus: forest.protectionStatus,
    region: forest.region,
    province: forest.province ?? '',
    areaHa: typeof forest.areaHa === 'number' ? forest.areaHa : undefined,
    description: forest.description ?? '',
    characteristics: forest.characteristics ?? '',
    flora: forest.flora ?? [],
    imageUrl: forest.imageUrl ?? '',
    galleryUrls: forest.galleryUrls ?? [],
    locations: (forest.locations ?? []).map((location) => ({
      label: location.label ?? '',
      lat: Number(location.lat),
      lng: Number(location.lng),
    })),
    relatedWildlifeIds: forest.relatedWildlifeIds ?? [],
    isPublished: forest.isPublished ?? false,
  }
}

export default function ForestForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [relatedOptions, setRelatedOptions] = useState<
    { id: string; label: string; hint?: string }[]
  >([])
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
  } = useForm<ForestFormValues>({
    resolver: zodResolver(forestSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const wildlife = await listWildlife()
        if (!active) return
        setRelatedOptions(
          wildlife.map((entry) => ({
            id: entry.id,
            label: entry.name,
            hint: entry.isPublished ? undefined : 'draft',
          })),
        )
      } catch {
        if (active) setRelatedOptions([])
      }
    })()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!id) return

    let active = true

    void (async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const forest = await getForest(id)
        if (!active) return
        if (!forest) {
          setLoadError('Data hutan tidak ditemukan.')
          return
        }
        reset(toFormValues(forest))
      } catch {
        if (active) setLoadError('Gagal memuat data hutan.')
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [id, reset])

  const flora = useWatch({ control, name: 'flora' })
  const galleryUrls = useWatch({ control, name: 'galleryUrls' })
  const isPublished = useWatch({ control, name: 'isPublished' })

  function updateList(
    field: 'flora' | 'galleryUrls',
    values: string[] | undefined,
    index: number,
    nextValue: string,
  ) {
    const next = [...(values ?? [])]
    next[index] = nextValue
    setValue(field, next, { shouldDirty: true })
  }

  function removeFromList(
    field: 'flora' | 'galleryUrls',
    values: string[] | undefined,
    index: number,
  ) {
    setValue(
      field,
      (values ?? []).filter((_, entryIndex) => entryIndex !== index),
      { shouldDirty: true },
    )
  }

  const onSubmit = handleSubmit(
    async (values) => {
      setSaving(true)
      setSaveError(null)
      try {
        if (isEdit && id) {
          await updateForest(id, values)
          showToast('Data hutan diperbarui.')
        } else {
          await createForest(values)
          showToast('Data hutan ditambahkan.')
        }
        navigate('/hutan')
      } catch {
        setSaveError('Gagal menyimpan data hutan. Silakan coba lagi.')
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
          title="Hutan"
          backTo="/hutan"
          backLabel="Kembali ke daftar hutan"
        />
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="flex items-center gap-2 text-sm text-red-700">
            <AlertCircle size={16} aria-hidden="true" />
            {loadError}
          </p>
          <Link to="/hutan" className={secondaryButtonClass}>
            Kembali ke daftar hutan
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <PageHeader
        eyebrow="Konten"
        title={isEdit ? 'Ubah Hutan' : 'Tambah Hutan'}
        description="Lengkapi data kawasan hutan. Foto berupa tautan https, bukan unggahan file."
        backTo="/hutan"
        backLabel="Kembali ke daftar hutan"
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
            icon={Trees}
            title="Identitas hutan"
            description="Nama kawasan, wilayah administratif, dan status perlindungan."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Nama hutan"
                htmlFor="forest-name"
                required
                error={errors.name?.message}
              >
                <input
                  id="forest-name"
                  type="text"
                  className={inputClass}
                  placeholder="mis. Taman Nasional Gunung Leuser"
                  {...register('name')}
                />
              </FormField>

              <FormField
                label="Provinsi"
                htmlFor="forest-province"
                required
                error={errors.province?.message}
              >
                <input
                  id="forest-province"
                  type="text"
                  className={inputClass}
                  {...register('province')}
                />
              </FormField>

              <FormField
                label="Jenis hutan"
                htmlFor="forest-type"
                required
                error={errors.forestType?.message}
              >
                <select
                  id="forest-type"
                  className={inputClass}
                  {...register('forestType')}
                >
                  {FOREST_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Status perlindungan"
                htmlFor="forest-protection"
                required
                error={errors.protectionStatus?.message}
              >
                <select
                  id="forest-protection"
                  className={inputClass}
                  {...register('protectionStatus')}
                >
                  {PROTECTION_STATUSES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Wilayah"
                htmlFor="forest-region"
                required
                error={errors.region?.message}
              >
                <select
                  id="forest-region"
                  className={inputClass}
                  {...register('region')}
                >
                  {REGIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Luas (hektare)"
                htmlFor="forest-area"
                hint="Opsional"
                error={errors.areaHa?.message}
              >
                <input
                  id="forest-area"
                  type="number"
                  min="0"
                  step="any"
                  className={inputClass}
                  {...register('areaHa', {
                    setValueAs: (value) =>
                      value === '' || value === null ? undefined : Number(value),
                  })}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection
            icon={FileText}
            title="Deskripsi & flora"
            description="Ceritakan kondisi kawasan dan tumbuhan yang hidup di dalamnya."
          >
            <FormField
              label="Deskripsi"
              htmlFor="forest-description"
              required
              error={errors.description?.message}
            >
              <textarea
                id="forest-description"
                className={textareaClass}
                {...register('description')}
              />
            </FormField>

            <FormField
              label="Karakteristik"
              htmlFor="forest-characteristics"
              required
              error={errors.characteristics?.message}
            >
              <textarea
                id="forest-characteristics"
                className={textareaClass}
                {...register('characteristics')}
              />
            </FormField>

            <FormField label="Flora" hint="Satu nama flora per baris.">
              <div className="space-y-2">
                {(flora ?? []).map((entry, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={entry}
                      onChange={(event) =>
                        updateList('flora', flora, index, event.target.value)
                      }
                      aria-label={`Flora ${index + 1}`}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      className={`${ghostButtonClass} shrink-0 px-2.5`}
                      onClick={() => removeFromList('flora', flora, index)}
                      aria-label={`Hapus flora ${index + 1}`}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={() => setValue('flora', [...(flora ?? []), ''])}
                >
                  <Plus size={14} aria-hidden="true" />
                  Tambah flora
                </button>
              </div>
            </FormField>
          </FormSection>

          <FormSection
            icon={ImageIcon}
            title="Media"
            description="Semua foto memakai tautan https yang dapat diakses publik."
          >
            <FormField label="Foto utama" htmlFor="forest-image">
              <Controller
                control={control}
                name="imageUrl"
                render={({ field }) => (
                  <ImageUrlInput
                    id="forest-image"
                    value={field.value}
                    onChange={field.onChange}
                    invalid={Boolean(errors.imageUrl)}
                  />
                )}
              />
            </FormField>

            <FormField
              label="Galeri foto"
              hint="Tambahkan tautan https. Baris kosong diabaikan."
            >
              <div className="space-y-2">
                {(galleryUrls ?? []).map((entry, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={entry}
                      onChange={(event) =>
                        updateList('galleryUrls', galleryUrls, index, event.target.value)
                      }
                      placeholder="https://..."
                      aria-label={`URL galeri ${index + 1}`}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      className={`${ghostButtonClass} shrink-0 px-2.5`}
                      onClick={() =>
                        removeFromList('galleryUrls', galleryUrls, index)
                      }
                      aria-label={`Hapus galeri ${index + 1}`}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={() =>
                    setValue('galleryUrls', [...(galleryUrls ?? []), ''])
                  }
                >
                  <Plus size={14} aria-hidden="true" />
                  Tambah foto galeri
                </button>
                {errors.galleryUrls ? (
                  <p className="text-xs font-medium text-red-700">
                    Setiap URL galeri harus diawali https://
                  </p>
                ) : null}
              </div>
            </FormField>
          </FormSection>

          <FormSection
            icon={MapPin}
            title="Peta & relasi"
            description="Penanda peta dan tautan ke satwa yang hidup di kawasan ini."
          >
            <FormField
              label="Lokasi"
              hint="Klik peta untuk mengisi koordinat lokasi yang sedang aktif."
            >
              <Controller
                control={control}
                name="locations"
                render={({ field }) => (
                  <LocationsEditor
                    value={field.value}
                    onChange={field.onChange}
                    invalid={Boolean(errors.locations)}
                  />
                )}
              />
            </FormField>

            <FormField
              label="Satwa terkait"
              hint="Pilih satu atau lebih satwa yang hidup di hutan ini."
            >
              <Controller
                control={control}
                name="relatedWildlifeIds"
                render={({ field }) => (
                  <IdMultiSelect
                    options={relatedOptions}
                    value={field.value}
                    onChange={field.onChange}
                    emptyMessage="Belum ada data satwa. Tambahkan satwa lebih dulu."
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
          cancelTo="/hutan"
          tip="Hutan tanpa lokasi tidak muncul di peta aplikasi. Tambahkan minimal satu lokasi agar penanda tampil."
        />
      </form>
    </div>
  )
}
