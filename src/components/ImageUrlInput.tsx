import { useState } from 'react'
import { ExternalLink, ImageOff, Link2, Sparkles } from 'lucide-react'

import { convertDriveUrl, isHttpsUrl } from '../lib/driveUrl.ts'
import { inputClass, secondaryButtonClass } from './uiClasses.ts'

interface ImageUrlInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  invalid?: boolean
}

interface Note {
  value: string
  text: string
}

/**
 * Image URL field for the content forms (PRD §5.4): https-only, converts a
 * Google Drive share link to a direct URL, and previews the image with a
 * fallback when it cannot be loaded.
 */
export default function ImageUrlInput({
  id,
  value,
  onChange,
  invalid = false,
}: ImageUrlInputProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const [note, setNote] = useState<Note | null>(null)

  const trimmed = value.trim()
  const failed = failedSrc === trimmed
  const activeNote = note?.value === trimmed ? note.text : null
  const convertible = convertDriveUrl(trimmed) !== trimmed
  const looksInvalid = trimmed.length > 0 && !isHttpsUrl(trimmed)

  function handleConvert() {
    if (!convertible) {
      setNote({ value: trimmed, text: 'Link ini bukan format share Google Drive.' })
      return
    }
    const converted = convertDriveUrl(trimmed)
    onChange(converted)
    setNote({
      value: converted,
      text: 'Link Drive dikonversi ke URL gambar langsung.',
    })
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Link2
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-stone-400"
          />
          <input
            id={id}
            type="url"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://..."
            className={`${inputClass} pl-9 ${
              invalid || looksInvalid ? 'border-red-400 focus:ring-red-500/10' : ''
            }`}
          />
        </div>
        <button
          type="button"
          onClick={handleConvert}
          className={`${secondaryButtonClass} shrink-0`}
          title="Konversi link Google Drive"
        >
          <Sparkles size={14} aria-hidden="true" />
          Konversi link Drive
        </button>
      </div>

      {looksInvalid ? (
        <p className="mt-1.5 text-xs font-medium text-red-700">
          URL harus diawali https://
        </p>
      ) : null}

      {activeNote ? (
        <p className="mt-1.5 text-xs text-stone-500">{activeNote}</p>
      ) : null}

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="relative w-full max-w-56 overflow-hidden rounded-xl border border-cream-200 bg-cream-50">
          {trimmed && isHttpsUrl(trimmed) && !failed ? (
            <img
              src={trimmed}
              alt="Pratinjau gambar"
              onError={() => setFailedSrc(trimmed)}
              className="aspect-[4/3] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1.5 text-xs text-stone-400">
              <ImageOff size={20} aria-hidden="true" />
              {failed ? 'Gambar gagal dimuat' : 'Pratinjau gambar'}
            </div>
          )}
        </div>

        <div className="space-y-1.5 text-xs leading-relaxed text-stone-500">
          <p>
            Tempel tautan https yang dapat diakses publik. Untuk Google Drive,
            gunakan tombol konversi di atas.
          </p>
          {trimmed && isHttpsUrl(trimmed) && !failed ? (
            <a
              href={trimmed}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-900"
            >
              <ExternalLink size={12} aria-hidden="true" />
              Buka gambar di tab baru
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}
