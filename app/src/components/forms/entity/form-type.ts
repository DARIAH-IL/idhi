import type { EntityType } from '@/lib/entity'

export interface EntityFormValues {
  type: EntityType
  id?: string
  [key: string]: unknown
}
