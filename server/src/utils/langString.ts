import type { z } from 'zod'

export type LangString = { language: string; value: string }

export function isLangString(value: unknown): value is LangString {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }
  return (
    'language' in value &&
    typeof value.language === 'string' &&
    'value' in value &&
    typeof value.value === 'string'
  )
}

function walk(value: unknown, path: PropertyKey[], ctx: z.RefinementCtx): void {
  if (Array.isArray(value)) {
    if (value.length > 1 && value.every(isLangString)) {
      const seen = new Set<string>()
      value.forEach((item, index) => {
        if (seen.has(item.language)) {
          ctx.addIssue({
            code: 'custom',
            path: [...path, index, 'language'],
            message: `Language "${item.language}" appears more than once; at most one value per language is allowed`,
          })
        }
        seen.add(item.language)
      })
      return
    }
    value.forEach((item, index) => walk(item, [...path, index], ctx))
    return
  }
  if (typeof value === 'object' && value !== null) {
    for (const [key, child] of Object.entries(value)) {
      walk(child, [...path, key], ctx)
    }
  }
}

export function refineUniqueLangStringLanguages(
  data: unknown,
  ctx: z.RefinementCtx,
): void {
  walk(data, [], ctx)
}

export function preferredLangStringValue(
  values: LangString[],
  language: string,
): string | undefined {
  const preferred =
    values.find((item) => item.language.toLowerCase() === language) ??
    values.find((item) =>
      item.language.toLowerCase().startsWith(`${language}-`),
    ) ??
    values[0]

  return preferred?.value.trim() || undefined
}
