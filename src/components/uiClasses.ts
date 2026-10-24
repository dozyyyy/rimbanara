/** Shared Tailwind classes so every admin screen looks the same. */

export const inputClass =
  'w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 shadow-[0_1px_1px_rgba(16,36,15,0.03)] outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 disabled:cursor-not-allowed disabled:bg-cream-100 disabled:text-stone-500'

export const textareaClass = `${inputClass} min-h-28 resize-y leading-relaxed`

export const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 focus:ring-4 focus:ring-brand-700/20 focus:outline-none active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60'

export const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-[0_1px_1px_rgba(16,36,15,0.03)] transition hover:border-stone-300 hover:bg-cream-50 focus:ring-4 focus:ring-stone-400/15 focus:outline-none active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50'

export const ghostButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-cream-100 hover:text-stone-900 focus:ring-4 focus:ring-stone-400/15 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'

export const dangerButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800 focus:ring-4 focus:ring-red-700/20 focus:outline-none active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60'

export const iconButtonClass =
  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-cream-100 hover:text-stone-900 focus:ring-4 focus:ring-stone-400/15 focus:outline-none'

export const dangerIconButtonClass =
  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-red-50 hover:text-red-700 focus:ring-4 focus:ring-red-400/15 focus:outline-none'

export const cardClass =
  'rounded-2xl border border-cream-200 bg-white shadow-panel'

export const labelClass =
  'mb-1.5 flex items-center gap-1 text-sm font-medium text-stone-700'

export const errorTextClass = 'mt-1.5 text-xs font-medium text-red-700'

export const helperTextClass = 'mt-1.5 text-xs leading-relaxed text-stone-500'
