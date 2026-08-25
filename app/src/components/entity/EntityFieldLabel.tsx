import { useTranslation } from 'react-i18next'
import { termUris } from '@/api/termUris/termUris'
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip'

const uris: Record<string, Record<string, string> | undefined> = termUris

interface FieldMeta {
  label: string
  description: string
}

interface EntityFieldLabelProps {
  entityClass: string
  field: string
}

export function EntityFieldLabel({
  entityClass,
  field,
}: EntityFieldLabelProps) {
  const { t } = useTranslation()
  const allFields: Record<
    string,
    Record<string, FieldMeta | undefined> | undefined
  > = t('entity.fields', { returnObjects: true })
  const meta = allFields[entityClass]?.[field]
  const term = uris[entityClass]?.[field]
  const label = meta?.label ?? field.replaceAll('_', ' ')

  if (!meta?.description && !term) {
    return label
  }

  return (
    <TooltipTrigger>
      <span>{label}</span>
      <Tooltip className="flex-col items-start gap-0.5">
        {meta?.description && <span>{meta.description}</span>}
        {term && (
          <span className="font-mono text-[0.625rem] opacity-70">{term}</span>
        )}
      </Tooltip>
    </TooltipTrigger>
  )
}
