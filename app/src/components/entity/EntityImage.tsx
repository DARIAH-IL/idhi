import { useMemo, useState } from 'react'
import { EntityTypeIcon } from './EntityTypeIcon'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: { image: 'size-6 rounded-md', icon: 'sm' },
  md: { image: 'size-8 rounded-lg', icon: 'md' },
  lg: { image: 'size-15 rounded-xl', icon: 'lg' },
} as const

function inferImageMimeType(base64: string): string | undefined {
  try {
    const prefix = atob(base64.slice(0, 256))
    const trimmedPrefix = prefix.trimStart()

    if (prefix.startsWith('\x89PNG\r\n\x1a\n')) {
      return 'image/png'
    }
    if (prefix.startsWith('\xff\xd8\xff')) {
      return 'image/jpeg'
    }
    if (prefix.startsWith('GIF87a') || prefix.startsWith('GIF89a')) {
      return 'image/gif'
    }
    if (prefix.startsWith('RIFF') && prefix.slice(8, 12) === 'WEBP') {
      return 'image/webp'
    }
    if (prefix.startsWith('BM')) {
      return 'image/bmp'
    }
    if (prefix.startsWith('\x00\x00\x01\x00')) {
      return 'image/x-icon'
    }
    if (
      trimmedPrefix.startsWith('<svg') ||
      (trimmedPrefix.startsWith('<?xml') && trimmedPrefix.includes('<svg'))
    ) {
      return 'image/svg+xml'
    }
    if (prefix.slice(4, 12).includes('ftypavif')) {
      return 'image/avif'
    }
  } catch {
    return undefined
  }

  return undefined
}

function imageSource(image: string): string {
  if (image.startsWith('data:image/')) {
    return image
  }

  const base64 = image.replace(/\s/g, '')
  const mimeType = inferImageMimeType(base64) ?? 'application/octet-stream'
  return `data:${mimeType};base64,${base64}`
}

export function EntityImage({
  image,
  type,
  alt,
  size = 'md',
  className,
}: {
  image?: string | null
  type: string
  alt: string
  size?: keyof typeof SIZES
  className?: string
}) {
  const dimensions = SIZES[size]
  const source = useMemo(
    () => (image ? imageSource(image) : undefined),
    [image],
  )
  const [failedSource, setFailedSource] = useState<string | null>(null)

  if (!source || failedSource === source) {
    return (
      <EntityTypeIcon
        type={type}
        size={dimensions.icon}
        className={className}
      />
    )
  }

  return (
    <img
      src={source}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSource(source)}
      className={cn(
        'shrink-0 bg-muted object-contain border-accent-foreground/20 border-1',
        dimensions.image,
        className,
      )}
    />
  )
}
