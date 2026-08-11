import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getGetApiV1EntitiesEntityIdQueryOptions,
  usePostApiV1EntitiesEntityId,
} from '@/api/hooks/entities/entities'
import type { Entity } from '@/api/models'
import type { EntityType } from '@/lib/entity'
import { EntityForm } from '@/components/entity/EntityForm'

export const Route = createFileRoute('/_app/entities/$entityId/edit')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      getGetApiV1EntitiesEntityIdQueryOptions(
        decodeURIComponent(params.entityId),
      ),
    ),
  component: EditEntityPage,
})

function EditEntityPage() {
  const { t } = useTranslation()
  const { entityId } = Route.useParams()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const decodedId = decodeURIComponent(entityId)

  const { data: entity } = useQuery(
    getGetApiV1EntitiesEntityIdQueryOptions(decodedId),
  )

  const updateMutation = usePostApiV1EntitiesEntityId({
    mutation: {
      onSuccess: () => {
        void navigate({ to: '/entities/$entityId', params: { entityId } })
      },
      onError: () => setServerError(t('common.error')),
    },
  })

  if (!entity) {
    return <p className="text-muted-foreground">{t('common.loading')}</p>
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-lg font-semibold">{t('entity.form.edit_title')}</h1>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <EntityForm
        entityType={entity.type}
        defaultValues={entity}
        isEdit
        onSubmit={(data) => {
          updateMutation.mutate({ entityId: decodedId, data: data as Entity })
        }}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  )
}
