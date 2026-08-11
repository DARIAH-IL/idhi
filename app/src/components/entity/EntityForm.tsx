import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import type { Entity, AuditedEntity } from '@/api/models'
import type { EntityType } from '@/lib/entity'
import { formContext } from './form-type'
import type { EntityFormValues } from './form-type'
import { FieldRow } from './FieldRow'
import { TextField } from './TextField'
import { LangStringField } from './LangStringField'
import { StringArrayField } from './StringArrayField'
import { PersonFields } from './PersonFields'
import { OrganizationFields } from './OrganizationFields'
import { FacilityFields } from './FacilityFields'
import { ProjectFields } from './ProjectFields'
import { ToolFields } from './ToolFields'
import { ServiceFields } from './ServiceFields'
import { PublicationFields } from './PublicationFields'
import { EventFields } from './EventFields'
import { DatasetFields } from './DatasetFields'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface Props {
  entityType: EntityType
  defaultValues?: Partial<AuditedEntity>
  onSubmit: (data: Entity) => void
  isSubmitting?: boolean
  isEdit?: boolean
}

export function EntityForm({
  entityType,
  defaultValues,
  onSubmit,
  isSubmitting,
  isEdit,
}: Props) {
  const { t } = useTranslation()
  const initialValues: EntityFormValues = { type: entityType }

  if (defaultValues) {
    Object.assign(initialValues, defaultValues)
  }

  const form = useForm({
    defaultValues: initialValues,
    onSubmit: ({ value }) => {
      const cleaned = Object.fromEntries(
        Object.entries(value).filter(([, v]) => {
          if (v === '' || v === null || v === undefined) return false
          if (Array.isArray(v) && v.length === 0) return false
          return true
        }),
      )
      onSubmit(cleaned as unknown as Entity)
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

          <form.Field name="id">
            {(field) => (
              <FieldRow label={t('entity.form.fields.id')}>
                <Input
                  value={
                    typeof field.state.value === 'string'
                      ? field.state.value
                      : ''
                  }
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={`idhi:${entityType.slice('idhi:'.length).toLowerCase()}:…`}
                  readOnly={isEdit}
                  required
                  className="font-mono text-xs"
                />
              </FieldRow>
            )}
          </form.Field>

          <TextField
            name="homepage"
            label={t('entity.form.fields.homepage')}
            type="url"
            placeholder="https://…"
          />
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
