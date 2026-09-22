import type { HTMLInputTypeAttribute } from 'react'
import { useFieldContext } from '@/components/forms/form-context'
import { FieldRow } from './FieldRow'
import { Input } from '@/components/ui/input'
import { FieldError } from './FieldError'
import { firstError } from './validation'

interface Props {
  label: React.ReactNode
  type?: HTMLInputTypeAttribute
  placeholder?: string
  required?: boolean
  min?: number
  step?: number | 'any'
  readOnly?: boolean
  className?: string
}

export function TextField({
  label,
  type = 'text',
  placeholder,
  required = false,
  min,
  step,
  readOnly,
  className,
}: Props) {
  const field = useFieldContext<string | number | null | undefined>()
  const error = firstError(field.state.meta.errors)

  return (
    <FieldRow label={label} required={required}>
      {(labelId) => (
        <>
          <Input
            type={type}
            dir={type === 'url' || type === 'email' ? 'ltr' : undefined}
            value={field.state.value == null ? '' : String(field.state.value)}
            onBlur={field.handleBlur}
            onChange={(event) => {
              const value = event.target.value
              field.handleChange(
                type === 'number' && value !== '' ? Number(value) : value,
              )
            }}
            placeholder={placeholder}
            required={required}
            min={min}
            step={step}
            readOnly={readOnly}
            aria-labelledby={labelId}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${labelId}-error` : undefined}
            className={className}
          />
          <FieldError id={`${labelId}-error`} error={error} />
        </>
      )}
    </FieldRow>
  )
}
