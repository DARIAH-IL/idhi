import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { usePutApiV1Entities } from '@/api/hooks/entities/entities'
import { ENTITY_TYPES, getEntityTypeLabel } from '@/lib/entity'
import type { EntityType } from '@/lib/entity'
import { EntityForm } from '@/components/entity/EntityForm'
import { EntityTypeIcon } from '@/components/entity/EntityTypeIcon'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_app/entities/new')({
  component: NewEntityPage,
})

function NewEntityPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<EntityType | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const createMutation = usePutApiV1Entities({
    mutation: {
      onSuccess: (entity) => {
        toast.success(t('entity.notifications.created'))
        const id = (entity as unknown as Record<string, string>)['id'] ?? ''
        void navigate({
          to: '/entities/$entityId',
          params: { entityId: encodeURIComponent(id) },
        })
      },
      onError: () => setServerError(t('common.error')),
    },
  })

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
          {ENTITY_TYPES.map((et) => (
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
