import { DatePicker } from '@/components/ui/date-picker'
import { useFieldContext } from '@/components/forms/form-context'
import { FieldError } from './FieldError'
import { FieldRow } from './FieldRow'
import { firstError } from './validation'

export function DatePickerField({ label }: { label: React.ReactNode }) {
  const field = useFieldContext<string | null | undefined>()
  const error = firstError(field.state.meta.errors)

  return (
    <FieldRow label={label}>
      {(labelId) => (
        <>
          <DatePicker
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            aria-labelledby={labelId}
            aria-invalid={Boolean(error)}
          />
          <FieldError error={error} />
        </>
      )}
    </FieldRow>
  )
}
