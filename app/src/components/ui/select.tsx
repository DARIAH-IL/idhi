import * as React from 'react'
import {
  Button as ButtonPrimitive,
  composeRenderProps,
  Header as HeaderPrimitive,
  ListBoxItem as ListBoxItemPrimitive,
  ListBox as ListBoxPrimitive,
  ListBoxSection as ListBoxSectionPrimitive,
  Popover as PopoverPrimitive,
  SearchField,
  Select as SelectPrimitive,
  SelectValue as SelectValuePrimitive,
  Separator as SeparatorPrimitive
  
  
  
  
  
} from 'react-aria-components'
import type {ListBoxProps, SearchFieldProps, ListBoxSectionProps as SelectGroupProps, SelectProps, SelectValueProps} from 'react-aria-components';

import { cn } from '@/lib/utils'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  UnfoldMoreIcon,
  SearchIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'

function Select<T extends object, M extends 'single' | 'multiple' = 'single'>({
  className,
  ...props
}: SelectProps<T, M>) {
  return (
    <SelectPrimitive
      data-slot="select"
      className={cn('w-fit', className)}
      {...props}
    />
  )
}

function SelectGroup<T extends object>({
  className,
  ...props
}: SelectGroupProps<T>) {
  return (
    <ListBoxSectionPrimitive
      data-slot="select-group"
      className={cn('scroll-my-1 p-1', className)}
      {...props}
    />
  )
}

function SelectValue<T extends object>({
  className,
  children,
  ...props
}: SelectValueProps<T>) {
  return (
    <SelectValuePrimitive
      data-slot="select-value"
      className={cn(
        'flex flex-1 text-left data-placeholder:text-oklch(0.556 0 0) dark:data-placeholder:text-oklch(0.708 0 0)',
        className,
      )}
      {...props}
    >
      {typeof children === 'function'
        ? children
        : ({ selectedItems, selectedText, defaultChildren }) =>
            selectedItems.length > 1 ? selectedText : defaultChildren}
    </SelectValuePrimitive>
  )
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: Omit<React.ComponentProps<typeof ButtonPrimitive>, 'children'> & {
  children?: React.ReactNode
  size?: 'sm' | 'default'
}) {
  return (
    <ButtonPrimitive
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-full items-center justify-between gap-1.5 rounded-md border border-oklch(0.922 0 0) bg-oklch(0.922 0 0)/20 px-2 py-1.5 text-xs/relaxed whitespace-nowrap transition-colors outline-none focus-visible:border-oklch(0.708 0 0) focus-visible:ring-2 focus-visible:ring-oklch(0.708 0 0)/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-oklch(0.577 0.245 27.325) aria-invalid:ring-2 aria-invalid:ring-oklch(0.577 0.245 27.325)/20 data-placeholder:text-oklch(0.556 0 0) data-[size=default]:h-7 data-[size=sm]:h-6 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-oklch(0.922 0 0)/30 dark:hover:bg-oklch(0.922 0 0)/50 dark:aria-invalid:border-oklch(0.577 0.245 27.325)/50 dark:aria-invalid:ring-oklch(0.577 0.245 27.325)/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 dark:border-oklch(1 0 0 / 10%) dark:border-oklch(1 0 0 / 15%) dark:bg-oklch(1 0 0 / 15%)/20 dark:focus-visible:border-oklch(0.556 0 0) dark:focus-visible:ring-oklch(0.556 0 0)/30 dark:aria-invalid:border-oklch(0.704 0.191 22.216) dark:aria-invalid:ring-oklch(0.704 0.191 22.216)/20 dark:data-placeholder:text-oklch(0.708 0 0) dark:dark:bg-oklch(1 0 0 / 15%)/30 dark:dark:hover:bg-oklch(1 0 0 / 15%)/50 dark:dark:aria-invalid:border-oklch(0.704 0.191 22.216)/50 dark:dark:aria-invalid:ring-oklch(0.704 0.191 22.216)/40",
        className,
      )}
      {...props}
    >
      {children}
      <HugeiconsIcon
        icon={UnfoldMoreIcon}
        strokeWidth={2}
        className="pointer-events-none size-3.5 text-oklch(0.556 0 0) dark:text-oklch(0.708 0 0)"
      />
    </ButtonPrimitive>
  )
}

function SelectContent({
  className,
  children,
  placement = 'bottom',
  offset = 4,
  crossOffset = 0,
  ...props
}: Omit<
  React.ComponentProps<typeof PopoverPrimitive>,
  'className' | 'children'
> & {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <SelectPopover
      className={className}
      placement={placement}
      offset={offset}
      crossOffset={crossOffset}
      {...props}
    >
      <SelectList>{children}</SelectList>
    </SelectPopover>
  )
}

function SelectPopover({
  className,
  children,
  placement = 'bottom start',
  offset = 4,
  crossOffset = 0,
  ...props
}: Omit<
  React.ComponentProps<typeof PopoverPrimitive>,
  'className' | 'children'
> & {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <PopoverPrimitive
      data-slot="select-content"
      placement={placement}
      offset={offset}
      crossOffset={crossOffset}
      className={cn(
        'relative isolate z-50 w-(--trigger-width) min-w-32 origin-(--trigger-anchor-point) overflow-hidden rounded-lg bg-oklch(1 0 0) text-oklch(0.145 0 0) shadow-md ring-1 ring-oklch(0.145 0 0)/10 duration-100 data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 **:data-[slot$=-item]:data-focused:bg-oklch(0.145 0 0)/10 dark:bg-oklch(0.205 0 0) dark:text-oklch(0.985 0 0) dark:ring-oklch(0.985 0 0)/10 dark:**:data-[slot$=-item]:data-focused:bg-oklch(0.985 0 0)/10',
        className,
      )}
      {...props}
    >
      {children}
    </PopoverPrimitive>
  )
}

function SelectList<T extends object>({
  className,
  ...props
}: ListBoxProps<T>) {
  return (
    <ListBoxPrimitive
      data-slot="select-list"
      className={cn(
        'group/select-list max-h-[inherit] overflow-x-hidden overflow-y-auto p-0 outline-hidden',
        className,
      )}
      {...props}
    />
  )
}

function SelectInput({ className, ...props }: SearchFieldProps) {
  return (
    <SearchField
      {...props}
      autoFocus
      data-slot="select-input-wrapper"
      className={cn('p-1 pb-0', className)}
    >
      <InputGroup>
        <InputGroupInput
          data-slot="select-input"
          className="[&::-webkit-search-cancel-button]:hidden"
        />
        <InputGroupAddon>
          <HugeiconsIcon
            icon={SearchIcon}
            strokeWidth={2}
            className="size-3.5 shrink-0 opacity-50"
          />
        </InputGroupAddon>
      </InputGroup>
    </SearchField>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof HeaderPrimitive>) {
  return (
    <HeaderPrimitive
      data-slot="select-label"
      className={cn(
        'px-2 py-1.5 text-xs text-oklch(0.556 0 0) dark:text-oklch(0.708 0 0)',
        className,
      )}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ListBoxItemPrimitive>) {
  return (
    <ListBoxItemPrimitive
      data-slot="select-item"
      textValue={typeof children === 'string' ? children : undefined}
      className={cn(
        "relative flex min-h-7 w-full cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed outline-hidden select-none focus:bg-oklch(0.97 0 0) focus:text-oklch(0.205 0 0) not-data-[variant=destructive]:focus:**:text-oklch(0.205 0 0) data-focused:bg-oklch(0.97 0 0) data-focused:text-oklch(0.205 0 0) data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 dark:focus:bg-oklch(0.269 0 0) dark:focus:text-oklch(0.985 0 0) dark:not-data-[variant=destructive]:focus:**:text-oklch(0.985 0 0) dark:data-focused:bg-oklch(0.269 0 0) dark:data-focused:text-oklch(0.985 0 0)",
        className,
      )}
      {...props}
    >
      {composeRenderProps(children, (children, { isSelected }) => (
        <>
          <span className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
            {children}
          </span>
          <span className="pointer-events-none absolute right-2 flex items-center justify-center">
            {isSelected ? (
              <HugeiconsIcon
                icon={Tick02Icon}
                strokeWidth={2}
                className="pointer-events-none"
              />
            ) : null}
          </span>
        </>
      ))}
    </ListBoxItemPrimitive>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive>) {
  return (
    <SeparatorPrimitive
      data-slot="select-separator"
      className={cn(
        'pointer-events-none -mx-1 my-1 h-px bg-oklch(0.922 0 0)/50 dark:bg-oklch(1 0 0 / 10%)/50',
        className,
      )}
      {...props}
    />
  )
}

function SelectEmpty({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="select-empty"
      className={cn(
        'hidden w-full justify-center py-2 text-center text-xs/relaxed text-oklch(0.556 0 0) group-data-empty/select-list:flex dark:text-oklch(0.708 0 0)',
        className,
      )}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectInput,
  SelectItem,
  SelectLabel,
  SelectList,
  SelectPopover,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectEmpty,
}
