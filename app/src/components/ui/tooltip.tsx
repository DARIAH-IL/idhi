import * as React from 'react'
import {
  Focusable,
  OverlayArrow,
  Tooltip as TooltipPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
} from 'react-aria-components'

import { cn } from '@/lib/utils'

function TooltipTrigger({
  delay = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipTriggerPrimitive>) {
  const [trigger, tooltip] = React.Children.toArray(children)
  const ref = React.useRef<HTMLSpanElement>(null)
  const [connected, setConnected] = React.useState(false)

  React.useLayoutEffect(() => {
    setConnected(ref.current?.isConnected ?? false)
  }, [])

  const triggerElement = (
    <span ref={ref} role="button">
      {trigger}
    </span>
  )

  return (
    <TooltipTriggerPrimitive
      data-slot="tooltip-trigger"
      delay={delay}
      {...props}
    >
      {connected ? <Focusable>{triggerElement}</Focusable> : triggerElement}
      {tooltip}
    </TooltipTriggerPrimitive>
  )
}

function Tooltip({
  className,
  placement = 'bottom',
  offset = 10,
  crossOffset = 0,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof TooltipPrimitive>,
  'children' | 'className'
> & {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <TooltipPrimitive
      data-slot="tooltip-content"
      placement={placement}
      offset={offset}
      crossOffset={crossOffset}
      className={cn(
        'z-50 inline-flex w-fit max-w-xs origin-(--trigger-anchor-point) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pe-1.5 data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=start]:slide-in-from-end-2 data-[placement=end]:slide-in-from-start-2 data-[placement=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm',
        className,
      )}
      {...props}
    >
      {children}
      <OverlayArrow
        className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground"
        style={({ placement: arrowPlacement, defaultStyle }) => ({
          ...defaultStyle,
          rotate: '0deg',
          translate: '0',
          transform:
            arrowPlacement === 'bottom'
              ? 'translate(-50%, calc(50% + 2px)) rotate(45deg)'
              : arrowPlacement === 'top'
                ? 'translate(-50%, calc(-50% - 2px)) rotate(45deg)'
                : arrowPlacement === 'left'
                  ? 'translate(calc(-50% - 2px), -50%) rotate(45deg)'
                  : 'translate(calc(50% + 2px), -50%) rotate(45deg)',
        })}
      />
    </TooltipPrimitive>
  )
}

export { Tooltip, TooltipTrigger }
