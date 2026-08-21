import ReactTimeAgo from 'react-timeago'
import buildFormatter from 'react-timeago/formatters/buildFormatter'
import arabicStrings from 'react-timeago/language-strings/ar'
import englishStrings from 'react-timeago/language-strings/en'
import hebrewStrings from 'react-timeago/language-strings/he'
import type { Formatter } from 'react-timeago'
import type { Language } from '@/api/models'
import { useUIStore } from '@/stores/ui'

const formatters = {
  en: buildFormatter(englishStrings),
  he: buildFormatter(hebrewStrings),
  ar: buildFormatter(arabicStrings),
} satisfies Record<Language, Formatter>

interface TimeAgoProps {
  date: string | null | undefined
}

export function TimeAgo({ date }: TimeAgoProps) {
  const language = useUIStore((state) => state.language)

  if (!date) return '—'

  const d = new Date(date)
  const title = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

  return (
    <ReactTimeAgo date={date} formatter={formatters[language]} title={title} />
  )
}
