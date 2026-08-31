import { Globe02Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { UiLanguage } from '@/api/models'
import { languageName } from '@/lib/languages'
import { useUIStore } from '@/stores/ui'
import { Button } from '@/components/ui/button'

export function UiLanguagePicker() {
  const { t } = useTranslation()
  const language = useUIStore((s) => s.language)
  const setLanguage = useUIStore((s) => s.setLanguage)

  return (
    <MenuTrigger>
      <Button
        variant="outline"
        size="icon-lg"
        className="rounded-full"
        aria-label={t('common.language_picker')}
      >
        <HugeiconsIcon icon={Globe02Icon} strokeWidth={1.8} />
      </Button>
      <Popover
        placement="bottom end"
        offset={6}
        className="z-50 min-w-36 origin-(--trigger-anchor-point) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none duration-100 data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95"
      >
        <Menu aria-label={t('common.language_picker')} className="outline-none">
          {Object.values(UiLanguage).map((lang) => (
            <MenuItem
              key={lang}
              id={lang}
              onAction={() => setLanguage(lang)}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs outline-none data-focused:bg-accent data-focused:text-accent-foreground"
            >
              <span>{languageName(lang) ?? lang}</span>
              {language === lang && (
                <HugeiconsIcon
                  icon={Tick02Icon}
                  strokeWidth={2}
                  className="size-3.5"
                />
              )}
            </MenuItem>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  )
}
