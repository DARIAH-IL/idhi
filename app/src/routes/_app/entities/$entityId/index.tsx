import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Focusable } from 'react-aria-components'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  getGetEntityByIdQueryOptions,
  useDeleteEntityById,
} from '@/api/hooks/entities/entities'
import {
  getEntityClassName,
  getEntityDisplayName,
  getEntityDisplayNameLanguage,
  getEntityFieldOrder,
  getEntityTypeLabel,
  isNonDisplayField,
} from '@/lib/entity'
import { getFieldRefClass, getFieldTermUri } from '@/api/termUris/termUri'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Delete02Icon,
  Edit02Icon,
} from '@hugeicons/core-free-icons'
import { DraftBadge } from '@/components/entity/DraftBadge'
import { EntityImage } from '@/components/entity/EntityImage'
import { EntityNameIdentifiers } from '@/components/entity/EntityNameIdentifiers'
import { EntityFieldLabel } from '@/components/entity/EntityFieldLabel'
import { EntityTags } from '@/components/entity/EntityTags'
import { EntityReferencesProvider } from '@/components/entity/EntityReferencesProvider'
import { IncomingEntityRelationships } from '@/components/entity/IncomingEntityRelationships'
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip'
import { TimeAgo } from '@/components/TimeAgo'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import {
  isEntityRefValue,
  renderEntityValue,
} from '../../../../components/renderEntityValue.tsx'
import { collectEntityReferenceIds } from '#/lib/entityReferences.ts'
import { langStringDir } from '#/components/LangStringValue.tsx'
import { removeDeletedEntityFromCache } from '#/api/entityCacheOps.ts'

export const Route = createFileRoute('/_app/entities/$entityId/')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      getGetEntityByIdQueryOptions(decodeURIComponent(params.entityId)),
    ),
  component: EntityDetailPage,
})

function EntityDetailPage() {
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore((state) => Boolean(state.token))
  const auditCollapsed = useUIStore((state) => state.auditCollapsed)
  const setAuditCollapsed = useUIStore((state) => state.setAuditCollapsed)
  const { entityId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const decodedId = decodeURIComponent(entityId)

  const { data: entity } = useQuery(getGetEntityByIdQueryOptions(decodedId))

  const deleteMutation = useDeleteEntityById({
    mutation: {
      onSuccess: () => {
        void removeDeletedEntityFromCache(queryClient, decodedId)
        toast.success(t('entity.notifications.deleted'))
        void navigate({ to: '/entities' })
      },
    },
  })

  if (!entity) {
    return (
      <p role="status" className="text-muted-foreground">
        {t('common.loading')}
      </p>
    )
  }

  const { audit, ...raw } = entity

  const displayNameLanguage = getEntityDisplayNameLanguage(entity)
  const entityClass = getEntityClassName(entity.type)
  const fieldOrder = getEntityFieldOrder(entity.type)
  const orderOf = (key: string) => fieldOrder[key] ?? Number.MAX_SAFE_INTEGER
  const values: Record<string, unknown> = raw
  const entityFields = [
    ...new Set([...Object.keys(fieldOrder), ...Object.keys(raw)]),
  ]
    .filter((key) => !isNonDisplayField(key))
    .sort((a, b) => orderOf(a) - orderOf(b))
  const referencedEntityIds = collectEntityReferenceIds(
    entityFields.map((key) => values[key]),
  )

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <div className="sticky top-0 z-10 -mx-6 bg-background before:absolute before:inset-x-0 before:bottom-full before:h-6 before:bg-background before:content-['']">
        <div className="flex items-center gap-3 px-6">
          <EntityImage
            image={entity.image}
            type={entity.type}
            alt={getEntityDisplayName(entity)}
            size="lg"
            entityId={entity.id}
          />
          <div className="flex flex-col gap-0.5">
            <EntityNameIdentifiers entity={entity}>
              <span className="flex items-center gap-2">
                <h1
                  lang={displayNameLanguage}
                  dir={langStringDir(displayNameLanguage)}
                  className="text-lg font-semibold"
                >
                  {getEntityDisplayName(entity)}
                </h1>
                <DraftBadge isDraft={entity.isDraft} />
              </span>
            </EntityNameIdentifiers>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>{getEntityTypeLabel(entity.type)}</span>
              <span aria-hidden>·</span>
              <span dir="ltr" className="font-mono">
                {decodedId}
              </span>
              <EntityTags tags={entity.tags} />
            </div>
          </div>
          {isAuthenticated && (
            <div className="ms-auto flex shrink-0 gap-2">
              <TooltipTrigger>
                <Focusable>
                  <Link
                    to="/entities/$entityId/edit"
                    params={{ entityId }}
                    aria-label={t('entity.detail.edit')}
                    className={buttonVariants({
                      variant: 'secondary',
                      size: 'icon',
                    })}
                  >
                    <HugeiconsIcon icon={Edit02Icon} aria-hidden="true" />
                  </Link>
                </Focusable>
                <Tooltip>{t('entity.detail.edit')}</Tooltip>
              </TooltipTrigger>
              <TooltipTrigger>
                <Button
                  variant="destructive"
                  size="icon"
                  aria-label={t('entity.detail.delete')}
                  onPress={() => setDeleteOpen(true)}
                >
                  <HugeiconsIcon icon={Delete02Icon} />
                </Button>
                <Tooltip>{t('entity.detail.delete')}</Tooltip>
              </TooltipTrigger>
            </div>
          )}
        </div>
        <div className="px-6 pt-4">
          <Separator />
        </div>
      </div>

      {isAuthenticated && audit && (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="-ms-2 gap-1.5"
                aria-expanded={!auditCollapsed}
                onPress={() => setAuditCollapsed(!auditCollapsed)}
              >
                {t('entity.detail.audit')}
                <HugeiconsIcon
                  icon={auditCollapsed ? ArrowDown01Icon : ArrowUp01Icon}
                  className="text-muted-foreground"
                />
              </Button>
            </CardTitle>
          </CardHeader>
          {!auditCollapsed && (
            <CardContent className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col gap-1">
                <div>
                  <span className="text-muted-foreground">
                    {t('entity.detail.created')}:{' '}
                  </span>
                  <TimeAgo date={audit.createdAt} />
                </div>
                {audit.createdBy && (
                  <div>
                    <span className="text-muted-foreground">
                      {t('entity.detail.by')}
                    </span>{' '}
                    <span dir="ltr" className="font-mono">
                      {audit.createdBy}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div>
                  <span className="text-muted-foreground">
                    {t('entity.detail.modified')}:{' '}
                  </span>
                  <TimeAgo date={audit.modifiedAt} />
                </div>
                {audit.modifiedBy && (
                  <div>
                    {' '}
                    <span className="text-muted-foreground">
                      {t('entity.detail.by')}
                    </span>{' '}
                    <span dir="ltr" className="font-mono">
                      {audit.modifiedBy}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      <EntityReferencesProvider entityIds={referencedEntityIds}>
        <Card>
          <CardContent>
            <dl className="columns-1 gap-1 lg:columns-2 lg:gap-8 lg:[column-rule:1px_solid_var(--border)]">
              {entityFields.map((key) => {
                const refValue = isEntityRefValue(values[key])
                return (
                  <div
                    key={key}
                    className={
                      refValue
                        ? 'mb-2 flex break-inside-avoid flex-col gap-1 rounded p-1 text-xs hover:bg-accent'
                        : 'mb-2 grid break-inside-avoid grid-cols-[8rem_minmax(0,1fr)] gap-1 rounded p-1 text-xs hover:bg-accent'
                    }
                  >
                    <dt className="text-muted-foreground font-medium">
                      <EntityFieldLabel entityClass={entityClass} field={key} />
                    </dt>
                    <dd className={refValue ? 'ms-4 py-2' : undefined}>
                      {renderEntityValue(
                        values[key],
                        getFieldRefClass(entityClass, key),
                        key,
                        getFieldTermUri(entityClass, key),
                      )}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </CardContent>
        </Card>

        <IncomingEntityRelationships
          key={decodedId}
          entityId={decodedId}
          entityType={entity.type}
        />
      </EntityReferencesProvider>

      {isAuthenticated && (
        <Dialog isOpen={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogHeader>
            <DialogTitle>{t('common.delete_confirm_title')}</DialogTitle>
            <DialogDescription>{t('common.confirm_delete')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onPress={() => setDeleteOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              isDisabled={deleteMutation.isPending}
              onPress={() => deleteMutation.mutate({ entityId: decodedId })}
            >
              {deleteMutation.isPending
                ? t('common.loading')
                : t('common.delete')}
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  )
}
