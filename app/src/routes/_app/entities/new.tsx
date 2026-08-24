import { useState } from 'react'
import {
  createFileRoute,
  Navigate,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCreateEntity } from '@/api/hooks/entities/entities'
import { ENTITY_TYPES, getEntityTypeLabel } from '@/lib/entity'
import type { EntityType } from '@/lib/entity'
import { EntityForm } from '@/components/forms/entity/EntityForm'
import { EntityTypeIcon } from '@/components/entity/EntityTypeIcon'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'

export const Route = createFileRoute('/_app/entities/new')({
  beforeLoad: () => {
    if (!useAuthStore.getState().token) {
      throw redirect({ to: '/entities' })
    }
  },
  component: NewEntityPage,
})

function NewEntityPage() {
  const { t } = useTranslation()
  const token = useAuthStore((state) => state.token)
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<EntityType | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const createMutation = useCreateEntity({
    mutation: {
      onSuccess: (entity) => {
        toast.success(t('entity.notifications.created'))
        void navigate({
          to: '/entities/$entityId',
          params: { entityId: encodeURIComponent(entity.id) },
        })
      },
      onError: () => setServerError(t('common.error')),
    },
  })

  if (!token) {
    return <Navigate to="/entities" replace />
  }

  if (!selectedType) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        <h1 className="text-lg font-semibold">
          {t('entity.form.select_type')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('entity.form.select_type_description')}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[...ENTITY_TYPES]
            .sort((a, b) =>
              getEntityTypeLabel(a).localeCompare(getEntityTypeLabel(b)),
            )
            .map((et) => (
              <Button
                key={et}
                variant="outline"
                size="lg"
                className="h-24 flex-col gap-2"
                onPress={() => setSelectedType(et)}
              >
                <EntityTypeIcon type={et} size="lg" />
                <span>{getEntityTypeLabel(et)}</span>
              </Button>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <EntityTypeIcon type={selectedType} />
          <h1 className="text-lg font-semibold">
            {t('entity.form.new_title', {
              type: getEntityTypeLabel(selectedType),
            })}
          </h1>
        </div>
        <Button variant="ghost" size="sm" onPress={() => setSelectedType(null)}>
          {t('common.back')}
        </Button>
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <EntityForm
        entityType={selectedType}
        onSubmit={(data) => {
          createMutation.mutate({ data })
        }}
        isSubmitting={createMutation.isPending}
      />
    </div>
  )
}
