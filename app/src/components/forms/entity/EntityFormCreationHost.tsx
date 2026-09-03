import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { useCreateEntity } from '@/api/hooks/entities/entities'
import { cacheSavedEntity } from '@/api/entityCacheOps'
import { EntityTypeIcon } from '@/components/entity/EntityTypeIcon'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@/components/ui/drawer'
import { getEntityClassName, getEntityTypeLabel } from '@/lib/entity'
import type { EntityType } from '@/lib/entity'
import { isRtlLanguage } from '@/i18n'
import { useUIStore } from '@/stores/ui'
import { AllowEntityDraftContext } from '@/hooks/useAllowEntityDraft'
import { OnTheFlyEntityCreationContext } from '@/hooks/useOnTheFlyEntityCreation'
import type { OnTheFlyEntityCreationRequest } from '@/hooks/useOnTheFlyEntityCreation'
import { EntityForm } from './EntityForm'
import type { EntityFormProps } from './EntityForm'

export function EntityFormCreationHost(props: EntityFormProps) {
  const { t } = useTranslation()
  const language = useUIStore((state) => state.language)
  const queryClient = useQueryClient()
  const [request, setRequest] = useState<OnTheFlyEntityCreationRequest | null>(
    null,
  )
  const [selectedType, setSelectedType] = useState<EntityType | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const close = () => {
    setRequest(null)
    setSelectedType(null)
    setServerError(null)
  }

  const createMutation = useCreateEntity({
    mutation: {
      onSuccess: (entity) => {
        void cacheSavedEntity(queryClient, entity)
        request?.onCreated(entity.id)
        toast.success(t('entity.notifications.created'))
        close()
      },
      onError: () => setServerError(t('common.error')),
    },
  })

  const open = (nextRequest: OnTheFlyEntityCreationRequest) => {
    createMutation.reset()
    setRequest(nextRequest)
    setSelectedType(
      nextRequest.entityTypes.length === 1
        ? (nextRequest.entityTypes[0] ?? null)
        : null,
    )
    setServerError(null)
  }

  return (
    <OnTheFlyEntityCreationContext.Provider value={{ open }}>
      <EntityForm {...props} />
      <Drawer
        open={request !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            close()
          }
        }}
        swipeDirection={isRtlLanguage(language) ? 'left' : 'right'}
      >
        <DrawerContent className="m-0 rounded-none [--drawer-content-width:min(90vw,80rem)]">
          <DrawerTitle className="sr-only">
            {selectedType
              ? t('entity.form.new_title', {
                  type: getEntityTypeLabel(selectedType),
                })
              : t('entity.form.select_type')}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            {t('entity.form.create_related_description')}
          </DrawerDescription>
          <DrawerClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-2 end-2 z-20"
                aria-label={t('common.close')}
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </Button>
            }
          />
          <div className="min-h-0 flex-1 overflow-y-auto p-6 pt-10">
            {serverError && (
              <p role="alert" className="mb-4 text-sm text-destructive">
                {serverError}
              </p>
            )}
            {!selectedType && request ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">
                  {t('entity.form.select_type')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('entity.form.select_related_type_description')}
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[...request.entityTypes]
                    .sort((a, b) =>
                      getEntityTypeLabel(a).localeCompare(
                        getEntityTypeLabel(b),
                      ),
                    )
                    .map((entityType) => {
                      const className = getEntityClassName(entityType)
                      return (
                        <Button
                          key={entityType}
                          variant="outline"
                          size="lg"
                          className="h-auto justify-start gap-2 p-3 text-start whitespace-normal"
                          onPress={() => setSelectedType(entityType)}
                        >
                          <EntityTypeIcon type={entityType} />
                          <span className="font-semibold">
                            {t(`entity.fields.${className}.$self.label`)}
                          </span>
                        </Button>
                      )
                    })}
                </div>
              </div>
            ) : selectedType ? (
              <OnTheFlyEntityCreationContext.Provider value={undefined}>
                <AllowEntityDraftContext.Provider value={false}>
                  <EntityForm
                    entityType={selectedType}
                    title={
                      <div className="flex items-center gap-2.5">
                        <EntityTypeIcon type={selectedType} />
                        <h2 className="text-lg font-semibold">
                          {t('entity.form.new_title', {
                            type: getEntityTypeLabel(selectedType),
                          })}
                        </h2>
                      </div>
                    }
                    onSubmit={(data) =>
                      createMutation.mutateAsync({
                        data,
                      })
                    }
                    onCancel={close}
                    isSubmitting={createMutation.isPending}
                  />
                </AllowEntityDraftContext.Provider>
              </OnTheFlyEntityCreationContext.Provider>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>
    </OnTheFlyEntityCreationContext.Provider>
  )
}
