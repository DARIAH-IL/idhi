import { useTranslation } from 'react-i18next'
import { ToolToolType, ToolLicense } from '@/api/models'
import { TextField } from './TextField'
import { EnumSelectField } from './EnumSelectField'
import { LangStringField } from './LangStringField'
import { StringArrayField } from './StringArrayField'

export function ToolFields() {
  const { t } = useTranslation()
  return (
    <>
      <LangStringField name="name" label={t('entity.form.fields.name')} />
      <EnumSelectField
        name="tool_type"
        label={t('entity.form.fields.tool_type')}
        options={ToolToolType}
      />
      <EnumSelectField
        name="license"
        label={t('entity.form.fields.license')}
        options={ToolLicense}
      />
      <TextField
        name="code_repository"
        label={t('entity.form.fields.code_repository')}
      />
      <TextField
        name="documentation_url"
        label={t('entity.form.fields.documentation_url')}
      />
      <TextField
        name="programming_language"
        label={t('entity.form.fields.programming_language')}
      />
      <TextField
        name="contact_email"
        label={t('entity.form.fields.contact_email')}
        type="email"
      />
      <StringArrayField
        name="digital_humanities_activities"
        label={t('entity.form.fields.digital_humanities_activities')}
        placeholder="tadirah:…"
      />
      <StringArrayField
        name="additional_urls"
        label={t('entity.form.fields.additional_urls')}
      />
    </>
  )
}
