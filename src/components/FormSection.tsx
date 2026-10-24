import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { cardClass } from './uiClasses.ts'

interface FormSectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: ReactNode
}

/** Grouped card section used by all four content forms. */
export default function FormSection({
  title,
  description,
  icon: Icon,
  children,
}: FormSectionProps) {
  return (
    <section className={`${cardClass} overflow-hidden`}>
      <div className="flex items-start gap-3 border-b border-cream-200 bg-cream-50/60 px-5 py-4 sm:px-6">
        {Icon ? (
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            <Icon size={16} aria-hidden="true" />
          </span>
        ) : null}
        <div>
          <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="space-y-5 px-5 py-5 sm:px-6">{children}</div>
    </section>
  )
}
