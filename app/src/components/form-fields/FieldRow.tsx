import { useId } from 'react'
import { Label } from '@/components/ui/label'
import { useFieldRowClass } from './FieldNesting'
import { cn } from '@/lib/utils'

export function FieldRow({
  label,
  required = false,
  action,
  children,
}: {
  label: React.ReactNode
  required?: boolean
  action?: React.ReactNode
  children: React.ReactNode | ((labelId: string) => React.ReactNode)
}) {
  const labelId = useId()
  const rowClass = useFieldRowClass()
  const labelNode = (
    <Label id={labelId}>
      {label}
      {required && (
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
      )}
    </Label>
  )
  return (
    <div className={cn('flex flex-col gap-1', rowClass)}>
      {action ? (
        <div className="flex items-center justify-between gap-2">
          {labelNode}
          {action}
        </div>
      ) : (
        labelNode
      )}
      {typeof children === 'function' ? children(labelId) : children}
    </div>
  )
}
