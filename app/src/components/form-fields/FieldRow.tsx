import { useId } from 'react'
import { Label } from '@/components/ui/label'

export function FieldRow({
  label,
  children,
}: {
  label: React.ReactNode
  children: React.ReactNode | ((labelId: string) => React.ReactNode)
}) {
  const labelId = useId()
  return (
    <div className="flex flex-col gap-1">
      <Label id={labelId}>{label}</Label>
      {typeof children === 'function' ? children(labelId) : children}
    </div>
  )
}
