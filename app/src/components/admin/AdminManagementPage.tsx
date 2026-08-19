import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminSummary } from './AdminSummary'
import { InvitesPanel } from './invites/InvitesPanel'
import { UsersPanel } from './users/UsersPanel'

type Section = 'users' | 'invites'

export function AdminManagementPage() {
  const { t } = useTranslation()
  const [section, setSection] = useState<Section>('users')

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{t('admin.title')}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {t('admin.description')}
        </p>
      </div>

      <AdminSummary />

      <div
        role="tablist"
        aria-label={t('admin.sections_label')}
        className="flex w-fit rounded-lg bg-muted p-1"
      >
        <SectionTab
          id="users"
          selected={section === 'users'}
          onPress={() => setSection('users')}
        >
          {t('admin.users.title')}
        </SectionTab>
        <SectionTab
          id="invites"
          selected={section === 'invites'}
          onPress={() => setSection('invites')}
        >
          {t('admin.invites.title')}
        </SectionTab>
      </div>

      {section === 'users' ? <UsersPanel /> : <InvitesPanel />}
    </div>
  )
}

function SectionTab({
  id,
  selected,
  onPress,
  children,
}: {
  id: Section
  selected: boolean
  onPress: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      id={`${id}-tab`}
      role="tab"
      aria-selected={selected}
      onClick={onPress}
      className={`inline-flex h-7 cursor-pointer items-center justify-center rounded-md px-2 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/30 ${
        selected
          ? 'bg-background shadow-sm'
          : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}
