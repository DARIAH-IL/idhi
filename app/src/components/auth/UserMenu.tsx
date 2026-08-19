import { Logout01Icon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'

export function UserMenu() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  if (!user) return null

  return (
    <MenuTrigger>
      <Button
        variant="ghost"
        size="icon-lg"
        className="rounded-full"
        aria-label={t('auth.user_menu')}
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <HugeiconsIcon icon={UserIcon} strokeWidth={1.8} />
        </span>
      </Button>
      <Popover
        placement="bottom end"
        offset={6}
        className="z-50 min-w-36 origin-(--trigger-anchor-point) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none duration-100 data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95"
      >
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">
            {t('auth.signed_in_as')}
          </p>
          <p
            className="max-w-64 truncate text-xs font-medium"
            title={user.email}
          >
            {user.email}
          </p>
        </div>
        <div className="my-1 h-px bg-border" />
        <Menu aria-label={t('auth.user_actions')} className="outline-none">
          <MenuItem
            id="logout"
            onAction={logout}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs outline-none data-focused:bg-accent data-focused:text-accent-foreground"
          >
            <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
            {t('common.logout')}
          </MenuItem>
        </Menu>
      </Popover>
    </MenuTrigger>
  )
}
