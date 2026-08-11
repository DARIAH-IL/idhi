import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { usePutApiV1Entities } from '@/api/hooks/entities/entities'
import type { Entity } from '@/api/models'
import { ENTITY_TYPES, getEntityTypeLabel } from '@/lib/entity'
import type { EntityType } from '@/lib/entity'
import { EntityForm } from '@/components/entity/EntityForm'
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
        <div className="grid grid-cols-3 gap-3">
          {ENTITY_TYPES.map((et) => (
            <Button
              key={et}
              variant="outline"
              size="lg"
              className="h-12 flex-col"
              onPress={() => setSelectedType(et)}
            >
              {getEntityTypeLabel(et)}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          {t('entity.form.new_title', {
            type: getEntityTypeLabel(selectedType),
          })}
        </h1>
        <Button variant="ghost" size="sm" onPress={() => setSelectedType(null)}>
          {t('common.back')}
        </Button>
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <EntityForm
        entityType={selectedType}
        onSubmit={(data) => {
          const entityData = { ...data, type: selectedType } as Entity
          createMutation.mutate({ data: entityData })
        }}
        isSubmitting={createMutation.isPending}
      />
    </div>
  )
}
