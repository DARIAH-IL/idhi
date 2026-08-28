export function isEntityReference(value: unknown): value is string {
  return typeof value === 'string' && /^idhi:[^:]+:.+$/.test(value)
}

export function collectEntityReferenceIds(values: unknown[]): string[] {
  const entityIds = new Set<string>()

  function collect(value: unknown): void {
    if (isEntityReference(value)) {
      entityIds.add(value)
      return
    }

    if (Array.isArray(value)) {
      value.forEach(collect)
      return
    }

    if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach(collect)
    }
  }

  values.forEach(collect)

  return [...entityIds].sort()
}
