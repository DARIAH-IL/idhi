import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  getGetEntityByIdQueryOptions,
  useDeleteEntityById,
} from '@/api/hooks/entities/entities'
import {
  getEntityClassName,
  getEntityDisplayName,
  getEntityFieldOrder,
  getEntityTypeLabel,
} from '@/lib/entity'
import { getFieldRefClass, getFieldTermUri } from '@/api/termUris/termUri'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Delete02Icon, Edit02Icon } from '@hugeicons/core-free-icons'
import { EntityImage } from '@/components/entity/EntityImage'
import { EntityFieldLabel } from '@/components/entity/EntityFieldLabel'
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip'
import { TimeAgo } from '@/components/TimeAgo'
import { useAuthStore } from '@/stores/auth'
import { renderEntityValue } from '../../../../components/renderEntityValue.tsx'

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
  const { entityId } = Route.useParams()
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const decodedId = decodeURIComponent(entityId)

  const { data: entity } = useQuery(getGetEntityByIdQueryOptions(decodedId))

  const deleteMutation = useDeleteEntityById({
    mutation: {
      onSuccess: () => {
        toast.success(t('entity.notifications.deleted'))
        void navigate({ to: '/entities' })
      },
    },
  })

  if (!entity) {
    return <p className="text-muted-foreground">{t('common.loading')}</p>
  }

  const { audit, ...raw } = entity

  const entityClass = getEntityClassName(entity.type)
  const skipKeys = new Set(['type', 'id', 'image', 'tags'])
  const fieldOrder = getEntityFieldOrder(entity.type)
  const orderOf = (key: string) => fieldOrder[key] ?? Number.MAX_SAFE_INTEGER
  const values: Record<string, unknown> = raw
  const entityFields = [
    ...new Set([...Object.keys(fieldOrder), ...Object.keys(raw)]),
  ]
    .filter((key) => !skipKeys.has(key))
    .sort((a, b) => orderOf(a) - orderOf(b))

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <EntityImage
          image={entity.image}
          type={entity.type}
          alt={getEntityDisplayName(entity)}
          size="lg"
        />
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold">
            {getEntityDisplayName(entity)}
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>{getEntityTypeLabel(entity.type)}</span>
            <span aria-hidden>·</span>
            <span className="font-mono">{decodedId}</span>
            {entity.tags && entity.tags.length > 0 && (
              <>
                <span aria-hidden>·</span>
                {entity.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </>
            )}
          </div>
        </div>
        {isAuthenticated && (
          <div className="ms-auto flex gap-2 shrink-0">
            <TooltipTrigger>
              <Link
                to="/entities/$entityId/edit"
                params={{ entityId }}
                aria-label={t('entity.detail.edit')}
                className={buttonVariants({
                  variant: 'secondary',
                  size: 'icon',
                })}
              >
                <HugeiconsIcon icon={Edit02Icon} />
              </Link>
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

      <Separator />

      {isAuthenticated && audit && (
        <Card size="sm">
          <CardHeader>
            <CardTitle>{t('entity.detail.audit')}</CardTitle>
          </CardHeader>
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
                  <span className="font-mono">{audit.createdBy}</span>
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
                  <span className="font-mono">{audit.modifiedBy}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4">
          <dl className="grid gap-3">
            {entityFields.map((key) => (
              <div
                key={key}
                className="grid grid-cols-[12rem_1fr] gap-2 text-xs"
              >
                <dt className="text-muted-foreground font-medium">
                  <EntityFieldLabel entityClass={entityClass} field={key} />
                </dt>
                <dd>
                  {renderEntityValue(
                    values[key],
                    getFieldRefClass(entityClass, key),
                    key,
                    getFieldTermUri(entityClass, key),
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

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
