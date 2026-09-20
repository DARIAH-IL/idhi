import { cn } from '@/lib/utils'

export function FieldPair({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn('flex flex-wrap gap-2 [&>*]:flex-1', className)}
    >
      {children}
    </div>
  )
}
