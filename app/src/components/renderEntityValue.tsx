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

const URL_TERMS = new Set(['schema:sameAs', 'foaf:homepage'])
const ADDRESS_TERM = 'schema:address'
const EMAIL_TERMS = new Set(['schema:email', 'foaf:mbox'])

function mapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
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
      <div className="flex flex-col gap-0.5">
        {v.map((item, i) => (
          <div key={i}>{renderEntityValue(item, entityClass, field, term)}</div>
        ))}
      </div>
    )
  }
  if (typeof v === 'object') {
    return (
      <div className="flex flex-col gap-0.5 rounded border p-1.5 text-xs">
        {Object.entries(v)
          .filter(([, val]) => val !== null && val !== undefined)
          .map(([key, val]) => (
            <div key={key} className="flex gap-2">
              <span className="font-medium text-muted-foreground min-w-24">
                {entityClass ? (
                  <EntityFieldLabel entityClass={entityClass} field={key} />
                ) : (
                  key
                )}
              </span>
              <span className="min-w-0 flex-1">
                {renderEntityValue(
                  val,
                  entityClass ? getFieldRefClass(entityClass, key) : undefined,
                  key,
                  entityClass ? getFieldTermUri(entityClass, key) : undefined,
                )}
              </span>
            </div>
          ))}
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
