import type { Formatter } from 'react-timeago'
import ReactTimeAgo from 'react-timeago'
import buildFormatter from 'react-timeago/formatters/buildFormatter'
import arabicStrings from 'react-timeago/language-strings/ar'
import englishStrings from 'react-timeago/language-strings/en'
import hebrewStrings from 'react-timeago/language-strings/he'
import type { UiLanguage } from '@/api/models'
import { useUIStore } from '@/stores/ui'
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip'

const capitalized =
  (formatter: Formatter): Formatter =>
  (...args) => {
    const result = formatter(...args)
    return typeof result === 'string'
      ? result.charAt(0).toUpperCase() + result.slice(1)
      : result
  }

const formatters = {
  en: capitalized(buildFormatter(englishStrings)),
  he: buildFormatter(hebrewStrings),
  ar: buildFormatter(arabicStrings),
} satisfies Record<UiLanguage, Formatter>

interface TimeAgoProps {
  date: string | null | undefined
}

export function TimeAgoReverse({ date }: TimeAgoProps) {
  const language = useUIStore((state) => state.language)

  if (!date) {
    return '—'
  }

  const label = new Date(date).toLocaleDateString(language)

  return (
    <TooltipTrigger>
      <span>{label}</span>
      <Tooltip>
        <ReactTimeAgo date={date} formatter={formatters[language]} title="" />
      </Tooltip>
    </TooltipTrigger>
  )
}

export function TimeAgo({ date }: TimeAgoProps) {
  const language = useUIStore((state) => state.language)

  if (!date) {
    return '—'
  }

  const d = new Date(date)
  const label = `${d.toLocaleDateString()} ${d.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}`

  return (
    <TooltipTrigger>
      <span aria-label={label}>
        <ReactTimeAgo date={date} formatter={formatters[language]} title="" />
      </span>
      <Tooltip>{label}</Tooltip>
    </TooltipTrigger>
  )
}
