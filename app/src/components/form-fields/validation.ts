import type { EntityType } from '@/lib/entity'
import { getEntityIdSegment } from '@/lib/entity'

export type ValidationKind =
  | 'date'
  | 'doi'
  | 'email'
  | 'entityId'
  | 'integer'
  | 'number'
  | 'orcid'
  | 'ror'
  | 'url'

export interface ValidationOptions {
  required?: boolean
  kind?: ValidationKind
  entityTypes?: EntityType[]
  min?: number
}

export function isEmpty(value: unknown) {
  return value === '' || value === null || value === undefined
}

export function validateValue(value: unknown, options: ValidationOptions = {}) {
  if (isEmpty(value))
    return options.required ? 'This field is required.' : undefined

  const text = String(value)
  switch (options.kind) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)
        ? undefined
        : 'Enter a valid email address.'
    case 'url':
      try {
        new URL(text)
        return undefined
      } catch {
        return 'Enter a valid URL.'
      }
    case 'date':
      return /^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(Date.parse(text))
        ? undefined
        : 'Enter a valid date.'
    case 'doi':
      return /^https:\/\/doi\.org\/.+/.test(text)
        ? undefined
        : 'Enter a full DOI URL.'
    case 'integer':
      if (!Number.isInteger(Number(value))) return 'Enter a whole number.'
      break
    case 'number':
      if (!Number.isFinite(Number(value))) return 'Enter a number.'
      break
    case 'entityId': {
      const segments =
        options.entityTypes?.map(getEntityIdSegment).join('|') ?? '[a-z_]+'
      return new RegExp(`^idhi:(${segments}):[0-9a-z]{4,12}$`).test(text)
        ? undefined
        : 'Select a valid entity.'
    }
    case 'orcid':
      return /^https:\/\/orcid\.org\/\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/.test(text)
        ? undefined
        : 'Enter a full ORCID URL.'
    case 'ror':
      return /^https:\/\/ror\.org\/0[a-hj-km-np-tv-z0-9]{6}[0-9]{2}$/.test(text)
        ? undefined
        : 'Enter a valid ROR URL.'
  }

  if (options.min !== undefined && Number(value) < options.min) {
    return `Must be at least ${options.min}.`
  }
  return undefined
}

export function firstError(errors: unknown[]) {
  const error = errors[0]
  return typeof error === 'string' ? error : undefined
}
