import { useId, useRef, useState } from 'react'
import { ClipboardPasteIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { EntityImage } from '#/components/entity/EntityImage.tsx'
import { EntityFieldLabel } from '#/components/entity/EntityFieldLabel.tsx'
import { FieldRow } from '#/components/form-fields/FieldRow.tsx'
import { FieldError } from '#/components/form-fields/FieldError.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { Tooltip, TooltipTrigger } from '#/components/ui/tooltip.tsx'
import { useFieldContext } from '#/components/forms/form-context.ts'
import { usePasteImage } from '#/hooks/usePasteImage.ts'
import { getEntityClassName, getEntityFieldLabelText } from '#/lib/entity.ts'
import type { EntityType } from '#/lib/entity.ts'

const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024

function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Expected the image reader to return a data URL'))
        return
      }
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.readAsDataURL(file)
  })
}

export function ImageField({ entityType }: { entityType: EntityType }) {
  const { t } = useTranslation()
  const field = useFieldContext<string | null | undefined>()
  const inputRef = useRef<HTMLInputElement>(null)
  const errorId = useId()
  const [error, setError] = useState<string>()
  const image = field.state.value ?? undefined
  const pasteImage = usePasteImage({
    maxSizeBytes: MAX_IMAGE_SIZE_BYTES,
    onPaste: async (pastedImage) => {
      const value = await fileToBase64(pastedImage)
      field.handleChange(value)
      setError(undefined)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
  })

  return (
    <FieldRow
      label={
        <EntityFieldLabel
          entityClass={getEntityClassName(entityType)}
          field="image"
        />
      }
    >
      <div className="flex items-center gap-3">
        <EntityImage
          image={image}
          type={entityType}
          alt={t('entity.form.image_preview')}
          size="lg"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              type="file"
              accept="image/*"
              aria-label={getEntityFieldLabelText(
                getEntityClassName(entityType),
                'image',
              )}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) {
                  return
                }
                if (!file.type.startsWith('image/')) {
                  setError(t('entity.form.image_error'))
                  return
                }
                if (file.size > MAX_IMAGE_SIZE_BYTES) {
                  setError(
                    t('entity.form.image_size_error', {
                      maxSizeMb: MAX_IMAGE_SIZE_BYTES / (1024 * 1024),
                    }),
                  )
                  return
                }
                void fileToBase64(file)
                  .then((value) => {
                    field.handleChange(value)
                    setError(undefined)
                  })
                  .catch(() => setError(t('entity.form.image_error')))
              }}
            />
            <TooltipTrigger>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                aria-label={t('entity.form.paste_image')}
                onPress={() => void pasteImage()}
              >
                <HugeiconsIcon
                  icon={ClipboardPasteIcon}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </Button>
              <Tooltip>{t('entity.form.paste_image')}</Tooltip>
            </TooltipTrigger>
          </div>
          {image && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onPress={() => {
                field.handleChange(undefined)
                if (inputRef.current) {
                  inputRef.current.value = ''
                  inputRef.current.focus()
                }
              }}
            >
              {t('entity.form.remove_image')}
            </Button>
          )}
          <span role="status" className="sr-only">
            {image && !error ? t('entity.form.image_uploaded') : ''}
          </span>
          <FieldError id={errorId} error={error} />
        </div>
      </div>
    </FieldRow>
  )
}
