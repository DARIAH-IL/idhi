import * as React from 'react'
import {
  Modal as ModalPrimitive,
  ModalOverlay as ModalOverlayPrimitive,
} from 'react-aria-components'
import type { ModalOverlayProps as ModalOverlayPrimitiveProps } from 'react-aria-components'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'
import { DialogClose, DialogTrigger } from '@/components/ui/dialog'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'

function DrawerOverlay({
  className,
  children,
  ...props
}: Omit<ModalOverlayPrimitiveProps, 'className' | 'children'> & {
  className?: string
  children: React.ReactNode
}) {
  return (
    <ModalOverlayPrimitive
      data-slot="drawer-overlay"
      className={cn(
        'fixed inset-0 isolate z-50 bg-black/80 duration-100 data-entering:animate-in data-entering:fade-in-0 data-exiting:animate-out data-exiting:fade-out-0 supports-backdrop-filter:backdrop-blur-xs',
        className,
      )}
      {...props}
    >
      {children}
    </ModalOverlayPrimitive>
  )
}

function Drawer({
  className,
  children,
  showCloseButton = true,
  isDismissable = true,
  ...props
}: Omit<ModalOverlayPrimitiveProps, 'className' | 'children'> &
  Pick<React.ComponentProps<typeof ModalPrimitive>, 'isDismissable'> & {
    className?: string
    children: React.ReactNode
    showCloseButton?: boolean
  }) {
  const { t } = useTranslation()
  return (
    <DrawerOverlay isDismissable={isDismissable} {...props}>
      <ModalPrimitive
        data-slot="drawer-content"
        className={cn(
          'fixed inset-y-0 start-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto bg-background text-xs/relaxed text-foreground ring-1 ring-foreground/10 duration-150 data-entering:animate-in data-entering:slide-in-from-start-[100%] data-exiting:animate-out data-exiting:slide-out-to-start-[100%] outline-none',
          className,
        )}
      >
        <div className="relative">
          {children}
          {showCloseButton && (
            <DialogClose
              variant="ghost"
              className="absolute top-2 inset-e-2"
              size="icon-sm"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              <span className="sr-only">{t('common.close')}</span>
            </DialogClose>
          )}
        </div>
      </ModalPrimitive>
    </DrawerOverlay>
  )
}

export { Drawer, DrawerOverlay, DialogTrigger as DrawerTrigger }
