import { EntityReferenceCard } from '#/components/entity/EntityReferenceCard.tsx'
import { EntityFieldLabel } from '#/components/entity/EntityFieldLabel.tsx'
import { getFieldRefClass, getFieldTermUri } from '#/api/termUris/termUri.ts'
import { getEnumValueLabel } from '#/lib/entity.ts'
import {
  LangStringValue,
  langStringsOf,
} from '#/components/LangStringValue.tsx'
import { ExternalLink } from '#/components/ExternalLink.tsx'
import { TimeAgoReverse } from '#/components/TimeAgo.tsx'

const URL_TERMS = new Set([
  'schema:sameAs',
  'foaf:homepage',
  'schema:url',
  'bibo:doi',
])
const ADDRESS_TERM = 'schema:address'
const EMAIL_TERMS = new Set(['schema:email', 'foaf:mbox'])

function mapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
}

function isEntityRef(v: unknown): boolean {
  return typeof v === 'string' && /^idhi:[^:]+:.+$/.test(v)
}

export function isEntityRefValue(v: unknown): boolean {
  return (
    isEntityRef(v) || (Array.isArray(v) && v.length > 0 && v.every(isEntityRef))
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
  if (
    (field === 'start_date' || field === 'end_date') &&
    typeof v === 'string'
  ) {
    return <TimeAgoReverse date={v} />
  }
  if (entityClass === 'LangString') {
    const items = langStringsOf(v)
    if (items.length > 0) {
      return (
        <LangStringValue
          items={items}
          hrefOf={term === ADDRESS_TERM ? mapsUrl : undefined}
        />
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
    return (
      <div className="flex flex-col gap-4 rounded border p-2 text-xs">
        {Object.entries(v)
          .filter(([, val]) => val !== null && val !== undefined)
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
  if (typeof v === 'string' && /^idhi:[^:]+:.+$/.test(v)) {
    return <EntityReferenceCard entityId={v} />
  }
  if (typeof v === 'string' && term && URL_TERMS.has(term)) {
    return <ExternalLink href={v}>{v}</ExternalLink>
  }
  if (typeof v === 'string' && term === ADDRESS_TERM) {
    return <ExternalLink href={mapsUrl(v)}>{v}</ExternalLink>
  }
  if (typeof v === 'string' && term && EMAIL_TERMS.has(term)) {
    return (
      <a href={`mailto:${v}`} className="app-link break-all">
        {v}
      </a>
    )
  }
  if (typeof v === 'string') {
    return getEnumValueLabel(v)
  }
  return String(v)
}
