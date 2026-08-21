import {
  createFileRoute,
  Navigate,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  getGetApiV1EntitiesEntityIdQueryOptions,
  usePostApiV1EntitiesEntityId,
} from '@/api/hooks/entities/entities'
import { EntityForm } from '@/components/forms/entity/EntityForm'
import { EntityImage } from '@/components/entity/EntityImage'
import { getEntityDisplayName } from '@/lib/entity'
import { useAuthStore } from '@/stores/auth'

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
      getGetApiV1EntitiesEntityIdQueryOptions(
        decodeURIComponent(params.entityId),
      ),
    ),
  component: EditEntityPage,
})

function EditEntityPage() {
  const { t } = useTranslation()
  const token = useAuthStore((state) => state.token)
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
        toast.success(t('entity.notifications.updated'))
        void navigate({ to: '/entities' })
      },
      onError: () => setServerError(t('common.error')),
    },
  })

  if (!token) {
    return <Navigate to="/entities/$entityId" params={{ entityId }} replace />
  }

  if (!entity) {
    return <p className="text-muted-foreground">{t('common.loading')}</p>
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex items-center gap-2.5">
        <EntityImage
          image={entity.image}
          type={entity.type}
          alt={getEntityDisplayName(entity)}
        />
        <div>
          <h1 className="text-lg font-semibold">
            {t('entity.form.edit_title')}
          </h1>
          <p className="text-xs text-muted-foreground">
            {getEntityDisplayName(entity)}
          </p>
        </div>
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <EntityForm
        entityType={entity.type}
        defaultValues={entity}
        isEdit
        onSubmit={(data) => {
          updateMutation.mutate({ entityId: decodedId, data })
        }}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  )
}
