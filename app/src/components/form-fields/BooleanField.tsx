import { Checkbox } from 'react-aria-components'
import { useFieldContext } from '@/components/forms/form-context'
import { cn } from '@/lib/utils'
import { useFieldRowClass } from './FieldNesting'

export function BooleanField({ label }: { label: React.ReactNode }) {
  const field = useFieldContext<boolean | null | undefined>()
  const rowClass = useFieldRowClass()

  return (
    <Checkbox
      isSelected={field.state.value === true}
      onChange={field.handleChange}
      className={cn(
        'flex items-center gap-2 rounded-md text-sm outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring',
        rowClass,
      )}
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
