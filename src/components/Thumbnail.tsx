import { useState } from 'react'
import { Leaf } from 'lucide-react'

interface ThumbnailProps {
  src: string | undefined
  alt: string
}

/** Small table image; broken or empty URLs fall back to a leaf icon. */
export default function Thumbnail({ src, alt }: ThumbnailProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const failed = Boolean(src) && failedSrc === src

  if (!src || failed) {
    return (
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream-100 text-brand-400 ring-1 ring-cream-200 ring-inset">
        <Leaf size={17} aria-hidden="true" />
        <span className="sr-only">Tidak ada gambar</span>
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className="h-11 w-11 rounded-xl object-cover ring-1 ring-cream-200"
    />
  )
}
