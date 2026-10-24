import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Bird,
  BookOpen,
  HelpCircle,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trees,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import PageHeader from '../components/PageHeader.tsx'
import { cardClass, secondaryButtonClass } from '../components/uiClasses.ts'
import { getContentStats } from '../services/dashboard.ts'
import type { CollectionStats } from '../services/dashboard.ts'
import type { ContentCollection } from '../types/models.ts'

const COLLECTION_META: Record<
  ContentCollection,
  {
    label: string
    href: string
    icon: typeof Trees
    tile: string
    accent: string
  }
> = {
  forests: {
    label: 'Hutan',
    href: '/hutan',
    icon: Trees,
    tile: 'bg-brand-50 text-brand-700',
    accent: 'bg-brand-500',
  },
  wildlife: {
    label: 'Satwa',
    href: '/satwa',
    icon: Bird,
    tile: 'bg-amber-50 text-amber-700',
    accent: 'bg-amber-500',
  },
  articles: {
    label: 'Artikel',
    href: '/artikel',
    icon: BookOpen,
    tile: 'bg-sky-50 text-sky-700',
    accent: 'bg-sky-500',
  },
  quizQuestions: {
    label: 'Soal Kuis',
    href: '/kuis',
    icon: HelpCircle,
    tile: 'bg-clay-50 text-clay-600',
    accent: 'bg-clay-500',
  },
}

const COLLECTION_ORDER: ContentCollection[] = [
  'forests',
  'wildlife',
  'articles',
  'quizQuestions',
]

const QUICK_ACTIONS = [
  { to: '/hutan/baru', label: 'Tambah hutan', icon: Trees },
  { to: '/satwa/baru', label: 'Tambah satwa', icon: Bird },
  { to: '/artikel/baru', label: 'Tulis artikel', icon: BookOpen },
  { to: '/kuis/baru', label: 'Buat soal kuis', icon: HelpCircle },
]

function todayLabel() {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
}

/** Dashboard (PRD §8.2 A2). Only content counts — no user data. */
export default function Dashboard() {
  const [stats, setStats] = useState<CollectionStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getContentStats()
        if (!active) return
        setStats(data)
      } catch {
        if (!active) return
        setError('Gagal memuat ringkasan data. Periksa koneksi lalu coba lagi.')
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [reloadKey])

  const orderedStats = COLLECTION_ORDER.map((name) =>
    stats.find((entry) => entry.collection === name),
  ).filter((entry): entry is CollectionStats => Boolean(entry))

  const totalDocuments = orderedStats.reduce((sum, entry) => sum + entry.total, 0)
  const totalDrafts = orderedStats.reduce((sum, entry) => sum + entry.drafts, 0)
  const totalPublished = totalDocuments - totalDrafts
  const publishedPercent =
    totalDocuments === 0 ? 0 : Math.round((totalPublished / totalDocuments) * 100)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ringkasan"
        title="Dashboard"
        description={`Jumlah dokumen konten per koleksi. ${todayLabel()}.`}
        actions={
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => setReloadKey((key) => key + 1)}
            disabled={loading}
          >
            <RefreshCw
              size={14}
              aria-hidden="true"
              className={loading ? 'animate-spin' : undefined}
            />
            Muat ulang
          </button>
        }
      />

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </div>
      ) : null}

      <section className="animate-rise relative overflow-hidden rounded-3xl bg-brand-950 px-6 py-7 text-cream-100 shadow-panel sm:px-8 sm:py-8">
        <img
          src="/logo-mark.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -top-6 -right-6 h-52 w-52 rotate-6 rounded-3xl object-cover opacity-10 sm:h-64 sm:w-64"
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-brand-500/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-300 uppercase">
            Status konten
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Selamat datang kembali di panel RIMBANARA.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-100/80">
            Semua konten yang Anda kelola di sini tampil di aplikasi mobile
            pengguna. Periksa status publikasi sebelum menambah data baru.
          </p>

          <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
            {[
              { label: 'Total konten', value: totalDocuments },
              { label: 'Sudah terbit', value: totalPublished },
              { label: 'Masih draft', value: totalDrafts },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-[11px] tracking-wide text-brand-200/80">
                  {item.label}
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-white tabular-nums">
                  {loading ? (
                    <span className="inline-block h-6 w-10 animate-pulse rounded bg-white/20" />
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6">
            <div className="flex items-center justify-between text-[11px] text-brand-200/80">
              <span>Rasio publikasi</span>
              <span className="font-medium text-white tabular-nums">
                {loading ? '—' : `${publishedPercent}%`}
              </span>
            </div>
            <div
              className="mt-2 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/15"
              role="progressbar"
              aria-valuenow={publishedPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Rasio konten yang sudah terbit"
            >
              <div
                className="h-full rounded-full bg-brand-300 transition-all duration-500"
                style={{ width: `${publishedPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/hutan/baru"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-900 shadow-sm transition hover:bg-cream-100"
            >
              <Plus size={15} aria-hidden="true" />
              Tambah hutan
            </Link>
            <Link
              to="/impor"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Impor data contoh
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? COLLECTION_ORDER.map((name) => (
              <div key={name} className={`${cardClass} p-5`} aria-hidden="true">
                <div className="skeleton h-9 w-9 rounded-xl" />
                <div className="skeleton mt-4 h-3 w-20 rounded-full" />
                <div className="skeleton mt-3 h-7 w-12 rounded-lg" />
                <div className="skeleton mt-4 h-1.5 w-full rounded-full" />
              </div>
            ))
          : orderedStats.map((entry) => {
              const meta = COLLECTION_META[entry.collection]
              const Icon = meta.icon
              const percent =
                entry.total === 0
                  ? 0
                  : Math.round(((entry.total - entry.drafts) / entry.total) * 100)
              return (
                <Link
                  key={entry.collection}
                  to={meta.href}
                  className={`${cardClass} group block p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-float`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${meta.tile}`}
                    >
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    <ArrowRight
                      size={15}
                      aria-hidden="true"
                      className="text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600"
                    />
                  </div>
                  <p className="mt-4 text-sm font-medium text-stone-600">
                    {meta.label}
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-stone-900 tabular-nums">
                    {entry.total}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {entry.drafts} draft · {entry.total - entry.drafts} terbit
                  </p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-cream-100">
                    <div
                      className={`h-full rounded-full ${meta.accent} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </Link>
              )
            })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <section className={`${cardClass} p-5 sm:p-6`}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-stone-900">
                Aksi cepat
              </h2>
              <p className="mt-1 text-xs text-stone-500">
                Langsung menuju formulir tambah konten.
              </p>
            </div>
            <Link
              to="/hutan"
              className="text-xs font-medium text-brand-700 hover:text-brand-900"
            >
              Lihat konten
            </Link>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="group flex items-center gap-3 rounded-xl border border-cream-200 bg-cream-50/50 px-3.5 py-3 text-sm font-medium text-stone-700 transition hover:border-brand-200 hover:bg-brand-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand-700 ring-1 ring-cream-200">
                    <Icon size={15} aria-hidden="true" />
                  </span>
                  <span className="flex-1">{action.label}</span>
                  <Plus
                    size={15}
                    aria-hidden="true"
                    className="text-stone-400 transition group-hover:text-brand-700"
                  />
                </Link>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-brand-50/70 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-brand-800">
            <ShieldCheck size={17} aria-hidden="true" />
            <h2 className="text-sm font-semibold">Tentang dashboard</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-brand-900/75">
            Dashboard hanya menampilkan jumlah konten. Data pengguna aplikasi
            mobile tidak ditampilkan maupun dikelola di panel ini.
          </p>
          <p className="mt-3 border-t border-brand-200/60 pt-3 text-xs leading-relaxed text-brand-900/60">
            Angka diambil dengan agregasi Firestore, jadi membuka halaman ini
            tidak membaca seluruh dokumen.
          </p>
        </section>
      </div>

      {!loading && orderedStats.length > 0 ? (
        <p className="text-center text-xs text-stone-400">
          Total {totalDocuments} dokumen konten · {totalDrafts} draft menunggu
          diterbitkan
        </p>
      ) : null}
    </div>
  )
}
