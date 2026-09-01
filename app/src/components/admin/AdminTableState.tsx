import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function AdminTableState({ message }: { message: string }) {
  return (
    <p role="status" className="px-4 py-12 text-center text-sm text-muted-foreground">
      {message}
    </p>
  )
}

export function AdminTableError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
      <p role="alert" className="text-sm text-destructive">
        {t('common.route_error_description')}
      </p>
      <Button variant="outline" onPress={onRetry}>
        {t('common.try_again')}
      </Button>
    </div>
  )
}
