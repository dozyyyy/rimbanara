import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  /** Shows a back link to the parent list above the title. */
  backTo?: string
  backLabel?: string
  actions?: ReactNode
}

/** Consistent page heading used by every admin screen. */
export default function PageHeader({
  title,
  description,
  eyebrow,
  backTo,
  backLabel,
  actions,
}: PageHeaderProps) {
  return (
    <div className="animate-rise flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {backTo ? (
          <Link
            to={backTo}
            className="mb-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-medium text-stone-500 transition hover:text-brand-800"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            {backLabel ?? 'Kembali'}
          </Link>
        ) : null}
        {eyebrow ? (
          <p className="text-[11px] font-semibold tracking-[0.16em] text-brand-600 uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900 sm:text-[1.7rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-stone-600">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
