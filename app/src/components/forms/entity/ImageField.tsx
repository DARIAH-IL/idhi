import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EntityImage } from '@/components/entity/EntityImage'
import { FieldRow } from '@/components/form-fields/FieldRow'
import { FieldError } from '@/components/form-fields/FieldError'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFormContext } from '@/components/forms/form-context'
import type { EntityType } from '@/lib/entity'

function fileToBase64(file: File): Promise<string> {
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
  const form = useFormContext()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>()

  return (
    <form.Field name={'image' as never}>
      {(field) => {
        const rawValue = field.state.value as unknown
        const image = typeof rawValue === 'string' ? rawValue : undefined

        return (
          <FieldRow label={t('entity.form.fields.image')}>
            <div className="flex items-center gap-3">
              <EntityImage
                image={image}
                type={entityType}
                alt={t('entity.form.image_preview')}
                size="lg"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  aria-label={t('entity.form.fields.image')}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    if (!file.type.startsWith('image/')) {
                      setError(t('entity.form.image_error'))
                      return
                    }
                    void fileToBase64(file)
                      .then((value) => {
                        field.handleChange(value as never)
                        setError(undefined)
                      })
                      .catch(() => setError(t('entity.form.image_error')))
                  }}
                />
                {image && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="self-start"
                    onPress={() => {
                      field.handleChange(undefined as never)
                      if (inputRef.current) inputRef.current.value = ''
                    }}
                  >
                    {t('entity.form.remove_image')}
                  </Button>
                )}
                <FieldError error={error} />
              </div>
            </div>
          </FieldRow>
        )
      }}
    </form.Field>
  )
}
