import type { ReactNode } from 'react'

/** Small neutral label used for type/region values in tables. */
export default function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-cream-100 px-2 py-0.5 text-[11px] font-medium text-stone-600 ring-1 ring-cream-200 ring-inset">
      {children}
    </span>
  )
}
