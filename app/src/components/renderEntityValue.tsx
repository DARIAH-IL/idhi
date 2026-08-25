import { EntityReferenceCard } from '#/components/entity/EntityReferenceCard.tsx'

export function renderEntityValue(v: unknown): React.ReactNode {
  if (v === null || v === undefined) {
    return <span className="text-muted-foreground">—</span>
  }
  if (Array.isArray(v)) {
    if (v.length === 0) {
      return <span className="text-muted-foreground">—</span>
    }
    return (
      <div className="flex flex-col gap-0.5">
        {v.map((item, i) => (
          <div key={i}>{renderEntityValue(item)}</div>
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
                {key}
              </span>
              <span className="min-w-0 flex-1">{renderEntityValue(val)}</span>
            </div>
          ))}
      </div>
    )
  }
  if (typeof v === 'string' && /^idhi:[^:]+:.+$/.test(v)) {
    return <EntityReferenceCard entityId={v} />
  }
  return String(v)
}
