import { useFormContext } from './form-type'
import { FieldRow } from './FieldRow'
import { Input } from '@/components/ui/input'
import { FieldError } from './FieldError'
import { firstError, validateValue } from './validation'
import type { ValidationKind } from './validation'

export function TextField({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  validationKind,
  min,
}: {
  name: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  validationKind?: ValidationKind
  min?: number
}) {
  const form = useFormContext()
  return (
    <FieldRow label={label}>
      <form.Field
        name={name as never}
        validators={{
          onBlur: ({ value }) =>
            validateValue(value, {
              required,
              kind: validationKind ?? (type as ValidationKind),
              min,
            }),
          onSubmit: ({ value }) =>
            validateValue(value, {
              required,
              kind: validationKind ?? (type as ValidationKind),
              min,
            }),
        }}
      >
        {(field) => {
          const error = firstError(field.state.meta.errors)
          return (
            <>
              <Input
                type={type}
                value={
                  typeof field.state.value === 'string' ||
                  typeof field.state.value === 'number'
                    ? String(field.state.value)
                    : ''
                }
                onBlur={field.handleBlur}
                onChange={(event) => {
                  const raw = event.target.value
                  field.handleChange(
                    (type === 'number' && raw !== ''
                      ? Number(raw)
                      : raw) as never,
                  )
                }}
                placeholder={placeholder}
                required={required}
                min={min}
                aria-invalid={Boolean(error)}
              />
              <FieldError error={error} />
            </>
          )
        }}
      </form.Field>
    </FieldRow>
  )
}
