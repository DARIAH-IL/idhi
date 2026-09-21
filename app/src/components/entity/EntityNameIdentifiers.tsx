import type { Entity } from '@/api/models'
import { ExternalLink } from '@/components/ExternalLink'
import { cn } from '@/lib/utils'

export function EntityNameIdentifiers({
  entity,
  children,
  className,
}: {
  entity: Entity
  children: React.ReactNode
  className?: string
}) {
  const orcid = 'orcid' in entity ? entity.orcid : undefined
  const ror = 'ror' in entity ? entity.ror : undefined
  const doi = 'doi' in entity ? entity.doi : undefined

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {orcid && <ExternalLink href={orcid} preferFaviconOnly />}
      {ror && <ExternalLink href={ror} preferFaviconOnly />}
      {children}
      {doi && <ExternalLink href={doi} />}
    </div>
  )
}
