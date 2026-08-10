import { createFormHookContexts } from '@tanstack/react-form'

export type EntityFormValues = Record<string, unknown>

export const { fieldContext, useFieldContext, useFormContext, formContext } =
  createFormHookContexts()
