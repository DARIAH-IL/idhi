import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { SparklesIcon, Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { Entity, SuggestibleEntityField } from '@/api/models'
import { suggestEntityFieldValues } from '@/api/hooks/entities/entities'
import { useEntitySuggestionSource } from '#/components/forms/entity/suggestions-provider'
import { Button } from '@/components/ui/button'
import { Popover } from '@/components/ui/popover'
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip'
import { getApiErrorMessage } from '@/lib/api-error'
import { hasSuggestionContext } from '@/lib/suggestion-payload'
import { cn } from '@/lib/utils'

interface Props {
  field: SuggestibleEntityField
  allowedValues?: Record<string, string>
  onSuggested: (values: string[]) => void
}

export function SuggestValuesButton({
  field,
  allowedValues,
  onSuggested,
}: Props) {
  const { t } = useTranslation()
  const source = useEntitySuggestionSource()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [hintOpen, setHintOpen] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: (entity: Entity) => suggestEntityFieldValues(entity, { field }),
    onSuccess: (values) => {
      onSuggested(
        allowedValues
          ? values.filter((value) => Object.hasOwn(allowedValues, value))
          : values,
      )
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  if (!source) {
    return null
  }

  const handlePress = () => {
    const entity = source.getEntity()

    if (!hasSuggestionContext(entity)) {
      setHintOpen(true)
      return
    }

    mutate(entity)
  }

  return (
    <>
      <TooltipTrigger>
        <Button
          ref={triggerRef}
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label={t('entity.form.suggest_values')}
          isDisabled={isPending}
          onPress={handlePress}
        >
          <HugeiconsIcon
            icon={isPending ? Loading03Icon : SparklesIcon}
            strokeWidth={1}
            className={cn(
              isPending && 'animate-spin motion-reduce:animate-none',
            )}
            aria-hidden="true"
          />
        </Button>
        <Tooltip>{t('entity.form.suggest_values')}</Tooltip>
      </TooltipTrigger>
      <Popover
        triggerRef={triggerRef}
        isOpen={hintOpen}
        onOpenChange={setHintOpen}
        aria-label={t('entity.form.suggest_values')}
      >
        <p>{t('entity.form.suggest_values_missing_context')}</p>
      </Popover>
      <span role="status" className="sr-only">
        {isPending ? t('common.loading') : ''}
      </span>
    </>
  )
}
