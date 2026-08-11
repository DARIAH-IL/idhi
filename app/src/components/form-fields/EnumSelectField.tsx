import { useFormContext } from '@/components/forms/form-context'
import { FieldRow } from './FieldRow'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldError } from './FieldError'
import { firstError, validateValue } from './validation'

export function EnumSelectField({
  name,
  label,
  options,
  required = false,
}: {
  name: string
  label: string
  options: Record<string, string>
  required?: boolean
}) {
  const form = useFormContext()
  return (
    <FieldRow label={label}>
      <form.Field
        name={name as never}
        validators={{
          onSubmit: ({ value }) => {
            const rawValue = value as unknown
            const requiredError = validateValue(rawValue, { required })
            if (requiredError) return requiredError
            return rawValue && !Object.hasOwn(options, String(rawValue))
              ? 'Choose a supported value.'
              : undefined
          },
        }}
      >
        {(field) => {
          const rawValue = field.state.value as unknown
          const error = firstError(field.state.meta.errors)
          return (
            <>
              <Select
                placeholder="Select…"
                selectedKey={typeof rawValue === 'string' ? rawValue : null}
                onSelectionChange={(k) => field.handleChange(k as never)}
                isInvalid={Boolean(error)}
                isRequired={required}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(options).map(([key]) => (
                    <SelectItem key={key} id={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError error={error} />
            </>
          )
        }}
      </form.Field>
    </FieldRow>
  )
}
