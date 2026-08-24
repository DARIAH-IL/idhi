import { formOptions } from '@tanstack/react-form'
import type {
  Dataset,
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

export const personDefaults: Person = { id: '', type: 'idhi:Person' }
export const organizationDefaults: Organization = {
  id: '',
  name: [],
  type: 'idhi:Organization',
}
export const facilityDefaults: Facility = {
  id: '',
  name: [],
  type: 'idhi:Facility',
}
export const projectDefaults: Project = {
  id: '',
  name: [],
  type: 'idhi:Project',
}
export const toolDefaults: Tool = { id: '', name: [], type: 'idhi:Tool' }
export const serviceDefaults: Service = {
  id: '',
  name: [],
  type: 'idhi:Service',
}
export const publicationDefaults: Publication = {
  id: '',
  name: [],
  type: 'idhi:Publication',
}
export const eventDefaults: Event = {
  id: '',
  name: [],
  type: 'idhi:Event',
}
export const datasetDefaults: Dataset = {
  id: '',
  name: [],
  type: 'idhi:Dataset',
}
export const trainingMaterialDefaults: TrainingMaterial = {
  id: '',
  name: [],
  type: 'idhi:TrainingMaterial',
}

export const personFormOptions = formOptions({ defaultValues: personDefaults })
export const organizationFormOptions = formOptions({
  defaultValues: organizationDefaults,
})
export const facilityFormOptions = formOptions({
  defaultValues: facilityDefaults,
})
export const projectFormOptions = formOptions({
  defaultValues: projectDefaults,
})
export const toolFormOptions = formOptions({ defaultValues: toolDefaults })
export const serviceFormOptions = formOptions({
  defaultValues: serviceDefaults,
})
export const publicationFormOptions = formOptions({
  defaultValues: publicationDefaults,
})
export const eventFormOptions = formOptions({ defaultValues: eventDefaults })
export const datasetFormOptions = formOptions({
  defaultValues: datasetDefaults,
})
export const trainingMaterialFormOptions = formOptions({
  defaultValues: trainingMaterialDefaults,
})
