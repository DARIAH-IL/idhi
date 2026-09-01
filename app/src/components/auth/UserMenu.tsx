import { Logout01Icon, UserShield01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useNavigate } from '@tanstack/react-router'
import { Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'

export function UserMenu() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  if (!user) {
    return null
  }

  return (
    <MenuTrigger>
      <Button
        variant="ghost"
        size="icon-xl"
        className="rounded-full"
        aria-label={t('common.user_menu')}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground uppercase">
          {user.name?.charAt(0) || user.email.charAt(0)}
        </span>
      </Button>
      <Popover
        placement="bottom end"
        offset={6}
        className="z-50 min-w-36 origin-(--trigger-anchor-point) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none duration-100 data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95"
      >
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">
            {t('common.signed_in_as')}
          </p>
          <p
            className="max-w-64 truncate text-xs font-medium"
            title={user.email}
          >
            {user.email}
          </p>
        </div>
        <div className="my-1 h-px bg-border" />
        <Menu aria-label={t('common.user_actions')} className="outline-none">
          {user.isAdmin && (
            <MenuItem
              id="admin"
              onAction={() => void navigate({ to: '/admin' })}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs outline-none data-focused:bg-accent data-focused:text-accent-foreground data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-foreground"
            >
              <HugeiconsIcon
                icon={UserShield01Icon}
                strokeWidth={2}
                aria-hidden="true"
              />
              {t('admin.menu_item')}
            </MenuItem>
          )}
          <MenuItem
            id="logout"
            onAction={() => {
              logout()
              toast.success(t('auth.signed_out'))
            }}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs outline-none data-focused:bg-accent data-focused:text-accent-foreground data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-foreground"
          >
            <HugeiconsIcon
              icon={Logout01Icon}
              strokeWidth={2}
              aria-hidden="true"
            />
            {t('common.logout')}
          </MenuItem>
        </Menu>
      </Popover>
    </MenuTrigger>
  )
}
