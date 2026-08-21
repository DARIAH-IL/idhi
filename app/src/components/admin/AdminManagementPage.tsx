import { useTranslation } from 'react-i18next'
import { InvitesPanel } from './invites/InvitesPanel'
import { UsersPanel } from './users/UsersPanel'

export function AdminManagementPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{t('admin.title')}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {t('admin.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UsersPanel />
        <InvitesPanel />
      </div>
    </div>
  )
}
