import type { Bindings } from '../bindings'

type StringBindingKey = {
  [Key in keyof Bindings]-?: Exclude<Bindings[Key], undefined> extends string
    ? Key
    : never
}[keyof Bindings]

export function requiredValue(
  bindings: Bindings,
  key: StringBindingKey,
): string {
  const value = bindings[key]

  if (typeof value !== 'string') {
    throw new Error(`${key} is missing`)
  }

  const trimmed = value.trim()

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
