import { Link } from 'react-router-dom'

interface BrandProps {
  /** Where the brand links to; omit for a static brand. */
  to?: string
  /** `dark` for the forest-green sidebar, `light` for cream surfaces. */
  tone?: 'dark' | 'light'
  compact?: boolean
}

/**
 * RIMBANARA brand lockup. The mark is the project logo (`public/logo-mark.png`),
 * shown on a white tile so it stays crisp on the dark sidebar.
 */
export default function Brand({ to, tone = 'light', compact = false }: BrandProps) {
  const content = (
    <>
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ${
          compact ? 'h-9 w-9' : 'h-11 w-11'
        } ${tone === 'dark' ? 'ring-white/20' : 'ring-cream-200'}`}
      >
        <img
          src="/logo-mark.png"
          alt=""
          width={44}
          height={44}
          className="h-full w-full scale-110 object-cover"
        />
      </span>
      <span className="min-w-0">
        <span
          className={`block text-sm font-semibold tracking-[0.18em] ${
            tone === 'dark' ? 'text-white' : 'text-brand-900'
          }`}
        >
          RIMBANARA
        </span>
        <span
          className={`block text-[11px] tracking-wide ${
            tone === 'dark' ? 'text-brand-200' : 'text-stone-500'
          }`}
        >
          Panel Admin Konten
        </span>
      </span>
    </>
  )

  if (!to) {
    return <div className="flex items-center gap-3">{content}</div>
  }

  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl focus:outline-none"
      aria-label="RIMBANARA — kembali ke dashboard"
    >
      {content}
    </Link>
  )
}
