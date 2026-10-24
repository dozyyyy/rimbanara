import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  Bird,
  FileText,
  Image as ImageIcon,
  MapPin,
  Plus,
  Trash2,
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
import {
  CONSERVATION_STATUSES,
  REGIONS,
  WILDLIFE_TYPES,
} from '../../types/enums.ts'
import type { Wildlife, WithId } from '../../types/models.ts'
import { wildlifeSchema } from '../../types/schemas.ts'
import type { WildlifeFormValues } from '../../types/schemas.ts'
import { listForests } from '../../services/forests.ts'
import {
  createWildlife,
  getWildlife,
  updateWildlife,
} from '../../services/wildlife.ts'

const EMPTY_VALUES: WildlifeFormValues = {
  name: '',
  scientificName: '',
  localName: '',
  type: 'Mamalia',
  region: 'Sumatera',
  province: '',
  habitat: '',
  characteristics: '',
  description: '',
  conservationStatus: 'LC',
  funFact: '',
  imageUrl: '',
  galleryUrls: [''],
  locations: [],
  relatedForestIds: [],
  isPublished: true,
}

function toFormValues(wildlife: WithId<Wildlife>): WildlifeFormValues {
  return {
    name: wildlife.name ?? '',
    scientificName: wildlife.scientificName ?? '',
    localName: wildlife.localName ?? '',
    type: wildlife.type,
    region: wildlife.region,
    province: wildlife.province ?? '',
    habitat: wildlife.habitat ?? '',
    characteristics: wildlife.characteristics ?? '',
    description: wildlife.description ?? '',
    conservationStatus: wildlife.conservationStatus,
    funFact: wildlife.funFact ?? '',
    imageUrl: wildlife.imageUrl ?? '',
    galleryUrls: wildlife.galleryUrls ?? [],
    locations: (wildlife.locations ?? []).map((location) => ({
      label: location.label ?? '',
      lat: Number(location.lat),
      lng: Number(location.lng),
    })),
    relatedForestIds: wildlife.relatedForestIds ?? [],
    isPublished: wildlife.isPublished ?? false,
  }
}

export default function WildlifeForm() {
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
  } = useForm<WildlifeFormValues>({
    resolver: zodResolver(wildlifeSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const forests = await listForests()
        if (!active) return
        setRelatedOptions(
          forests.map((entry) => ({
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
        const wildlife = await getWildlife(id)
        if (!active) return
        if (!wildlife) {
          setLoadError('Data satwa tidak ditemukan.')
          return
        }
        reset(toFormValues(wildlife))
      } catch {
        if (active) setLoadError('Gagal memuat data satwa.')
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [id, reset])

  const galleryUrls = useWatch({ control, name: 'galleryUrls' })
  const isPublished = useWatch({ control, name: 'isPublished' })

  function updateGallery(index: number, nextValue: string) {
    const next = [...(galleryUrls ?? [])]
    next[index] = nextValue
    setValue('galleryUrls', next, { shouldDirty: true })
  }

  function removeGallery(index: number) {
    setValue(
      'galleryUrls',
      (galleryUrls ?? []).filter((_, entryIndex) => entryIndex !== index),
      { shouldDirty: true },
    )
  }

  const onSubmit = handleSubmit(
    async (values) => {
      setSaving(true)
      setSaveError(null)
      try {
        if (isEdit && id) {
          await updateWildlife(id, values)
          showToast('Data satwa diperbarui.')
        } else {
          await createWildlife(values)
          showToast('Data satwa ditambahkan.')
        }
        navigate('/satwa')
      } catch {
        setSaveError('Gagal menyimpan data satwa. Silakan coba lagi.')
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
          title="Satwa"
          backTo="/satwa"
          backLabel="Kembali ke daftar satwa"
        />
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="flex items-center gap-2 text-sm text-red-700">
            <AlertCircle size={16} aria-hidden="true" />
            {loadError}
          </p>
          <Link to="/satwa" className={secondaryButtonClass}>
            Kembali ke daftar satwa
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <PageHeader
        eyebrow="Konten"
        title={isEdit ? 'Ubah Satwa' : 'Tambah Satwa'}
        description="Lengkapi data satwa. Foto berupa tautan https, bukan unggahan file."
        backTo="/satwa"
        backLabel="Kembali ke daftar satwa"
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
            icon={Bird}
            title="Identitas satwa"
            description="Nama, klasifikasi, dan status konservasi menurut IUCN."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Nama satwa"
                htmlFor="wildlife-name"
                required
                error={errors.name?.message}
              >
                <input
                  id="wildlife-name"
                  type="text"
                  className={inputClass}
                  placeholder="mis. Orangutan Kalimantan"
                  {...register('name')}
                />
              </FormField>

              <FormField
                label="Nama ilmiah"
                htmlFor="wildlife-scientific"
                required
                error={errors.scientificName?.message}
              >
                <input
                  id="wildlife-scientific"
                  type="text"
                  className={`${inputClass} italic`}
                  placeholder="mis. Pongo pygmaeus"
                  {...register('scientificName')}
                />
              </FormField>

              <FormField
                label="Nama lokal"
                htmlFor="wildlife-local"
                hint="Opsional"
                error={errors.localName?.message}
              >
                <input
                  id="wildlife-local"
                  type="text"
                  className={inputClass}
                  {...register('localName')}
                />
              </FormField>

              <FormField
                label="Provinsi"
                htmlFor="wildlife-province"
                required
                error={errors.province?.message}
              >
                <input
                  id="wildlife-province"
                  type="text"
                  className={inputClass}
                  {...register('province')}
                />
              </FormField>

              <FormField
                label="Jenis satwa"
                htmlFor="wildlife-type"
                required
                error={errors.type?.message}
              >
                <select
                  id="wildlife-type"
                  className={inputClass}
                  {...register('type')}
                >
                  {WILDLIFE_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Wilayah"
                htmlFor="wildlife-region"
                required
                error={errors.region?.message}
              >
                <select
                  id="wildlife-region"
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
                label="Status konservasi (IUCN)"
                htmlFor="wildlife-conservation"
                required
                error={errors.conservationStatus?.message}
              >
                <select
                  id="wildlife-conservation"
                  className={inputClass}
                  {...register('conservationStatus')}
                >
                  {CONSERVATION_STATUSES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Habitat"
                htmlFor="wildlife-habitat"
                required
                error={errors.habitat?.message}
              >
                <input
                  id="wildlife-habitat"
                  type="text"
                  className={inputClass}
                  placeholder="mis. Hutan hujan dataran rendah"
                  {...register('habitat')}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection
            icon={FileText}
            title="Deskripsi"
            description="Teks ini tampil di halaman detail satwa pada aplikasi mobile."
          >
            <FormField
              label="Karakteristik"
              htmlFor="wildlife-characteristics"
              required
              error={errors.characteristics?.message}
            >
              <textarea
                id="wildlife-characteristics"
                className={textareaClass}
                {...register('characteristics')}
              />
            </FormField>

            <FormField
              label="Deskripsi"
              htmlFor="wildlife-description"
              required
              error={errors.description?.message}
            >
              <textarea
                id="wildlife-description"
                className={textareaClass}
                {...register('description')}
              />
            </FormField>

            <FormField
              label="Tahukah kamu?"
              htmlFor="wildlife-funfact"
              hint="Opsional, tampil di bagian khusus layar detail."
              error={errors.funFact?.message}
            >
              <textarea
                id="wildlife-funfact"
                className={textareaClass}
                {...register('funFact')}
              />
            </FormField>
          </FormSection>

          <FormSection
            icon={ImageIcon}
            title="Media"
            description="Semua foto memakai tautan https yang dapat diakses publik."
          >
            <FormField label="Foto utama" htmlFor="wildlife-image">
              <Controller
                control={control}
                name="imageUrl"
                render={({ field }) => (
                  <ImageUrlInput
                    id="wildlife-image"
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
                      onChange={(event) => updateGallery(index, event.target.value)}
                      placeholder="https://..."
                      aria-label={`URL galeri ${index + 1}`}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      className={`${ghostButtonClass} shrink-0 px-2.5`}
                      onClick={() => removeGallery(index)}
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
            description="Penanda peta dan tautan ke hutan terkait di aplikasi mobile."
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
              label="Hutan terkait"
              hint="Pilih satu atau lebih hutan yang menjadi habitat satwa ini."
            >
              <Controller
                control={control}
                name="relatedForestIds"
                render={({ field }) => (
                  <IdMultiSelect
                    options={relatedOptions}
                    value={field.value}
                    onChange={field.onChange}
                    emptyMessage="Belum ada data hutan. Tambahkan hutan lebih dulu."
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
          cancelTo="/satwa"
          tip="Gunakan foto berupa tautan https. Untuk Google Drive, tempel link berbagi lalu klik Konversi link Drive."
        />
      </form>
    </div>
  )
}
