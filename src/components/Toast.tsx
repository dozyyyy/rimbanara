import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

import { ToastContext } from './toast-context.ts'
import type { ToastKind } from './toast-context.ts'

interface ToastItem {
  id: number
  message: string
  kind: ToastKind
}

const TOAST_DURATION_MS = 4500

/** Lightweight success/error notifications, no extra dependency. */
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setItems((previous) => previous.filter((item) => item.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, kind: ToastKind = 'success') => {
      const id = nextId.current
      nextId.current += 1
      setItems((previous) => [...previous, { id, message, kind }])
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 bottom-4 left-4 z-[70] flex flex-col items-end gap-2 sm:left-auto sm:w-96"
        aria-live="polite"
      >
        {items.map((item) => {
          const isError = item.kind === 'error'
          const Icon = isError ? AlertCircle : CheckCircle2
          return (
            <div
              key={item.id}
              role={isError ? 'alert' : 'status'}
              className="animate-toast pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-cream-200 bg-white px-4 py-3 shadow-float"
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  isError
                    ? 'bg-red-50 text-red-600'
                    : 'bg-brand-50 text-brand-700'
                }`}
              >
                <Icon size={15} aria-hidden="true" />
              </span>
              <p className="flex-1 text-sm leading-relaxed text-stone-700">
                {item.message}
              </p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Tutup notifikasi"
                className="-mt-1 -mr-1 rounded-md p-1 text-stone-400 transition hover:bg-cream-100 hover:text-stone-700"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
