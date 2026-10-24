interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  id?: string
}

/**
 * Accessible publication switch (PRD §8.2). Uses a real button with
 * `role="switch"` so it works with keyboard and screen readers.
 */
export default function Switch({
  checked,
  onChange,
  label,
  description,
  id,
}: SwitchProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p id={id} className="text-sm font-medium text-stone-800">
          {label}
        </p>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-stone-500">
            {description}
          </p>
        ) : null}
        <span
          className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
            checked
              ? 'bg-brand-50 text-brand-700 ring-brand-200'
              : 'bg-cream-100 text-stone-600 ring-cream-300'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              checked ? 'bg-brand-600' : 'bg-stone-400'
            }`}
            aria-hidden="true"
          />
          {checked ? 'Terbit' : 'Draft'}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-brand-600' : 'bg-stone-300'
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}
