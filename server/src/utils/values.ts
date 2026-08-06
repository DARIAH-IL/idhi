import type { Bindings } from '../bindings'

export function requiredValue(bindings: Bindings, key: keyof Bindings): string {
  const trimmed = bindings[key]?.trim()

  if (!trimmed) {
    throw new Error(`${key} is missing`)
  }

  if (trimmed.includes('\r') || trimmed.includes('\n')) {
    throw new Error(`${key} is invalid`)
  }

  return trimmed
}

export function splitValues(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
