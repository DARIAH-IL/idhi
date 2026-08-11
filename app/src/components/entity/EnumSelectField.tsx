import { useFormContext } from './form-type'
import { FieldRow } from './FieldRow'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function EnumSelectField({
  name,
  label,
  options,
}: {
  name: string
  label: string
  options: Record<string, string>
}) {
  const form = useFormContext()
  return (
    <FieldRow label={label}>
      <form.Field name={name as never}>
        {(field) => (
          <Select
            placeholder="Select…"
            selectedKey={
              typeof field.state.value === 'string' ? field.state.value : null
            }
            onSelectionChange={(k) => field.handleChange(k as never)}
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
        )}
      </form.Field>
    </FieldRow>
  )
}
