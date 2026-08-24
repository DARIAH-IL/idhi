import { useTranslation } from 'react-i18next'
import type { EntityType } from '@/lib/entity'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EntityPicker } from '@/components/entity/EntityPicker'
import { EntityReferenceCard } from '@/components/entity/EntityReferenceCard'
import { FieldError } from '@/components/form-fields/FieldError'
import { firstError } from '@/components/form-fields/validation'
import { useFieldContext } from '@/components/forms/form-context'

interface EntityRefProps {
  label: string
  entityTypes: EntityType[]
  allowExternalUrl?: boolean
}

export function EntityRefField({
  label,
  entityTypes,
  allowExternalUrl = false,
}: EntityRefProps) {
  const { t } = useTranslation()
  const field = useFieldContext<string | null | undefined>()
  const value = field.state.value ?? ''
  const error = firstError(field.state.meta.errors)

  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <EntityPicker
        value={value.startsWith('idhi:') ? value : undefined}
        onChange={field.handleChange}
        entityTypes={entityTypes}
        invalid={Boolean(error)}
      />
      {allowExternalUrl && (
        <Input
          type="url"
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
  label: string
  entityTypes: EntityType[]
}

export function EntityRefArrayField({
  label,
  entityTypes,
}: EntityRefArrayProps) {
  const { t } = useTranslation()
  const field = useFieldContext<string[] | null | undefined>()
  const values = field.state.value ?? []

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <FieldError error={firstError(field.state.meta.errors)} />
      {values.map((id, index) => (
        <div key={id} className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <EntityReferenceCard entityId={id} />
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onPress={() => field.removeValue(index)}
            aria-label={t('entity.form.remove_entity')}
          >
            ×
          </Button>
        </div>
      ))}
      <EntityPicker
        onChange={(id) => {
          if (!values.includes(id)) field.pushValue(id)
        }}
        entityTypes={entityTypes}
      />
    </div>
  )
}
