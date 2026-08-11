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
            value={
              typeof field.state.value === 'string' ? field.state.value : ''
            }
            onChange={(event) =>
              field.handleChange(event.target.value as never)
            }
            placeholder={placeholder}
          />
        )}
      </form.Field>
    </FieldRow>
  )
}
