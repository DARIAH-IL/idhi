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

interface ValueContext {
  value: unknown
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

export function valueValidators(options: ValidationOptions = {}) {
  const validate = ({ value }: ValueContext) => validateValue(value, options)
  return { onBlur: validate, onSubmit: validate }
}

export function enumValidators(
  options: Record<string, string>,
  required = false,
) {
  return {
    onSubmit: ({ value }: ValueContext) => {
      const requiredError = validateValue(value, { required })
      if (requiredError) return requiredError
      return value && !Object.hasOwn(options, String(value))
        ? 'Choose a supported value.'
        : undefined
    },
  }
}

export function stringArrayValidators(
  options: Pick<ValidationOptions, 'kind'> & {
    allowedValues?: Record<string, string>
  } = {},
) {
  return {
    onSubmit: ({ value }: ValueContext) => {
      if (value == null) return undefined
      if (!Array.isArray(value)) return 'Enter a valid list.'

      for (const item of value) {
        const formatError = validateValue(item, {
          required: true,
          kind: options.kind,
        })
        if (formatError) return formatError
        if (
          options.allowedValues &&
          !Object.hasOwn(options.allowedValues, String(item))
        ) {
          return 'Choose a supported value.'
        }
      }
      return undefined
    },
  }
}

export function localizedValueValidators(required = false) {
  return {
    onSubmit: ({ value }: ValueContext) => {
      if (value == null) return required ? 'Add at least one value.' : undefined
      if (!Array.isArray(value)) return 'Enter a valid multilingual value.'
      if (required && value.length === 0) return 'Add at least one value.'

      const languages: unknown[] = []
      for (const item of value) {
        if (
          typeof item !== 'object' ||
          item === null ||
          !('language' in item) ||
          !('value' in item)
        ) {
          return 'Enter a valid multilingual value.'
        }
        if (typeof item.language !== 'string' || !item.language) {
          return 'Choose a language.'
        }
        if (validateValue(item.value, { required: true })) {
          return 'Every language value must have text.'
        }
        languages.push(item.language)
      }

      return new Set(languages).size === languages.length
        ? undefined
        : 'Use each language only once.'
    },
  }
}

export function entityRefValidators(
  entityTypes: EntityType[],
  options: { required?: boolean; allowExternalUrl?: boolean } = {},
) {
  return {
    onSubmit: ({ value }: ValueContext) =>
      options.allowExternalUrl &&
      typeof value === 'string' &&
      value.startsWith('http')
        ? validateValue(value, { required: options.required, kind: 'url' })
        : validateValue(value, {
            required: options.required,
            kind: 'entityId',
            entityTypes,
          }),
  }
}

export function entityRefArrayValidators(entityTypes: EntityType[]) {
  return {
    onSubmit: ({ value }: ValueContext) => {
      if (value == null) return undefined
      if (!Array.isArray(value)) return 'Choose valid entities.'
      if (new Set(value).size !== value.length) {
        return 'Choose each entity only once.'
      }
      return value.some((id) =>
        validateValue(id, {
          required: true,
          kind: 'entityId',
          entityTypes,
        }),
      )
        ? 'One or more selected entities are invalid.'
        : undefined
    },
  }
}
