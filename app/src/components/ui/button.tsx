import type * as React from 'react'
import { cva  } from 'class-variance-authority'
import type {VariantProps} from 'class-variance-authority';
import {
  Button as ButtonPrimitive,
  Link as LinkPrimitive
  
  
} from 'react-aria-components'
import type {ButtonProps as ButtonPrimitiveProps, LinkProps as LinkPrimitiveProps} from 'react-aria-components';

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-oklch(0.922 0 0) border-transparent bg-clip-padding text-xs/relaxed font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-oklch(0.708 0 0) focus-visible:ring-2 focus-visible:ring-oklch(0.708 0 0)/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-oklch(0.577 0.245 27.325) aria-invalid:ring-2 aria-invalid:ring-oklch(0.577 0.245 27.325)/20 dark:aria-invalid:border-oklch(0.577 0.245 27.325)/50 dark:aria-invalid:ring-oklch(0.577 0.245 27.325)/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 dark:border-oklch(1 0 0 / 10%) dark:focus-visible:border-oklch(0.556 0 0) dark:focus-visible:ring-oklch(0.556 0 0)/30 dark:aria-invalid:border-oklch(0.704 0.191 22.216) dark:aria-invalid:ring-oklch(0.704 0.191 22.216)/20 dark:dark:aria-invalid:border-oklch(0.704 0.191 22.216)/50 dark:dark:aria-invalid:ring-oklch(0.704 0.191 22.216)/40",
  {
    variants: {
      variant: {
        default:
          'bg-oklch(0.205 0 0) text-oklch(0.985 0 0) hover:bg-oklch(0.205 0 0)/80 dark:bg-oklch(0.922 0 0) dark:text-oklch(0.205 0 0) dark:hover:bg-oklch(0.922 0 0)/80',
        outline:
          'border-oklch(0.922 0 0) hover:bg-oklch(0.922 0 0)/50 hover:text-oklch(0.145 0 0) aria-expanded:bg-oklch(0.97 0 0) aria-expanded:text-oklch(0.145 0 0) dark:bg-oklch(0.922 0 0)/30 dark:border-oklch(1 0 0 / 10%) dark:hover:bg-oklch(1 0 0 / 15%)/50 dark:hover:text-oklch(0.985 0 0) dark:aria-expanded:bg-oklch(0.269 0 0) dark:aria-expanded:text-oklch(0.985 0 0) dark:dark:bg-oklch(1 0 0 / 15%)/30',
        secondary:
          'bg-oklch(0.97 0 0) text-oklch(0.205 0 0) hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-oklch(0.97 0 0) aria-expanded:text-oklch(0.205 0 0) dark:bg-oklch(0.269 0 0) dark:text-oklch(0.985 0 0) dark:aria-expanded:bg-oklch(0.269 0 0) dark:aria-expanded:text-oklch(0.985 0 0)',
        ghost:
          'hover:bg-oklch(0.97 0 0) hover:text-oklch(0.145 0 0) aria-expanded:bg-oklch(0.97 0 0) aria-expanded:text-oklch(0.145 0 0) dark:hover:bg-oklch(0.97 0 0)/50 dark:hover:bg-oklch(0.269 0 0) dark:hover:text-oklch(0.985 0 0) dark:aria-expanded:bg-oklch(0.269 0 0) dark:aria-expanded:text-oklch(0.985 0 0) dark:dark:hover:bg-oklch(0.269 0 0)/50',
        destructive:
          'bg-oklch(0.577 0.245 27.325)/10 text-oklch(0.577 0.245 27.325) hover:bg-oklch(0.577 0.245 27.325)/20 focus-visible:border-oklch(0.577 0.245 27.325)/40 focus-visible:ring-oklch(0.577 0.245 27.325)/20 dark:bg-oklch(0.577 0.245 27.325)/20 dark:hover:bg-oklch(0.577 0.245 27.325)/30 dark:focus-visible:ring-oklch(0.577 0.245 27.325)/40 dark:bg-oklch(0.704 0.191 22.216)/10 dark:text-oklch(0.704 0.191 22.216) dark:hover:bg-oklch(0.704 0.191 22.216)/20 dark:focus-visible:border-oklch(0.704 0.191 22.216)/40 dark:focus-visible:ring-oklch(0.704 0.191 22.216)/20 dark:dark:bg-oklch(0.704 0.191 22.216)/20 dark:dark:hover:bg-oklch(0.704 0.191 22.216)/30 dark:dark:focus-visible:ring-oklch(0.704 0.191 22.216)/40',
        link: 'text-oklch(0.205 0 0) underline-offset-4 hover:underline dark:text-oklch(0.922 0 0)',
      },
      size: {
        default:
          "h-7 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-5 gap-1 rounded-sm px-2 text-[0.625rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-2.5",
        sm: "h-6 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-8 gap-1 px-2.5 text-xs/relaxed has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        icon: "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        'icon-xs': "size-5 rounded-sm [&_svg:not([class*='size-'])]:size-2.5",
        'icon-sm': "size-6 [&_svg:not([class*='size-'])]:size-3",
        'icon-lg': "size-8 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: Omit<ButtonPrimitiveProps, 'className'> &
  React.RefAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    className?: string
  }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

function LinkButton({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: Omit<LinkPrimitiveProps, 'className'> &
  VariantProps<typeof buttonVariants> & {
    className?: string
  }) {
  return (
    <LinkPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, LinkButton, buttonVariants }
