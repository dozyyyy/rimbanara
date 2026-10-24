import { useEffect, useRef } from 'react'
import { AlertTriangle, LogOut } from 'lucide-react'

import {
  dangerButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from './uiClasses.ts'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  busy?: boolean
  /** `danger` (delete) or `neutral` (sign out). */
  tone?: 'danger' | 'neutral'
  onConfirm: () => void
  onCancel: () => void
}

/** Confirmation modal used before deleting a document or signing out. */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  busy = false,
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    panelRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, busy, onCancel])

  if (!open) return null

  const Icon = tone === 'danger' ? AlertTriangle : LogOut

  return (
    <div
      className="animate-fade fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/45 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? 'confirm-dialog-description' : undefined}
        tabIndex={-1}
        className="animate-rise w-full max-w-sm rounded-2xl border border-cream-200 bg-white p-6 shadow-float outline-none"
      >
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            tone === 'danger'
              ? 'bg-red-50 text-red-600'
              : 'bg-brand-50 text-brand-700'
          }`}
        >
          <Icon size={20} aria-hidden="true" />
        </span>
        <h2
          id="confirm-dialog-title"
          className="mt-4 text-base font-semibold text-stone-900"
        >
          {title}
        </h2>
        {description ? (
          <p
            id="confirm-dialog-description"
            className="mt-1.5 text-sm leading-relaxed text-stone-600"
          >
            {description}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={
              tone === 'danger' ? dangerButtonClass : primaryButtonClass
            }
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
