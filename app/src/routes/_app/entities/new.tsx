import { useState } from 'react'
import {
  createFileRoute,
  Navigate,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'
import { useCreateEntity } from '@/api/hooks/entities/entities'
import {
  ENTITY_TYPES,
  getEntityClassName,
  getEntityTypeLabel,
  normalizeEntityType,
} from '@/lib/entity'
import { getEntityTermUri } from '@/api/termUris/termUri'
import type { EntityType } from '@/lib/entity'
import { EntityForm } from '@/components/forms/entity/EntityForm'
import { EntityTypeIcon } from '@/components/entity/EntityTypeIcon'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'

export const Route = createFileRoute('/_app/entities/new')({
  validateSearch: z.object({
    type: z.string().optional(),
  }),
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
  const { type } = Route.useSearch()
  const selectedType: EntityType | null = type
    ? (normalizeEntityType(type) ?? null)
    : null
  const setSelectedType = (et: EntityType | null) => {
    void navigate({
      to: '/entities/new',
      search: et ? { type: et } : {},
    })
  }
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
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold">
          {t('entity.form.select_type')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('entity.form.select_type_description')}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...ENTITY_TYPES]
            .sort((a, b) =>
              getEntityTypeLabel(a).localeCompare(getEntityTypeLabel(b)),
            )
            .map((et) => {
              const className = getEntityClassName(et)
              return (
                <Button
                  key={et}
                  variant="outline"
                  size="lg"
                  className="h-auto flex-col items-start gap-1.5 p-3 text-start whitespace-normal"
                  onPress={() => setSelectedType(et)}
                >
                  <span className="flex items-center gap-2">
                    <EntityTypeIcon type={et} />
                    <span className="flex flex-col">
                      <span className="font-semibold">
                        {t(`entity.fields.${className}.$self.label`)}
                      </span>
                      <span className="font-mono text-[0.625rem] text-muted-foreground/70">
                        {getEntityTermUri(et)}
                      </span>
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    {t(`entity.fields.${className}.$self.description`)}
                  </span>
                </Button>
              )
            })}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
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
        onSubmit={(data, isDraft) => {
          createMutation.mutate({ data, params: { isDraft } })
        }}
        isSubmitting={createMutation.isPending}
      />
    </div>
  )
}
