import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  getGetEntityByIdQueryOptions,
  useDeleteEntityById,
} from '@/api/hooks/entities/entities'
import { getEntityDisplayName, getEntityTypeLabel } from '@/lib/entity'
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
import { EntityReferenceCard } from '@/components/entity/EntityReferenceCard'
import { EntityImage } from '@/components/entity/EntityImage'
import { TimeAgo } from '@/components/TimeAgo'
import { useAuthStore } from '@/stores/auth'

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

  const renderValue = (v: unknown): React.ReactNode => {
    if (v === null || v === undefined)
      return <span className="text-muted-foreground">—</span>
    if (Array.isArray(v)) {
      if (v.length === 0)
        return <span className="text-muted-foreground">—</span>
      return (
        <div className="flex flex-col gap-0.5">
          {v.map((item, i) => (
            <div key={i}>{renderValue(item)}</div>
          ))}
        </div>
      )
    }
    if (typeof v === 'object') {
      return (
        <div className="flex flex-col gap-0.5 rounded border p-1.5 text-xs">
          {Object.entries(v)
            .filter(([, val]) => val !== null && val !== undefined)
            .map(([key, val]) => (
              <div key={key} className="flex gap-2">
                <span className="font-medium text-muted-foreground min-w-24">
                  {key}
                </span>
                <span className="min-w-0 flex-1">{renderValue(val)}</span>
              </div>
            ))}
        </div>
      )
    }
    if (typeof v === 'string' && /^idhi:[^:]+:.+$/.test(v)) {
      return <EntityReferenceCard entityId={v} />
    }
    return String(v)
  }

  const skipKeys = new Set(['type', 'id', 'image'])
  const entityFields = Object.entries(raw).filter(
    ([key, value]) => !skipKeys.has(key) && value !== null,
  )

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <EntityImage
              image={entity.image}
              type={entity.type}
              alt={getEntityDisplayName(entity)}
              size="lg"
            />
            <Badge variant="secondary">{getEntityTypeLabel(entity.type)}</Badge>
            <h1 className="text-lg font-semibold">
              {getEntityDisplayName(entity)}
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono">{decodedId}</p>
        </div>
        {isAuthenticated && (
          <div className="flex gap-2 shrink-0">
            <Link
              to="/entities/$entityId/edit"
              params={{ entityId }}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              {t('entity.detail.edit')}
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onPress={() => setDeleteOpen(true)}
            >
              {t('entity.detail.delete')}
            </Button>
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
            <div>
              <span className="text-muted-foreground">
                {t('entity.detail.created')}:{' '}
              </span>
              <TimeAgo date={audit.createdAt} />
              {audit.createdBy && (
                <>
                  {' '}
                  <span className="text-muted-foreground">
                    {t('entity.detail.by')}
                  </span>{' '}
                  <span className="font-mono">{audit.createdBy}</span>
                </>
              )}
            </div>
            <div>
              <span className="text-muted-foreground">
                {t('entity.detail.modified')}:{' '}
              </span>
              <TimeAgo date={audit.modifiedAt} />
              {audit.modifiedBy && (
                <>
                  {' '}
                  <span className="text-muted-foreground">
                    {t('entity.detail.by')}
                  </span>{' '}
                  <span className="font-mono">{audit.modifiedBy}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4">
          <dl className="grid gap-3">
            {entityFields.map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-[12rem_1fr] gap-2 text-xs"
              >
                <dt className="text-muted-foreground font-medium">
                  {key.replaceAll('_', ' ')}
                </dt>
                <dd>{renderValue(value)}</dd>
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
