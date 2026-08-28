import { EntityReferenceCard } from '#/components/entity/EntityReferenceCard.tsx'
import { EntityFieldLabel } from '#/components/entity/EntityFieldLabel.tsx'
import { getFieldRefClass, getFieldTermUri } from '#/api/termUris/termUri.ts'
import { getEntityClassFieldOrder, getEnumValueLabel } from '#/lib/entity.ts'
import {
  LangStringValue,
  langStringsOf,
} from '#/components/LangStringValue.tsx'
import { ExternalLink } from '#/components/ExternalLink.tsx'
import { TimeAgoReverse } from '#/components/TimeAgo.tsx'
import { isEntityReference } from '#/lib/entityReferences.ts'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip'

const URL_FIELDS = new Set(['orcid', 'ror'])
const URL_TERMS = new Set([
  'schema:sameAs',
  'foaf:homepage',
  'schema:url',
  'schema:softwareHelp',
  'schema:codeRepository',
  'bibo:doi',
])
const ADDRESS_TERM = 'schema:address'
const EMAIL_TERMS = new Set(['schema:email', 'foaf:mbox'])
const PILL_FIELDS = new Set([
  'publication_type',
  'digital_humanities_activities',
])

function EnumPill({ field, value }: { field: string; value: string }) {
  return (
    <TooltipTrigger>
      <Badge variant="secondary" className="border-accent-foreground/25">
        {getEnumValueLabel(field, value)}
      </Badge>
      <Tooltip>{value}</Tooltip>
    </TooltipTrigger>
  )
}

function mapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
}

export function isEntityRefValue(v: unknown): boolean {
  return (
    isEntityReference(v) ||
    (Array.isArray(v) && v.length > 0 && v.every(isEntityReference))
  )
}

export function renderEntityValue(
  v: unknown,
  entityClass?: string,
  field?: string,
  term?: string,
): React.ReactNode {
  if (v === null || v === undefined || v === '') {
    return null
  }
  if (typeof v === 'number') {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: Number.isInteger(v) ? 0 : 2,
    }).format(v)
  }
  if (
    (field === 'start_date' || field === 'end_date') &&
    typeof v === 'string'
  ) {
    return <TimeAgoReverse date={v} />
  }
  if (entityClass === 'LangString') {
    const items = langStringsOf(v)
    if (items.length > 0) {
      return <LangStringValue items={items} />
    }
  }
  if (field && PILL_FIELDS.has(field)) {
    const items = Array.isArray(v) ? v : [v]
    const strings = items.filter(
      (item): item is string => typeof item === 'string',
    )
    if (strings.length > 0) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {strings.map((item, i) => (
            <EnumPill key={i} field={field} value={item} />
          ))}
        </div>
      )
    }
  }
  if (Array.isArray(v)) {
    if (v.length === 0) {
      return null
    }
    return (
      <div className="flex flex-col gap-3">
        {v.map((item, i) => (
          <div key={i}>{renderEntityValue(item, entityClass, field, term)}</div>
        ))}
      </div>
    )
  }
  if (typeof v === 'object') {
    const fieldOrder = entityClass
      ? getEntityClassFieldOrder(entityClass)
      : undefined
    const orderOf = (key: string) =>
      fieldOrder?.[key] ?? Number.MAX_SAFE_INTEGER

    return (
      <div className="flex flex-col gap-4 rounded border p-2 text-xs">
        {Object.entries(v)
          .filter(([, val]) => val !== null && val !== undefined)
          .sort(([a], [b]) => orderOf(a) - orderOf(b))
          .map(([key, val]) => {
            const refValue = isEntityRefValue(val)
            return (
              <div
                key={key}
                className={
                  refValue
                    ? 'flex flex-col gap-1 p-1 rounded hover:bg-foreground/5'
                    : 'grid grid-cols-[6rem_1fr] gap-2 p-1 rounded hover:bg-foreground/5'
                }
              >
                <span className="font-medium text-muted-foreground">
                  {entityClass ? (
                    <EntityFieldLabel entityClass={entityClass} field={key} />
                  ) : (
                    key
                  )}
                </span>
                <span className={refValue ? 'ms-4 m-2 ' : 'min-w-0'}>
                  {renderEntityValue(
                    val,
                    entityClass
                      ? getFieldRefClass(entityClass, key)
                      : undefined,
                    key,
                    entityClass ? getFieldTermUri(entityClass, key) : undefined,
                  )}
                </span>
              </div>
            )
          })}
      </div>
    )
  }
  if (isEntityReference(v)) {
    return <EntityReferenceCard entityId={v} />
  }
  if (
    typeof v === 'string' &&
    ((term && URL_TERMS.has(term)) || (field && URL_FIELDS.has(field)))
  ) {
    return <ExternalLink href={v} />
  }
  if (typeof v === 'string' && term === ADDRESS_TERM) {
    return <ExternalLink href={mapsUrl(v)} refText={v} />
  }
  if (typeof v === 'string' && term && EMAIL_TERMS.has(term)) {
    return (
      <a href={`mailto:${v}`} className="app-link break-all">
        {v}
      </a>
    )
  }
  if (typeof v === 'string') {
    return field ? getEnumValueLabel(field, v) : v
  }
  return String(v)
}
