import { useId } from 'react'
import { Label } from '@/components/ui/label'
import { useFieldRowClass } from './FieldNesting'
import { cn } from '@/lib/utils'

export function FieldRow({
  label,
  required = false,
  children,
}: {
  label: React.ReactNode
  required?: boolean
  children: React.ReactNode | ((labelId: string) => React.ReactNode)
}) {
  const labelId = useId()
  const rowClass = useFieldRowClass()
  return (
    <div className={cn('flex flex-col gap-1', rowClass)}>
      <Label id={labelId}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        )}
      </Label>
      {typeof children === 'function' ? children(labelId) : children}
    </div>
  )
}
