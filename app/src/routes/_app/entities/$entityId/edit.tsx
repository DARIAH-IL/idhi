import {
  createFileRoute,
  Navigate,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  getGetEntityByIdQueryOptions,
  useUpdateEntityById,
} from '@/api/hooks/entities/entities'
import { EntityFormCreationHost } from '@/components/forms/entity/EntityFormCreationHost'
import { EntityImage } from '@/components/entity/EntityImage'
import { getEntityDisplayName, getEntityTypeLabel } from '@/lib/entity'
import { useAuthStore } from '@/stores/auth'
import { cacheSavedEntity } from '@/api/entityCacheOps'

export const Route = createFileRoute('/_app/entities/$entityId/edit')({
  beforeLoad: ({ params }) => {
    if (!useAuthStore.getState().token) {
      throw redirect({
        to: '/entities/$entityId',
        params: { entityId: params.entityId },
      })
    }
  },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      getGetEntityByIdQueryOptions(decodeURIComponent(params.entityId)),
    ),
  component: EditEntityPage,
})

function EditEntityPage() {
  const { t } = useTranslation()
  const token = useAuthStore((state) => state.token)
  const { entityId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const decodedId = decodeURIComponent(entityId)

  const { data: entity } = useQuery(getGetEntityByIdQueryOptions(decodedId))

  const updateMutation = useUpdateEntityById({
    mutation: {
      onSuccess: (updatedEntity) => {
        void cacheSavedEntity(queryClient, updatedEntity)
        toast.success(t('entity.notifications.updated'))
        void navigate({ to: '/entities', ignoreBlocker: true })
      },
      onError: () => setServerError(t('common.error')),
    },
  })

  if (!token) {
    return <Navigate to="/entities/$entityId" params={{ entityId }} replace />
  }

  if (!entity) {
    return (
      <p role="status" className="text-muted-foreground">
        {t('common.loading')}
      </p>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      {serverError && (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      )}

      <EntityFormCreationHost
        entityType={entity.type}
        entity={entity}
        title={
          <div className="flex items-center gap-2.5">
            <EntityImage
              image={entity.image}
              type={entity.type}
              alt={getEntityDisplayName(entity)}
              entityId={entity.id}
            />
            <div>
              <h1 className="text-lg font-semibold">
                {t('entity.form.edit_title', {
                  type: getEntityTypeLabel(entity.type),
                })}
              </h1>
              <p className="text-xs text-muted-foreground">
                {getEntityDisplayName(entity)}
              </p>
            </div>
          </div>
        }
        onSubmit={(data, isDraft) =>
          updateMutation.mutateAsync({
            entityId: decodedId,
            data,
            params: isDraft ? { isDraft: true } : undefined,
          })
        }
        isSubmitting={updateMutation.isPending}
      />
    </div>
  )
}
