import { Checkbox } from 'react-aria-components'
import { useFormContext } from '@/components/forms/form-context'

export function BooleanField({ name, label }: { name: string; label: string }) {
  const form = useFormContext()
  return (
    <form.Field name={name as never}>
      {(field) => (
        <Checkbox
          isSelected={field.state.value === true}
          onChange={(selected) => field.handleChange(selected as never)}
          className="flex items-center gap-2 text-sm"
        >
          {({ isSelected }) => (
            <>
              <span className="flex size-4 items-center justify-center rounded border">
                {isSelected ? '✓' : ''}
              </span>
              {label}
            </>
          )}
        </Checkbox>
      )}
    </form.Field>
  )
}
