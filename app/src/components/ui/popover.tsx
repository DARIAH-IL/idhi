import * as React from 'react'
import {
  Dialog,
  DialogTrigger,
  Heading,
  Popover as PopoverPrimitive,
} from 'react-aria-components'
import type {
  DialogTriggerProps,
  PopoverProps as PopoverPrimitiveProps,
} from 'react-aria-components'

import { cn } from '@/lib/utils'

function PopoverTrigger({ children, ...props }: DialogTriggerProps) {
  return (
    <DialogTrigger data-slot="popover-trigger" {...props}>
      {children}
    </DialogTrigger>
  )
}

function Popover({
  className,
  placement = 'bottom',
  offset = 4,
  crossOffset = 0,
  children,
  'aria-label': ariaLabel,
  ...props
}: Omit<PopoverPrimitiveProps, 'className' | 'children'> & {
  className?: string
  children?: React.ReactNode
  'aria-label'?: string
}) {
  return (
    <PopoverPrimitive
      data-slot="popover-content"
      placement={placement}
      offset={offset}
      crossOffset={crossOffset}
      className={cn(
        'z-50 flex w-72 origin-(--trigger-anchor-point) flex-col rounded-lg bg-popover p-2.5 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    >
      <Dialog
        aria-label={ariaLabel}
        className="flex flex-col gap-4 outline-hidden"
      >
        {children}
      </Dialog>
    </PopoverPrimitive>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="popover-header"
      className={cn('flex flex-col gap-1 text-xs', className)}
      {...props}
    />
  )
}

function PopoverTitle({
  className,
  ...props
}: React.ComponentProps<typeof Heading>) {
  return (
    <Heading
      slot="title"
      data-slot="popover-title"
      className={cn('text-sm font-medium', className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="popover-description"
      className={cn('text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
