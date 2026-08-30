import { SuggestibleTagsField } from './SuggestibleTagsField'

const COMMON_PROGRAMMING_LANGUAGES = [
  'Python',
  'R',
  'JavaScript',
  'TypeScript',
  'Java',
  'C',
  'C++',
  'C#',
  'Go',
  'Rust',
  'PHP',
  'Ruby',
  'Swift',
  'Kotlin',
  'MATLAB',
  'Perl',
  'Scala',
  'Shell',
  'SQL',
  'Julia',
  'XSLT',
  'XQuery',
]

interface Props {
  label: React.ReactNode
}

export function ProgrammingLanguagesField({ label }: Props) {
  return (
    <SuggestibleTagsField
      label={label}
      knownValues={COMMON_PROGRAMMING_LANGUAGES}
    />
  )
}
