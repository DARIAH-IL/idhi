import * as React from 'react'
import {
  composeRenderProps,
  Input as InputPrimitive,
} from 'react-aria-components'

import { cn } from '@/lib/utils'

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<typeof InputPrimitive>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={composeRenderProps(className, (renderedClassName) =>
        cn(
          'h-7 w-full min-w-0 rounded-md border border-oklch(0.922 0 0) bg-oklch(0.922 0 0)/20 px-2 py-0.5 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-oklch(0.145 0 0) placeholder:text-oklch(0.556 0 0) focus-visible:border-oklch(0.708 0 0) focus-visible:ring-2 focus-visible:ring-oklch(0.708 0 0)/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-oklch(0.577 0.245 27.325) aria-invalid:ring-2 aria-invalid:ring-oklch(0.577 0.245 27.325)/20 md:text-xs/relaxed',
          renderedClassName,
        ),
      )}
      {...props}
    />
  )
}

export { Input }
