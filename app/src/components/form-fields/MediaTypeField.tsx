import { SuggestibleTagsField } from './SuggestibleTagsField'

const COMMON_MEDIA_TYPES = [
  'text/csv',
  'text/plain',
  'text/html',
  'text/xml',
  'text/tab-separated-values',
  'application/json',
  'application/ld+json',
  'application/xml',
  'application/rdf+xml',
  'application/pdf',
  'application/zip',
  'application/gzip',
  'application/x-tar',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/octet-stream',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/gif',
  'audio/mpeg',
  'audio/wav',
  'video/mp4',
  'video/mpeg',
]

interface Props {
  label: React.ReactNode
}

export function MediaTypeField({ label }: Props) {
  return <SuggestibleTagsField label={label} knownValues={COMMON_MEDIA_TYPES} />
}
