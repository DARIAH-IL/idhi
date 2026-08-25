import { Checkbox } from 'react-aria-components'
import { useFieldContext } from '@/components/forms/form-context'

export function BooleanField({ label }: { label: React.ReactNode }) {
  const field = useFieldContext<boolean | null | undefined>()

  return (
    <Checkbox
      isSelected={field.state.value === true}
      onChange={field.handleChange}
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
  )
}
