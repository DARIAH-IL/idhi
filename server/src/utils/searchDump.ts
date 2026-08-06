function appendSearchValues(value: unknown, values: string[]): void {
  if (value === null || value === undefined) {
    return
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      appendSearchValues(item, values)
    }
    return
  }

  if (typeof value === 'object') {
    for (const nestedValue of Object.values(value)) {
      appendSearchValues(nestedValue, values)
    }
    return
  }

  values.push(String(value))
}

export function searchDump(value: unknown): string {
  const values: string[] = []
  appendSearchValues(value, values)
  return values.join(' ')
}
