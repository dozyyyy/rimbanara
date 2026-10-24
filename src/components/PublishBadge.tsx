/** Status badge used in the content tables. */
export default function PublishBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${
        published
          ? 'bg-brand-50 text-brand-700 ring-brand-200'
          : 'bg-cream-100 text-stone-600 ring-cream-300'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          published ? 'bg-brand-600' : 'bg-stone-400'
        }`}
        aria-hidden="true"
      />
      {published ? 'Terbit' : 'Draft'}
    </span>
  )
}
