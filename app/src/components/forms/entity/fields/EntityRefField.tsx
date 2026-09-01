import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { EntityType } from '#/lib/entity.ts'
import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { Label } from '#/components/ui/label.tsx'
import { EntityPicker } from '#/components/entity/EntityPicker.tsx'
import { EntityReferenceCard } from '#/components/entity/EntityReferenceCard.tsx'
import { DragHandle } from '#/components/form-fields/DragHandle.tsx'
import { FieldError } from '#/components/form-fields/FieldError.tsx'
import { useFieldRowClass } from '#/components/form-fields/FieldNesting.tsx'
import { focusAfterRemove } from '#/components/form-fields/removeFocus.ts'
import { useReorderableList } from '#/components/form-fields/useReorderableList.ts'
import { firstError } from '#/components/form-fields/validation.ts'
import { useFieldContext } from '#/components/forms/form-context.ts'
import { cn } from '#/lib/utils.ts'

interface EntityRefProps {
  label: React.ReactNode
  entityTypes: EntityType[]
  allowExternalUrl?: boolean
  required?: boolean
}

export function EntityRefField({
  label,
  entityTypes,
  allowExternalUrl = false,
  required = false,
}: EntityRefProps) {
  const { t } = useTranslation()
  const field = useFieldContext<string | null | undefined>()
  const value = field.state.value ?? ''
  const error = firstError(field.state.meta.errors)
  const rowClass = useFieldRowClass()

  return (
    <div className={cn('flex flex-col gap-1', rowClass)}>
      <Label>
        {label}
        {required && (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        )}
      </Label>
      <EntityPicker
        value={value.startsWith('idhi:') ? value : undefined}
        onChange={field.handleChange}
        entityTypes={entityTypes}
        invalid={Boolean(error)}
        required={required}
      />
      {allowExternalUrl && (
        <Input
          type="url"
          dir="ltr"
          value={value.startsWith('http') ? value : ''}
          placeholder={t('entity.form.external_url_placeholder')}
          onChange={(event) => field.handleChange(event.target.value)}
          aria-invalid={Boolean(error)}
        />
      )}
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          onPress={() => field.handleChange('')}
        >
          {t('entity.form.clear_selection')}
        </Button>
      )}
      <FieldError error={error} />
    </div>
  )
}

interface EntityRefArrayProps {
  label: React.ReactNode
  entityTypes: EntityType[]
}

export function EntityRefArrayField({
  label,
  entityTypes,
}: EntityRefArrayProps) {
  const { t } = useTranslation()
  const field = useFieldContext<string[] | null | undefined>()
  const values = field.state.value ?? []
  const { getHandleProps, getRowProps } = useReorderableList(
    values.length,
    field.moveValue,
  )
  const rowClass = useFieldRowClass()
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} data-remove-scope="" className={cn('flex flex-col gap-2', rowClass)}>
      <Label>{label}</Label>
      <FieldError error={firstError(field.state.meta.errors)} />
      {values.map((id, index) => (
        <div
          key={id}
          className="flex items-start gap-2"
          {...getRowProps(index)}
        >
          <DragHandle {...getHandleProps(index)} className="mt-1.5" />
          <div className="min-w-0 flex-1">
            <EntityReferenceCard entityId={id} />
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            data-remove-button
            onPress={() => {
              void Promise.resolve(field.removeValue(index)).then(() =>
                focusAfterRemove(containerRef.current, index),
              )
            }}
            aria-label={`${t('entity.form.remove_entity')} (${index + 1})`}
          >
            ×
          </Button>
        </div>
      ))}
      <EntityPicker
        onChange={(id) => {
          if (!values.includes(id)) {
            field.pushValue(id)
          }
        }}
        entityTypes={entityTypes}
      />
    </div>
  )
}
