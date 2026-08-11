import { useFormContext } from './form-type'
import { FieldRow } from './FieldRow'
import { Input } from '@/components/ui/input'

export function TextField({
  name,
  label,
  type = 'text',
  placeholder,
}: {
  name: string
  label: string
  type?: string
  placeholder?: string
}) {
  const form = useFormContext()
  return (
    <FieldRow label={label}>
      <form.Field name={name as never}>
        {(field) => (
          <Input
            type={type}
            value={(field.state.value) ?? ''}
            onChange={(v) => field.handleChange(v as never)}
            placeholder={placeholder}
          />
        )}
      </form.Field>
    </FieldRow>
  )
}
