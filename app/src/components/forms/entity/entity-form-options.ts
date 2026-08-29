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
import { emptyLangString } from '@/lib/lang-string'

export const personDefaults: Person = { id: '', type: 'idhi:Person' }
export function organizationDefaults(language: string): Organization {
  return { id: '', name: emptyLangString(language), type: 'idhi:Organization' }
}
export function facilityDefaults(language: string): Facility {
  return { id: '', name: emptyLangString(language), type: 'idhi:Facility' }
}
export function projectDefaults(language: string): Project {
  return { id: '', name: emptyLangString(language), type: 'idhi:Project' }
}
export function toolDefaults(language: string): Tool {
  return { id: '', name: emptyLangString(language), type: 'idhi:Tool' }
}
export function serviceDefaults(language: string): Service {
  return { id: '', name: emptyLangString(language), type: 'idhi:Service' }
}
export function publicationDefaults(language: string): Publication {
  return { id: '', name: emptyLangString(language), type: 'idhi:Publication' }
}
export function eventDefaults(language: string): Event {
  return { id: '', name: emptyLangString(language), type: 'idhi:Event' }
}
export function datasetDefaults(language: string): Dataset {
  return { id: '', name: emptyLangString(language), type: 'idhi:Dataset' }
}
export function trainingMaterialDefaults(language: string): TrainingMaterial {
  return {
    id: '',
    name: emptyLangString(language),
    type: 'idhi:TrainingMaterial',
  }
}

export const personFormOptions = formOptions({ defaultValues: personDefaults })
export const organizationFormOptions = formOptions({
  defaultValues: organizationDefaults('en'),
})
export const facilityFormOptions = formOptions({
  defaultValues: facilityDefaults('en'),
})
export const projectFormOptions = formOptions({
  defaultValues: projectDefaults('en'),
})
export const toolFormOptions = formOptions({
  defaultValues: toolDefaults('en'),
})
export const serviceFormOptions = formOptions({
  defaultValues: serviceDefaults('en'),
})
export const publicationFormOptions = formOptions({
  defaultValues: publicationDefaults('en'),
})
export const eventFormOptions = formOptions({
  defaultValues: eventDefaults('en'),
})
export const datasetFormOptions = formOptions({
  defaultValues: datasetDefaults('en'),
})
export const trainingMaterialFormOptions = formOptions({
  defaultValues: trainingMaterialDefaults('en'),
})
