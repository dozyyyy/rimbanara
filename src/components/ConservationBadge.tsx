import type { ConservationStatus } from '../types/enums.ts'

const META: Record<
  ConservationStatus,
  { name: string; className: string }
> = {
  LC: {
    name: 'Least Concern — risiko rendah',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  NT: {
    name: 'Near Threatened — hampir terancam',
    className: 'bg-lime-50 text-lime-700 ring-lime-200',
  },
  VU: {
    name: 'Vulnerable — rentan',
    className: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
  EN: {
    name: 'Endangered — terancam punah',
    className: 'bg-orange-50 text-orange-800 ring-orange-200',
  },
  CR: {
    name: 'Critically Endangered — kritis',
    className: 'bg-red-50 text-red-700 ring-red-200',
  },
  EW: {
    name: 'Extinct in the Wild — punah di alam liar',
    className: 'bg-purple-50 text-purple-700 ring-purple-200',
  },
  EX: {
    name: 'Extinct — punah',
    className: 'bg-stone-100 text-stone-700 ring-stone-200',
  },
  DD: {
    name: 'Data Deficient — data kurang',
    className: 'bg-stone-100 text-stone-500 ring-stone-200',
  },
}

/** IUCN status chip; the full category name is exposed via `title`. */
export default function ConservationBadge({
  status,
}: {
  status: ConservationStatus
}) {
  const meta = META[status] ?? META.DD
  return (
    <span
      title={meta.name}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${meta.className}`}
    >
      {status}
      <span className="sr-only">— {meta.name}</span>
    </span>
  )
}
