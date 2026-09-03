import { isEntityId } from './entityId'

export function collectEntityReferences(value: unknown): string[] {
  const references = new Set<string>()
  const visited = new Set<object>()

  function visit(current: unknown): void {
    if (isEntityId(current)) {
      references.add(current)
      return
    }

    if (current === null || typeof current !== 'object') {
      return
    }

    if (visited.has(current)) {
      return
    }
    visited.add(current)

    if (Array.isArray(current)) {
      for (const item of current) {
        visit(item)
      }
      return
    }

    for (const child of Object.values(current)) {
      visit(child)
    }
  }

  visit(value)
  return [...references]
}
