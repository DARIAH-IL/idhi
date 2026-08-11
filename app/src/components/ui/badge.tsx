import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-oklch(0.922 0 0) border-transparent px-2 py-0.5 text-[0.625rem] font-medium whitespace-nowrap transition-all focus-visible:border-oklch(0.708 0 0) focus-visible:ring-[3px] focus-visible:ring-oklch(0.708 0 0)/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-oklch(0.577 0.245 27.325) aria-invalid:ring-oklch(0.577 0.245 27.325)/20 [&>svg]:pointer-events-none [&>svg]:size-2.5!',
  {
    variants: {
      variant: {
        default:
          'bg-oklch(0.205 0 0) text-oklch(0.985 0 0) [a]:hover:bg-oklch(0.205 0 0)/80',
        secondary:
          'bg-oklch(0.97 0 0) text-oklch(0.205 0 0) [a]:hover:bg-oklch(0.97 0 0)/80',
        destructive:
          'bg-oklch(0.577 0.245 27.325)/10 text-oklch(0.577 0.245 27.325) focus-visible:ring-oklch(0.577 0.245 27.325)/20 [a]:hover:bg-oklch(0.577 0.245 27.325)/20',
        outline:
          'border-oklch(0.922 0 0) bg-oklch(0.922 0 0)/20 text-oklch(0.145 0 0) [a]:hover:bg-oklch(0.97 0 0) [a]:hover:text-oklch(0.556 0 0)',
        ghost: 'hover:bg-oklch(0.97 0 0) hover:text-oklch(0.556 0 0)',
        link: 'text-oklch(0.205 0 0) underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant = 'default',
  render,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    render?: (props: React.HTMLAttributes<HTMLElement>) => React.ReactNode
  }) {
  if (render) {
    const renderProps = {
      'data-slot': 'badge',
      'data-variant': variant,
      className: cn(badgeVariants({ variant }), className),
      ...props,
    }

    return render(renderProps)
  }

  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
