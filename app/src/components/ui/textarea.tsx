'use client'

import * as React from 'react'
import {
  composeRenderProps,
  TextArea as TextareaPrimitive,
} from 'react-aria-components'

import { cn } from '@/lib/utils'

function Textarea({
  className,
  ...props
}: React.ComponentProps<typeof TextareaPrimitive>) {
  return (
    <TextareaPrimitive
      data-slot="textarea"
      className={composeRenderProps(className, (renderedClassName) =>
        cn(
          'flex field-sizing-content min-h-16 w-full resize-none rounded-md border border-oklch(0.922 0 0) bg-oklch(0.922 0 0)/20 px-2 py-2 text-sm transition-colors outline-none placeholder:text-oklch(0.556 0 0) focus-visible:border-oklch(0.708 0 0) focus-visible:ring-2 focus-visible:ring-oklch(0.708 0 0)/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-oklch(0.577 0.245 27.325) aria-invalid:ring-2 aria-invalid:ring-oklch(0.577 0.245 27.325)/20 md:text-xs/relaxed',
          renderedClassName,
        ),
      )}
      {...props}
    />
  )
}

export { Textarea }
