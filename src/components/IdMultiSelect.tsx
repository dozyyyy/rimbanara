import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

export interface IdOption {
  id: string
  label: string
  hint?: string
}

interface IdMultiSelectProps {
  options: IdOption[]
  value: string[]
  onChange: (value: string[]) => void
  emptyMessage?: string
}

/** Multi-select used by `relatedForestIds` / `relatedWildlifeIds` (PRD §8.2). */
export default function IdMultiSelect({
  options,
  value,
  onChange,
  emptyMessage = 'Belum ada data untuk dipilih.',
}: IdMultiSelectProps) {
  const [search, setSearch] = useState('')
  const showSearch = options.length > 6

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return options
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.hint?.toLowerCase().includes(query),
    )
  }, [options, search])

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((entry) => entry !== id))
      return
    }
    onChange([...value, id])
  }

  if (options.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-cream-300 bg-cream-50 px-3.5 py-3 text-xs text-stone-500">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-cream-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-cream-200 bg-cream-50/60 px-3 py-2">
        <p className="text-xs text-stone-500">
          <span className="font-semibold text-stone-800">{value.length}</span>{' '}
          dipilih
        </p>
        {value.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="rounded-md text-xs font-medium text-stone-500 transition hover:text-red-700"
          >
            Bersihkan
          </button>
        ) : null}
      </div>

      {showSearch ? (
        <div className="relative border-b border-cream-200 p-2">
          <Search
            size={14}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-stone-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari data terkait..."
            aria-label="Cari data terkait"
            className="w-full rounded-lg bg-cream-50 py-1.5 pr-3 pl-8 text-xs text-stone-700 outline-none placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-brand-600/15"
          />
        </div>
      ) : null}

      <ul className="scroll-slim max-h-48 overflow-y-auto p-1.5">
        {filtered.length === 0 ? (
          <li className="px-2 py-3 text-xs text-stone-500">
            Tidak ada data yang cocok.
          </li>
        ) : (
          filtered.map((option) => {
            const checked = value.includes(option.id)
            return (
              <li key={option.id}>
                <label
                  className={`flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm transition ${
                    checked
                      ? 'bg-brand-50/70 text-brand-900'
                      : 'text-stone-700 hover:bg-cream-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(option.id)}
                    className="mt-0.5 h-4 w-4 rounded border-stone-300 accent-brand-600 focus:ring-brand-700"
                  />
                  <span className="min-w-0 flex-1">
                    {option.label}
                    {option.hint ? (
                      <span className="ml-1 text-[11px] text-stone-400">
                        ({option.hint})
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
