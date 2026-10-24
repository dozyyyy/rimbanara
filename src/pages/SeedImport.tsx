import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  RefreshCw,
} from 'lucide-react'

import ConfirmDialog from '../components/ConfirmDialog.tsx'
import PageHeader from '../components/PageHeader.tsx'
import { useToast } from '../components/toast-context.ts'
import {
  cardClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../components/uiClasses.ts'
import { getContentStats } from '../services/dashboard.ts'
import type { CollectionStats } from '../services/dashboard.ts'
import { getSeedCounts, importSeedData } from '../services/seed.ts'
import type { ImportProgress } from '../services/seed.ts'
import type { ContentCollection } from '../types/models.ts'

const LABELS: Record<ContentCollection, string> = {
  forests: 'Hutan',
  wildlife: 'Satwa',
  articles: 'Artikel',
  quizQuestions: 'Soal kuis',
}

const COLLECTION_ORDER: ContentCollection[] = [
  'forests',
  'wildlife',
  'articles',
  'quizQuestions',
]

/**
 * A7: import `seed/seed-data.json` once, as the signed-in admin. Existing
 * content triggers a warning so the admin can avoid duplicates.
 */
export default function SeedImport() {
  const { showToast } = useToast()
  const seedCounts = getSeedCounts()

  const [existing, setExisting] = useState<CollectionStats[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState<ImportProgress | null>(null)
  const [imported, setImported] = useState(false)

  useEffect(() => {
    let active = true

    void (async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const stats = await getContentStats()
        if (!active) return
        setExisting(stats)
      } catch {
        if (!active) return
        setLoadError('Gagal memeriksa data yang sudah ada.')
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [reloadKey])

  const existingByCollection = (collectionName: ContentCollection) =>
    existing.find((entry) => entry.collection === collectionName)?.total ?? 0

  const hasExistingData = existing.some((entry) => entry.total > 0)

  async function handleImport() {
    setImporting(true)
    setProgress(null)
    try {
      await importSeedData(setProgress)
      setImported(true)
      setConfirmOpen(false)
      setReloadKey((key) => key + 1)
      showToast('Data contoh berhasil diimpor.')
    } catch {
      showToast(
        'Impor gagal. Pastikan Anda login sebagai admin lalu coba lagi.',
        'error',
      )
    } finally {
      setImporting(false)
    }
  }

  const totalSeedDocuments =
    seedCounts.forests +
    seedCounts.wildlife +
    seedCounts.articles +
    seedCounts.quizQuestions

  const progressPercent =
    progress && progress.total > 0
      ? Math.round((progress.done / progress.total) * 100)
      : 0

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Alat"
        title="Impor Data Contoh"
        description="Menulis isi seed/seed-data.json ke Firestore. Jalankan sekali saja, hanya saat login sebagai admin."
        actions={
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => setReloadKey((key) => key + 1)}
            disabled={loading || importing}
          >
            <RefreshCw
              size={14}
              aria-hidden="true"
              className={loading ? 'animate-spin' : undefined}
            />
            Periksa ulang
          </button>
        }
      />

      {loadError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {loadError}
        </div>
      ) : null}

      {hasExistingData ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Koleksi sudah berisi data.</p>
            <p className="mt-1 leading-relaxed">
              Mengimpor sekarang akan menambah dokumen baru di samping data yang
              sudah ada, sehingga bisa terjadi duplikasi. Periksa jumlah di bawah
              sebelum melanjutkan.
            </p>
          </div>
        </div>
      ) : null}

      <div className={`${cardClass} overflow-hidden`}>
        <div className="flex items-start gap-3 border-b border-cream-200 bg-cream-50/60 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <Database size={17} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-stone-900">
              Perbandingan data
            </h2>
            <p className="mt-0.5 text-xs text-stone-500">
              Jumlah dokumen saat ini dibandingkan isi berkas contoh.
            </p>
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-cream-50/40">
              <th
                scope="col"
                className="px-5 py-3 text-[10px] font-semibold tracking-[0.14em] text-stone-500 uppercase"
              >
                Koleksi
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-[10px] font-semibold tracking-[0.14em] text-stone-500 uppercase"
              >
                Data saat ini
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-[10px] font-semibold tracking-[0.14em] text-stone-500 uppercase"
              >
                Dari seed
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-right text-[10px] font-semibold tracking-[0.14em] text-stone-500 uppercase"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {COLLECTION_ORDER.map((collectionName) => {
              const current = existingByCollection(collectionName)
              return (
                <tr
                  key={collectionName}
                  className="border-t border-cream-100 transition-colors hover:bg-cream-50/60"
                >
                  <td className="px-5 py-3.5 font-medium text-stone-800">
                    {LABELS[collectionName]}
                  </td>
                  <td className="px-4 py-3.5 text-stone-600 tabular-nums">
                    {loading ? (
                      <span className="skeleton inline-block h-3.5 w-8 rounded-full" />
                    ) : (
                      current
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-stone-600 tabular-nums">
                    {seedCounts[collectionName]}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {loading ? null : current > 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200 ring-inset">
                        Sudah terisi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700 ring-1 ring-brand-200 ring-inset">
                        Kosong
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="flex flex-col gap-3 border-t border-cream-200 bg-cream-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-relaxed text-stone-500">
            {totalSeedDocuments} dokumen contoh: {seedCounts.forests} hutan,{' '}
            {seedCounts.wildlife} satwa, {seedCounts.articles} artikel,{' '}
            {seedCounts.quizQuestions} soal kuis. Semua berstatus terbit dengan
            URL foto kosong.
          </p>
          <button
            type="button"
            className={primaryButtonClass}
            onClick={() => setConfirmOpen(true)}
            disabled={importing || loading}
          >
            <Download size={14} aria-hidden="true" />
            {importing ? 'Mengimpor...' : 'Impor data contoh'}
          </button>
        </div>
      </div>

      {progress ? (
        <div className={`${cardClass} p-5`} role="status" aria-live="polite">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-stone-700">{progress.step}</span>
            <span className="text-stone-500 tabular-nums">
              {progress.done}/{progress.total}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-100">
            <div
              className="h-full rounded-full bg-brand-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : null}

      {imported ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-4 text-sm text-brand-900"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p className="leading-relaxed">
            Impor selesai. Periksa halaman Hutan, Satwa, Artikel, dan Soal Kuis
            untuk memastikan datanya masuk.
          </p>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Impor data contoh sekarang?"
        description={
          hasExistingData
            ? `Sebanyak ${totalSeedDocuments} dokumen akan ditambahkan. Koleksi yang sudah berisi data dapat menjadi duplikat.`
            : `${totalSeedDocuments} dokumen contoh akan ditulis ke Firestore.`
        }
        confirmLabel="Impor"
        busy={importing}
        onConfirm={handleImport}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
