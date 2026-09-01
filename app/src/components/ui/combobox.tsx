import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button as ButtonPrimitive,
  Collection,
  ComboBox as ComboBoxPrimitive,
  ComboBoxStateContext,
  ComboBoxValue as ComboBoxValuePrimitive,
  composeRenderProps,
  Group,
  Header as HeaderPrimitive,
  Input as InputPrimitive,
  ListBoxItem as ListBoxItemPrimitive,
  ListBox as ListBoxPrimitive,
  ListBoxSection as ListBoxSectionPrimitive,
  Popover as PopoverPrimitive,
  Separator as SeparatorPrimitive,
  TagGroup as TagGroupPrimitive,
  TagList as TagListPrimitive,
  Tag as TagPrimitive,
} from 'react-aria-components'
import type {
  ButtonProps,
  ComboBoxValueProps,
  GroupProps,
  HeaderProps,
  InputProps,
  ListBoxItemProps,
  ListBoxProps,
  ListBoxSectionProps,
  SeparatorProps,
  TagListProps,
  TagProps,
} from 'react-aria-components'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowDown01Icon,
  Cancel01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'

function ComboboxValue<T>({ ...props }: ComboBoxValueProps<T>) {
  return <ComboBoxValuePrimitive data-slot="combobox-value" {...props} />
}

function ComboboxTrigger({
  className,
  size = 'default',
  children,
  ...props
}: Omit<ButtonProps, 'children'> & {
  children?: React.ReactNode
  size?: 'sm' | 'default'
}) {
  return (
    <ButtonPrimitive
      data-slot="combobox-trigger"
      data-size={size}
      className={cn(
        "flex w-full items-center justify-between gap-1.5 rounded-md border border-input bg-input/20 px-2 py-1.5 text-xs/relaxed whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/70 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-[size=default]:h-7 data-[size=sm]:h-6 *:data-[slot=combobox-value]:line-clamp-1 *:data-[slot=combobox-value]:flex *:data-[slot=combobox-value]:items-center *:data-[slot=combobox-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    >
      {children}
      <HugeiconsIcon
        icon={ArrowDown01Icon}
        strokeWidth={2}
        className="pointer-events-none size-3.5 text-muted-foreground"
      />
    </ButtonPrimitive>
  )
}

function ComboboxClear({
  className,
  ...props
}: React.ComponentProps<typeof InputGroupButton>) {
  const { t } = useTranslation()
  const state = React.useContext(ComboBoxStateContext)
  if (state?.inputValue === '') {
    return null
  }

  return (
    <InputGroupButton
      data-slot="combobox-clear"
      variant="ghost"
      size="icon-xs"
      aria-label={t('common.clear')}
      className={cn(className)}
      onPress={() => {
        state?.setValue(null)
      }}
      slot={null}
      {...props}
    >
      <HugeiconsIcon
        icon={Cancel01Icon}
        strokeWidth={2}
        className="pointer-events-none"
      />
    </InputGroupButton>
  )
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: React.ComponentProps<'input'> & {
  showTrigger?: boolean
  showClear?: boolean
}) {
  const state = React.useContext(ComboBoxStateContext)
  return (
    <InputGroup
      className={cn('w-auto', className)}
      onPointerDown={(e) => {
        if (e.target instanceof Element && e.target.closest('button')) {
          return
        }
        state?.open()
      }}
    >
      <InputGroupInput disabled={disabled} {...props} />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            data-slot="combobox-trigger"
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent [&_svg:not([class*='size-'])]:size-3.5"
            isDisabled={disabled}
          >
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              className="pointer-events-none size-3.5 text-muted-foreground"
            />
          </InputGroupButton>
        )}
        {showClear && <ComboboxClear isDisabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
}

function ComboboxContent({
  className,
  placement = 'bottom',
  offset = 6,
  crossOffset = 0,
  anchor,
  ...props
}: Omit<
  React.ComponentProps<typeof PopoverPrimitive>,
  'className' | 'children'
> & {
  className?: string
  children?: React.ReactNode
  anchor?: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <PopoverPrimitive
      data-slot="combobox-content"
      placement={placement}
      offset={offset}
      crossOffset={crossOffset}
      triggerRef={anchor}
      className={cn(
        'relative isolate z-50 max-h-72 w-(--trigger-width) min-w-32 origin-(--trigger-anchor-point) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=start]:slide-in-from-end-2 data-[placement=end]:slide-in-from-start-2 data-[placement=top]:slide-in-from-bottom-2 **:data-[slot$=-item]:data-focused:bg-foreground/10 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-7 *:data-[slot=input-group]:border-none *:data-[slot=input-group]:bg-input/20 *:data-[slot=input-group]:shadow-none',
        className,
      )}
      {...props}
    />
  )
}

function ComboboxList<T extends object>({
  className,
  ...props
}: ListBoxProps<T>) {
  return (
    <ListBoxPrimitive
      data-slot="combobox-list"
      className={cn(
        'group/combobox-content no-scrollbar max-h-[inherit] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0',
        className,
      )}
      {...props}
    />
  )
}

function ComboboxItem<T extends object>({
  className,
  children,
  ...props
}: ListBoxItemProps<T>) {
  return (
    <ListBoxItemPrimitive
      data-slot="combobox-item"
      textValue={typeof children === 'string' ? children : undefined}
      className={cn(
        "relative flex min-h-7 w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed outline-hidden select-none data-focused:bg-accent data-focused:text-accent-foreground not-data-[variant=destructive]:data-focused:**:text-accent-foreground data-disabled:cursor-default data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    >
      {composeRenderProps(children, (renderedChildren, { isSelected }) => (
        <>
          {renderedChildren}
          <span className="pointer-events-none absolute inset-e-2 flex items-center justify-center">
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

function ComboboxGroup<T extends object>({
  className,
  ...props
}: ListBoxSectionProps<T>) {
  return (
    <ListBoxSectionPrimitive
      data-slot="combobox-group"
      className={cn('scroll-my-1 p-1', className)}
      {...props}
    />
  )
}

function ComboboxLabel({ className, ...props }: HeaderProps) {
  return (
    <HeaderPrimitive
      data-slot="combobox-label"
      className={cn('px-2 py-1.5 text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

function ComboboxEmpty({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="combobox-empty"
      className={cn(
        'hidden w-full justify-center py-2 text-center text-xs/relaxed text-muted-foreground group-data-empty/combobox-content:flex',
        className,
      )}
      {...props}
    />
  )
}

function ComboboxSeparator({ className, ...props }: SeparatorProps) {
  return (
    <SeparatorPrimitive
      data-slot="combobox-separator"
      className={cn(
        'pointer-events-none -mx-1 my-1 h-px bg-border/50',
        className,
      )}
      {...props}
    />
  )
}

function ComboboxChips({ children, className, ...props }: GroupProps) {
  const state = React.useContext(ComboBoxStateContext)
  return (
    <Group
      data-slot="combobox-chips"
      className={cn(
        'flex min-h-7 flex-wrap items-center gap-1 rounded-md border border-input bg-input/20 bg-clip-padding px-2 py-0.5 text-xs/relaxed transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/70 has-aria-invalid:border-destructive has-aria-invalid:ring-2 has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40',
        className,
      )}
      onPointerDown={(e) => {
        if (e.target instanceof Element && e.target.closest('button')) {
          return
        }
        state?.open()
      }}
      {...props}
    >
      {children}
    </Group>
  )
}

function ComboboxChipList<T extends object>({
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  ...props
}: Omit<TagListProps<T>, 'className' | 'items'> & {
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}) {
  return (
    <ComboBoxValuePrimitive<T> className="contents">
      {({ selectedItems, state }) => (
        <TagGroupPrimitive
          data-slot="combobox-chip-list"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          className={cn('contents', className)}
          onRemove={(keys) => {
            if (Array.isArray(state.value)) {
              state.setValue(state.value.filter((k) => !keys.has(k)))
            }
          }}
        >
          <TagListPrimitive
            className="contents"
            items={selectedItems.filter((item) => item != null)}
            {...props}
          />
        </TagGroupPrimitive>
      )}
    </ComboBoxValuePrimitive>
  )
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: Omit<TagProps, 'children'> & {
  showRemove?: boolean
  children?: React.ReactNode
}) {
  return (
    <TagPrimitive
      data-slot="combobox-chip"
      className={cn(
        'flex h-[calc(--spacing(4.75))] w-fit items-center justify-center gap-1 rounded-[calc(var(--radius-sm)-2px)] bg-muted-foreground/10 px-1.5 text-xs/relaxed font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pe-0',
        className,
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <Button
          slot="remove"
          variant="ghost"
          size="icon-xs"
          className="-ms-1 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            strokeWidth={2}
            className="pointer-events-none"
          />
        </Button>
      )}
    </TagPrimitive>
  )
}

function ComboboxChipsInput({ className, ...props }: InputProps) {
  const state = React.useContext(ComboBoxStateContext)
  return (
    <InputPrimitive
      data-slot="combobox-chip-input"
      className={cn('min-w-16 flex-1 outline-none', className)}
      onKeyDown={(e) => {
        if (
          e.key === 'Backspace' &&
          e.currentTarget.value === '' &&
          Array.isArray(state?.value) &&
          state.value.length > 0
        ) {
          e.preventDefault()
          state.setValue(state.value.slice(0, -1))
        }
      }}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

export {
  ComboBoxPrimitive as Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  Collection as ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipList,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}
