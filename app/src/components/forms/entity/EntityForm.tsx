import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import type { Entity, AuditedEntity } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { getEntityIdSegment } from '@/lib/entity'
import type { EntityType } from '@/lib/entity'
import { formContext } from '@/components/forms/form-context'
import { FieldRow } from '@/components/form-fields/FieldRow'
import { TextField } from '@/components/form-fields/TextField'
import { LangStringField } from '@/components/form-fields/LangStringField'
import { StringArrayField } from '@/components/form-fields/StringArrayField'
import { PersonFields } from './PersonFields'
import { OrganizationFields } from './OrganizationFields'
import { FacilityFields } from './FacilityFields'
import { ProjectFields } from './ProjectFields'
import { ToolFields } from './ToolFields'
import { ServiceFields } from './ServiceFields'
import { PublicationFields } from './PublicationFields'
import { EventFields } from './EventFields'
import { DatasetFields } from './DatasetFields'
import { TrainingMaterialFields } from './TrainingMaterialFields'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FieldError } from '@/components/form-fields/FieldError'
import { firstError, validateValue } from '@/components/form-fields/validation'
import { ImageField } from './ImageField'

interface Props {
  entityType: EntityType
  defaultValues?: Partial<AuditedEntity>
  onSubmit: (data: Entity) => void
  isSubmitting?: boolean
  isEdit?: boolean
}

type EntityFormValues = {
  type: EntityType
  id?: string
} & Entity

export function EntityForm({
  entityType,
  defaultValues,
  onSubmit,
  isSubmitting,
  isEdit,
}: Props) {
  const { t } = useTranslation()
  // A new entity is intentionally incomplete until form validation succeeds.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const initialValues: EntityFormValues = { type: entityType } as Entity

  if (defaultValues) {
    Object.assign(initialValues, defaultValues)
  }

  const form = useForm({
    defaultValues: initialValues,
    onSubmit: ({ value }) => {
      const cleaned = cleanValue(value)
      onSubmit(cleaned)
    },
  })

  return (
    <formContext.Provider value={form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t('entity.form.sections.basic')}
          </p>

          <form.Field
            name="id"
            validators={{
              onBlur: ({ value }) =>
                validateValue(value, {
                  required: true,
                  kind: 'entityId',
                  entityTypes: [entityType],
                }),
              onSubmit: ({ value }) =>
                validateValue(value, {
                  required: true,
                  kind: 'entityId',
                  entityTypes: [entityType],
                }),
            }}
          >
            {(field) => (
              <FieldRow label={t('entity.form.fields.id')}>
                <Input
                  value={
                    typeof field.state.value === 'string'
                      ? field.state.value
                      : ''
                  }
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={`idhi:${getEntityIdSegment(entityType)}:…`}
                  readOnly={isEdit}
                  required
                  onBlur={field.handleBlur}
                  aria-invalid={Boolean(firstError(field.state.meta.errors))}
                  className="font-mono text-xs"
                />
                <FieldError error={firstError(field.state.meta.errors)} />
              </FieldRow>
            )}
          </form.Field>

          <TextField
            name="homepage"
            label={t('entity.form.fields.homepage')}
            type="url"
            placeholder="https://…"
          />
          <ImageField entityType={entityType} />
          <LangStringField
            name="description"
            label={t('entity.form.fields.description')}
            multiline
          />
          <StringArrayField name="tags" label={t('entity.form.fields.tags')} />
          <StringArrayField
            name="same_as"
            label={t('entity.form.fields.same_as')}
            placeholder="https://…"
            validationKind="url"
          />
        </div>

        <Separator />

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t('entity.form.sections.specific')}
        </p>

        {entityType === 'idhi:Person' && <PersonFields />}
        {entityType === 'idhi:Organization' && <OrganizationFields />}
        {entityType === 'idhi:Facility' && <FacilityFields />}
        {entityType === 'idhi:Project' && <ProjectFields />}
        {entityType === 'idhi:Tool' && <ToolFields />}
        {entityType === 'idhi:Service' && <ServiceFields />}
        {entityType === 'idhi:Publication' && <PublicationFields />}
        {entityType === 'idhi:Event' && <EventFields />}
        {entityType === 'idhi:Dataset' && <DatasetFields />}
        {entityType === 'idhi:TrainingMaterial' && <TrainingMaterialFields />}

        <Separator />

        <div className="flex gap-2">
          <Button type="submit" isDisabled={isSubmitting}>
            {isSubmitting ? t('common.loading') : t('common.save')}
          </Button>
          <Button variant="outline" onPress={() => window.history.back()}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </formContext.Provider>
  )
}
