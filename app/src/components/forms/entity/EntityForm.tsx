import { createFieldMap } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import type {
  AuditedEntity,
  Dataset,
  Entity,
  Event,
  Facility,
  Organization,
  Person,
  Project,
  Publication,
  Service,
  Tool,
  TrainingMaterial,
} from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { getEntityIdSegment } from '@/lib/entity'
import type { EntityType } from '@/lib/entity'
import { useAppForm, withFieldGroup } from '@/components/forms/app-form'
import {
  localizedValueValidators,
  stringArrayValidators,
  valueValidators,
} from '@/components/form-fields/validation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
import {
  datasetDefaults,
  datasetFormOptions,
  eventDefaults,
  eventFormOptions,
  facilityDefaults,
  facilityFormOptions,
  organizationDefaults,
  organizationFormOptions,
  personDefaults,
  personFormOptions,
  projectDefaults,
  projectFormOptions,
  publicationDefaults,
  publicationFormOptions,
  serviceDefaults,
  serviceFormOptions,
  toolDefaults,
  toolFormOptions,
  trainingMaterialDefaults,
  trainingMaterialFormOptions,
} from './entity-form-options'

interface Props {
  entityType: EntityType
  defaultValues?: AuditedEntity
  onSubmit: (data: Entity) => void
  isSubmitting?: boolean
  isEdit?: boolean
}

type CommonFields = Pick<
  Person,
  'description' | 'homepage' | 'id' | 'image' | 'same_as' | 'tags'
>

const commonDefaults: CommonFields = {
  description: undefined,
  homepage: undefined,
  id: '',
  image: undefined,
  same_as: undefined,
  tags: undefined,
}

const commonFieldMap = createFieldMap(commonDefaults)
const commonGroupProps: { entityType: EntityType; isEdit?: boolean } = {
  entityType: 'idhi:Person',
}

const CommonEntityFields = withFieldGroup({
  defaultValues: commonDefaults,
  props: commonGroupProps,
  render: function Render({ group, entityType, isEdit }) {
    const { t } = useTranslation()

    return (
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t('entity.form.sections.basic')}
        </p>
        <group.AppField
          name="id"
          validators={valueValidators({
            required: isEdit,
            kind: 'entityId',
            entityTypes: [entityType],
          })}
        >
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.id')}
              placeholder={
                isEdit
                  ? `idhi:${getEntityIdSegment(entityType)}:…`
                  : t('entity.form.generated_id')
              }
              readOnly
              required={isEdit}
              className="font-mono text-xs"
            />
          )}
        </group.AppField>
        <group.AppField
          name="homepage"
          validators={valueValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.homepage')}
              type="url"
              placeholder="https://…"
            />
          )}
        </group.AppField>
        <group.AppField name="image">
          {(field) => <field.ImageField entityType={entityType} />}
        </group.AppField>
        <group.AppField
          name="description"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={t('entity.form.fields.description')}
              multiline
            />
          )}
        </group.AppField>
        <group.AppField name="tags">
          {(field) => (
            <field.StringArrayField label={t('entity.form.fields.tags')} />
          )}
        </group.AppField>
        <group.AppField
          name="same_as"
          validators={stringArrayValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.StringArrayField
              label={t('entity.form.fields.same_as')}
              placeholder="https://…"
            />
          )}
        </group.AppField>
      </div>
    )
  },
})

interface ScaffoldProps {
  children: React.ReactNode
  isSubmitting?: boolean
  onSubmit: () => void
}

function FormScaffold({ children, isSubmitting, onSubmit }: ScaffoldProps) {
  const { t } = useTranslation()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      className="flex flex-col gap-4"
    >
      {children}
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
  )
}

function SpecificSection({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  return (
    <>
      <Separator />
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {t('entity.form.sections.specific')}
      </p>
      {children}
    </>
  )
}

interface TypedFormProps<TValues extends Entity> {
  defaultValues: TValues
  isEdit?: boolean
  isSubmitting?: boolean
  onSubmit: (data: Entity) => void
}

function PersonForm(props: TypedFormProps<Person>) {
  const form = useAppForm({
    ...personFormOptions,
    defaultValues: props.defaultValues,
    onSubmit: ({ value }) => props.onSubmit(cleanValue(value)),
  })
  return (
    <form.AppForm>
      <FormScaffold
        isSubmitting={props.isSubmitting}
        onSubmit={() => void form.handleSubmit()}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Person"
          isEdit={props.isEdit}
        />
        <SpecificSection>
          <PersonFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}

function OrganizationForm(props: TypedFormProps<Organization>) {
  const form = useAppForm({
    ...organizationFormOptions,
    defaultValues: props.defaultValues,
    onSubmit: ({ value }) => props.onSubmit(cleanValue(value)),
  })
  return (
    <form.AppForm>
      <FormScaffold
        isSubmitting={props.isSubmitting}
        onSubmit={() => void form.handleSubmit()}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Organization"
          isEdit={props.isEdit}
        />
        <SpecificSection>
          <OrganizationFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}

function FacilityForm(props: TypedFormProps<Facility>) {
  const form = useAppForm({
    ...facilityFormOptions,
    defaultValues: props.defaultValues,
    onSubmit: ({ value }) => props.onSubmit(cleanValue(value)),
  })
  return (
    <form.AppForm>
      <FormScaffold
        isSubmitting={props.isSubmitting}
        onSubmit={() => void form.handleSubmit()}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Facility"
          isEdit={props.isEdit}
        />
        <SpecificSection>
          <FacilityFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}

function ProjectForm(props: TypedFormProps<Project>) {
  const form = useAppForm({
    ...projectFormOptions,
    defaultValues: props.defaultValues,
    onSubmit: ({ value }) => props.onSubmit(cleanValue(value)),
  })
  return (
    <form.AppForm>
      <FormScaffold
        isSubmitting={props.isSubmitting}
        onSubmit={() => void form.handleSubmit()}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Project"
          isEdit={props.isEdit}
        />
        <SpecificSection>
          <ProjectFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}

function ToolForm(props: TypedFormProps<Tool>) {
  const form = useAppForm({
    ...toolFormOptions,
    defaultValues: props.defaultValues,
    onSubmit: ({ value }) => props.onSubmit(cleanValue(value)),
  })
  return (
    <form.AppForm>
      <FormScaffold
        isSubmitting={props.isSubmitting}
        onSubmit={() => void form.handleSubmit()}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Tool"
          isEdit={props.isEdit}
        />
        <SpecificSection>
          <ToolFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}

function ServiceForm(props: TypedFormProps<Service>) {
  const form = useAppForm({
    ...serviceFormOptions,
    defaultValues: props.defaultValues,
    onSubmit: ({ value }) => props.onSubmit(cleanValue(value)),
  })
  return (
    <form.AppForm>
      <FormScaffold
        isSubmitting={props.isSubmitting}
        onSubmit={() => void form.handleSubmit()}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Service"
          isEdit={props.isEdit}
        />
        <SpecificSection>
          <ServiceFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}

function PublicationForm(props: TypedFormProps<Publication>) {
  const form = useAppForm({
    ...publicationFormOptions,
    defaultValues: props.defaultValues,
    onSubmit: ({ value }) => props.onSubmit(cleanValue(value)),
  })
  return (
    <form.AppForm>
      <FormScaffold
        isSubmitting={props.isSubmitting}
        onSubmit={() => void form.handleSubmit()}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Publication"
          isEdit={props.isEdit}
        />
        <SpecificSection>
          <PublicationFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}

function EventForm(props: TypedFormProps<Event>) {
  const form = useAppForm({
    ...eventFormOptions,
    defaultValues: props.defaultValues,
    onSubmit: ({ value }) => props.onSubmit(cleanValue(value)),
  })
  return (
    <form.AppForm>
      <FormScaffold
        isSubmitting={props.isSubmitting}
        onSubmit={() => void form.handleSubmit()}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Event"
          isEdit={props.isEdit}
        />
        <SpecificSection>
          <EventFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}

function DatasetForm(props: TypedFormProps<Dataset>) {
  const form = useAppForm({
    ...datasetFormOptions,
    defaultValues: props.defaultValues,
    onSubmit: ({ value }) => props.onSubmit(cleanValue(value)),
  })
  return (
    <form.AppForm>
      <FormScaffold
        isSubmitting={props.isSubmitting}
        onSubmit={() => void form.handleSubmit()}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Dataset"
          isEdit={props.isEdit}
        />
        <SpecificSection>
          <DatasetFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}

function TrainingMaterialForm(props: TypedFormProps<TrainingMaterial>) {
  const form = useAppForm({
    ...trainingMaterialFormOptions,
    defaultValues: props.defaultValues,
    onSubmit: ({ value }) => props.onSubmit(cleanValue(value)),
  })
  return (
    <form.AppForm>
      <FormScaffold
        isSubmitting={props.isSubmitting}
        onSubmit={() => void form.handleSubmit()}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:TrainingMaterial"
          isEdit={props.isEdit}
        />
        <SpecificSection>
          <TrainingMaterialFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}

export function EntityForm({ entityType, defaultValues, ...props }: Props) {
  switch (entityType) {
    case 'idhi:Person': {
      if (defaultValues?.type !== entityType)
        return <PersonForm {...props} defaultValues={personDefaults} />
      const { audit: _audit, ...values } = defaultValues
      return <PersonForm {...props} defaultValues={values} />
    }
    case 'idhi:Organization': {
      if (defaultValues?.type !== entityType)
        return (
          <OrganizationForm {...props} defaultValues={organizationDefaults} />
        )
      const { audit: _audit, ...values } = defaultValues
      return <OrganizationForm {...props} defaultValues={values} />
    }
    case 'idhi:Facility': {
      if (defaultValues?.type !== entityType)
        return <FacilityForm {...props} defaultValues={facilityDefaults} />
      const { audit: _audit, ...values } = defaultValues
      return <FacilityForm {...props} defaultValues={values} />
    }
    case 'idhi:Project': {
      if (defaultValues?.type !== entityType)
        return <ProjectForm {...props} defaultValues={projectDefaults} />
      const { audit: _audit, ...values } = defaultValues
      return <ProjectForm {...props} defaultValues={values} />
    }
    case 'idhi:Tool': {
      if (defaultValues?.type !== entityType)
        return <ToolForm {...props} defaultValues={toolDefaults} />
      const { audit: _audit, ...values } = defaultValues
      return <ToolForm {...props} defaultValues={values} />
    }
    case 'idhi:Service': {
      if (defaultValues?.type !== entityType)
        return <ServiceForm {...props} defaultValues={serviceDefaults} />
      const { audit: _audit, ...values } = defaultValues
      return <ServiceForm {...props} defaultValues={values} />
    }
    case 'idhi:Publication': {
      if (defaultValues?.type !== entityType)
        return (
          <PublicationForm {...props} defaultValues={publicationDefaults} />
        )
      const { audit: _audit, ...values } = defaultValues
      return <PublicationForm {...props} defaultValues={values} />
    }
    case 'idhi:Event': {
      if (defaultValues?.type !== entityType)
        return <EventForm {...props} defaultValues={eventDefaults} />
      const { audit: _audit, ...values } = defaultValues
      return <EventForm {...props} defaultValues={values} />
    }
    case 'idhi:Dataset': {
      if (defaultValues?.type !== entityType)
        return <DatasetForm {...props} defaultValues={datasetDefaults} />
      const { audit: _audit, ...values } = defaultValues
      return <DatasetForm {...props} defaultValues={values} />
    }
    case 'idhi:TrainingMaterial': {
      if (defaultValues?.type !== entityType)
        return (
          <TrainingMaterialForm
            {...props}
            defaultValues={trainingMaterialDefaults}
          />
        )
      const { audit: _audit, ...values } = defaultValues
      return <TrainingMaterialForm {...props} defaultValues={values} />
    }
  }
}
