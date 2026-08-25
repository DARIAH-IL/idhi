import type { Entity } from '#/api/models'
import type { FieldPaths } from '#/lib/fieldPaths.ts'
import { termUriRefs, termUris } from '#/api/termUris/termUris.ts'
import type { EntityType } from '#/lib/entity.ts'

type EntityOf<T extends EntityType> = Extract<Entity, { type: T }>

export type EntityTermField<T extends EntityType> = FieldPaths<EntityOf<T>>

const uris: Record<string, Record<string, string> | undefined> = termUris
const refs: Record<string, Record<string, string> | undefined> = termUriRefs

function defNameOf(type: EntityType): string {
  return type.slice('idhi:'.length)
}

export function getEntityTermUri(type: EntityType): string | undefined {
  return uris[defNameOf(type)]?.$self
}

export function getFieldRefClass(
  entityClass: string,
  field: string,
): string | undefined {
  return refs[entityClass]?.[field]
}

export function getFieldTermUri(
  entityClass: string,
  field: string,
): string | undefined {
  return uris[entityClass]?.[field]
}

export function getTermUri<T extends EntityType>(
  type: T,
  field: EntityTermField<T> & string,
): string | undefined {
  const segments = field.split('.')
  const last = segments[segments.length - 1] ?? field
  let def = defNameOf(type)
  for (const segment of segments.slice(0, -1)) {
    const next = refs[def]?.[segment]
    if (!next) {
      return undefined
    }
    def = next
  }
  return uris[def]?.[last]
}
