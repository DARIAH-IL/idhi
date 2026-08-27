import type { Entity } from '@/api/models'
import { ExternalLink } from '@/components/ExternalLink'

export function EntityNameIdentifiers({
  entity,
  children,
}: {
  entity: Entity
  children: React.ReactNode
}) {
  const orcid = 'orcid' in entity ? entity.orcid : undefined
  const ror = 'ror' in entity ? entity.ror : undefined
  const doi = 'doi' in entity ? entity.doi : undefined

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {orcid && <ExternalLink href={orcid} preferFaviconOnly />}
      {ror && <ExternalLink href={ror} preferFaviconOnly />}
      {children}
      {doi && <ExternalLink href={doi} />}
    </div>
  )
}
