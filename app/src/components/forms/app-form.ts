import { createFormHook } from '@tanstack/react-form'
import { fieldContext, formContext } from './form-context'
import { TextField } from '@/components/form-fields/TextField'
import { BooleanField } from '@/components/form-fields/BooleanField'
import { EnumSelectField } from '@/components/form-fields/EnumSelectField'
import { LangStringField } from '@/components/form-fields/LangStringField'
import { StringArrayField } from '@/components/form-fields/StringArrayField'
import { ArraySection } from '@/components/form-fields/ArraySection'
import {
  EntityRefArrayField,
  EntityRefField,
} from '#/components/forms/entity/fields/EntityRefField.tsx'
import { ImageField } from '#/components/forms/entity/fields/ImageField.tsx'

export const { useAppForm, withFieldGroup, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    ArraySection,
    BooleanField,
    EntityRefArrayField,
    EntityRefField,
    EnumSelectField,
    ImageField,
    LangStringField,
    StringArrayField,
    TextField,
  },
  formComponents: {},
})
