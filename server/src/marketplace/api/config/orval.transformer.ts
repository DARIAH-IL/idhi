type JsonObject = Record<string, unknown>

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isDateFormatPattern(value: unknown): boolean {
  return typeof value === 'string' && value.includes('yyyy')
}

export default function removeDateFormatPatterns<T extends JsonObject>(
  document: T,
): T {
  function visit(value: unknown): void {
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }
    if (!isObject(value)) {
      return
    }
    if (isDateFormatPattern(value.pattern)) {
      delete value.pattern
    }
    Object.values(value).forEach(visit)
  }

  visit(document)
  return document
}
