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
  readOnly?: boolean
  className?: string
}

export function TextField({
  label,
  type = 'text',
  placeholder,
  required = false,
  min,
  readOnly,
  className,
}: Props) {
  const field = useFieldContext<string | number | null | undefined>()
  const error = firstError(field.state.meta.errors)

  return (
    <FieldRow label={label}>
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
          readOnly={readOnly}
          aria-invalid={Boolean(error)}
          className={className}
        />
        <FieldError error={error} />
      </>
    </FieldRow>
  )
}
