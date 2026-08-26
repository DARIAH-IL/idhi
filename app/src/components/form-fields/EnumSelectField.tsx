import { useFieldContext } from '@/components/forms/form-context'
import { getEnumValueLabel } from '@/lib/entity'
import { FieldRow } from './FieldRow'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldError } from './FieldError'
import { firstError } from './validation'

interface Props {
  label: React.ReactNode
  options: Record<string, string>
  required?: boolean
}

export function EnumSelectField({ label, options, required = false }: Props) {
  const field = useFieldContext<string | null | undefined>()
  const error = firstError(field.state.meta.errors)

  return (
    <FieldRow label={label}>
      {(labelId) => (
        <>
          <Select
            aria-labelledby={labelId}
            selectedKey={field.state.value ?? null}
            onSelectionChange={(key) => field.handleChange(String(key))}
            isInvalid={Boolean(error)}
            isRequired={required}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(options).map((key) => (
                <SelectItem
                  key={key}
                  id={key}
                  textValue={getEnumValueLabel(field.name, key)}
                >
                  {getEnumValueLabel(field.name, key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError error={error} />
        </>
      )}
    </FieldRow>
  )
}
