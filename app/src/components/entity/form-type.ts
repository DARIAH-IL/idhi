import { createFormHookContexts } from '@tanstack/react-form'
import type { EntityType } from '@/lib/entity'

export interface EntityFormValues {
  type: EntityType
  id?: string
  [key: string]: unknown
}

export const { fieldContext, useFieldContext, useFormContext, formContext } =
  createFormHookContexts()
