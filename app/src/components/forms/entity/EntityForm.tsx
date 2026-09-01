import type { AuditedEntity, Entity } from '@/api/models'
import type { EntityType } from '@/lib/entity'
import { DuplicateCheckProvider } from './duplicate-check'
import { DatasetForm } from './subforms/DatasetForm'
import { EventForm } from './subforms/EventForm'
import { FacilityForm } from './subforms/FacilityForm'
import { OrganizationForm } from './subforms/OrganizationForm'
import { PersonForm } from './subforms/PersonForm'
import { ProjectForm } from './subforms/ProjectForm'
import { PublicationForm } from './subforms/PublicationForm'
import { ServiceForm } from './subforms/ServiceForm'
import { ToolForm } from './subforms/ToolForm'
import { TrainingMaterialForm } from './subforms/TrainingMaterialForm'

interface Props {
  entityType: EntityType
  entity?: AuditedEntity
  title: React.ReactNode
  onSubmit: (data: Entity, isDraft: boolean) => void
  isSubmitting?: boolean
}

export function EntityForm({ entityType, entity, ...props }: Props) {
  return (
    <DuplicateCheckProvider
      entityType={entityType}
      enabled={entity === undefined}
    >
      {renderEntitySubform({ entityType, entity, ...props })}
    </DuplicateCheckProvider>
  )
}

function renderEntitySubform({ entityType, entity, ...props }: Props) {
  switch (entityType) {
    case 'idhi:Person': {
      if (entity?.type !== entityType) {
        return <PersonForm {...props} />
      }
      const { audit: _audit, ...person } = entity
      return <PersonForm {...props} person={person} />
    }
    case 'idhi:Organization': {
      if (entity?.type !== entityType) {
        return <OrganizationForm {...props} />
      }
      const { audit: _audit, ...organization } = entity
      return <OrganizationForm {...props} organization={organization} />
    }
    case 'idhi:Facility': {
      if (entity?.type !== entityType) {
        return <FacilityForm {...props} />
      }
      const { audit: _audit, ...facility } = entity
      return <FacilityForm {...props} facility={facility} />
    }
    case 'idhi:Project': {
      if (entity?.type !== entityType) {
        return <ProjectForm {...props} />
      }
      const { audit: _audit, ...project } = entity
      return <ProjectForm {...props} project={project} />
    }
    case 'idhi:Tool': {
      if (entity?.type !== entityType) {
        return <ToolForm {...props} />
      }
      const { audit: _audit, ...tool } = entity
      return <ToolForm {...props} tool={tool} />
    }
    case 'idhi:Service': {
      if (entity?.type !== entityType) {
        return <ServiceForm {...props} />
      }
      const { audit: _audit, ...service } = entity
      return <ServiceForm {...props} service={service} />
    }
    case 'idhi:Publication': {
      if (entity?.type !== entityType) {
        return <PublicationForm {...props} />
      }
      const { audit: _audit, ...publication } = entity
      return <PublicationForm {...props} publication={publication} />
    }
    case 'idhi:Event': {
      if (entity?.type !== entityType) {
        return <EventForm {...props} />
      }
      const { audit: _audit, ...event } = entity
      return <EventForm {...props} event={event} />
    }
    case 'idhi:Dataset': {
      if (entity?.type !== entityType) {
        return <DatasetForm {...props} />
      }
      const { audit: _audit, ...dataset } = entity
      return <DatasetForm {...props} dataset={dataset} />
    }
    case 'idhi:TrainingMaterial': {
      if (entity?.type !== entityType) {
        return <TrainingMaterialForm {...props} />
      }
      const { audit: _audit, ...trainingMaterial } = entity
      return (
        <TrainingMaterialForm {...props} trainingMaterial={trainingMaterial} />
      )
    }
  }
}
