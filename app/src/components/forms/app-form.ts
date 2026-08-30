import { createFormHook } from '@tanstack/react-form'
import { fieldContext, formContext } from './form-context'
import { TextField } from '@/components/form-fields/TextField'
import { BooleanField } from '@/components/form-fields/BooleanField'
import { EnumMultiSelectField } from '@/components/form-fields/EnumMultiSelectField'
import { EnumSelectField } from '@/components/form-fields/EnumSelectField'
import { LangStringField } from '@/components/form-fields/LangStringField'
import { LanguagesField } from '@/components/form-fields/LanguagesField'
import { MediaTypeField } from '@/components/form-fields/MediaTypeField'
import { StringArrayField } from '@/components/form-fields/StringArrayField'
import { TagsField } from '@/components/form-fields/TagsField'
import { ArraySection } from '@/components/form-fields/ArraySection'
import {
  EntityRefArrayField,
  EntityRefField,
} from '#/components/forms/entity/fields/EntityRefField.tsx'
import { ImageField } from '#/components/forms/entity/fields/ImageField.tsx'
import { DoiField } from '#/components/forms/entity/fields/identifiers/DoiField.tsx'
import { OrcidField } from '#/components/forms/entity/fields/identifiers/OrcidField.tsx'
import { RorField } from '#/components/forms/entity/fields/identifiers/RorField.tsx'

export const { useAppForm, withFieldGroup, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    ArraySection,
    BooleanField,
    DoiField,
    EntityRefArrayField,
    EntityRefField,
    EnumMultiSelectField,
    EnumSelectField,
    ImageField,
    LangStringField,
    LanguagesField,
    MediaTypeField,
    OrcidField,
    RorField,
    StringArrayField,
    TagsField,
    TextField,
  },
  formComponents: {},
})
