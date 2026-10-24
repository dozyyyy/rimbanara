import { Info, Save } from 'lucide-react'
import { Link } from 'react-router-dom'

import Switch from './Switch.tsx'
import {
  cardClass,
  primaryButtonClass,
  secondaryButtonClass,
} from './uiClasses.ts'

interface FormAsideProps {
  published: boolean
  onPublishedChange: (published: boolean) => void
  saving: boolean
  cancelTo: string
  tip: string
}

/**
 * Right-hand publication card shared by all content forms. It lives inside the
 * form, so the save button submits natively, and stays visible while scrolling
 * on large screens.
 */
export default function FormAside({
  published,
  onPublishedChange,
  saving,
  cancelTo,
  tip,
}: FormAsideProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className={`${cardClass} p-5`}>
        <h2 className="text-sm font-semibold text-stone-900">Publikasi</h2>
        <p className="mt-1 text-xs leading-relaxed text-stone-500">
          Konten berstatus draft tidak tampil di aplikasi mobile.
        </p>

        <div className="mt-4">
          <Switch
            id="form-published"
            checked={published}
            onChange={onPublishedChange}
            label="Terbitkan konten"
            description="Tampilkan konten ini di aplikasi mobile setelah disimpan."
          />
        </div>

        <div className="mt-5 space-y-2 border-t border-cream-200 pt-4">
          <button
            type="submit"
            className={`${primaryButtonClass} w-full`}
            disabled={saving}
          >
            <Save size={15} aria-hidden="true" />
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <Link to={cancelTo} className={`${secondaryButtonClass} w-full`}>
            Batal
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-5">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-800">
          <Info size={14} aria-hidden="true" />
          Tips
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-brand-900/70">{tip}</p>
      </div>

      {/* Sticky save bar on small screens, where the sidebar card is far below. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-cream-200 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link to={cancelTo} className={`${secondaryButtonClass} flex-1`}>
          Batal
        </Link>
        <button
          type="submit"
          className={`${primaryButtonClass} flex-1`}
          disabled={saving}
        >
          <Save size={15} aria-hidden="true" />
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </aside>
  )
}
