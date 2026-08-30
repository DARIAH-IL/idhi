export const ISO_639_1_CODES = [
  'aa',
  'ab',
  'ae',
  'af',
  'ak',
  'am',
  'an',
  'ar',
  'as',
  'av',
  'ay',
  'az',
  'ba',
  'be',
  'bg',
  'bh',
  'bi',
  'bm',
  'bn',
  'bo',
  'br',
  'bs',
  'ca',
  'ce',
  'ch',
  'co',
  'cr',
  'cs',
  'cu',
  'cv',
  'cy',
  'da',
  'de',
  'dv',
  'dz',
  'ee',
  'el',
  'en',
  'eo',
  'es',
  'et',
  'eu',
  'fa',
  'ff',
  'fi',
  'fj',
  'fo',
  'fr',
  'fy',
  'ga',
  'gd',
  'gl',
  'gn',
  'gu',
  'gv',
  'ha',
  'he',
  'hi',
  'ho',
  'hr',
  'ht',
  'hu',
  'hy',
  'hz',
  'ia',
  'id',
  'ie',
  'ig',
  'ii',
  'ik',
  'io',
  'is',
  'it',
  'iu',
  'ja',
  'jv',
  'ka',
  'kg',
  'ki',
  'kj',
  'kk',
  'kl',
  'km',
  'kn',
  'ko',
  'kr',
  'ks',
  'ku',
  'kv',
  'kw',
  'ky',
  'la',
  'lb',
  'lg',
  'li',
  'ln',
  'lo',
  'lt',
  'lu',
  'lv',
  'mg',
  'mh',
  'mi',
  'mk',
  'ml',
  'mn',
  'mr',
  'ms',
  'mt',
  'my',
  'na',
  'nb',
  'nd',
  'ne',
  'ng',
  'nl',
  'nn',
  'no',
  'nr',
  'nv',
  'ny',
  'oc',
  'oj',
  'om',
  'or',
  'os',
  'pa',
  'pi',
  'pl',
  'ps',
  'pt',
  'qu',
  'rm',
  'rn',
  'ro',
  'ru',
  'rw',
  'sa',
  'sc',
  'sd',
  'se',
  'sg',
  'si',
  'sk',
  'sl',
  'sm',
  'sn',
  'so',
  'sq',
  'sr',
  'ss',
  'st',
  'su',
  'sv',
  'sw',
  'ta',
  'te',
  'tg',
  'th',
  'ti',
  'tk',
  'tl',
  'tn',
  'to',
  'tr',
  'ts',
  'tt',
  'tw',
  'ty',
  'ug',
  'uk',
  'ur',
  'uz',
  've',
  'vi',
  'vo',
  'wa',
  'wo',
  'xh',
  'yi',
  'yo',
  'za',
  'zh',
  'zu',
]

export const TOP_LANGUAGE_CODES = ['en', 'he', 'ar']

export interface LanguageOption {
  code: string
  label: string
  searchText: string
}

const englishDisplayNames = new Intl.DisplayNames(['en'], { type: 'language' })

export function languageName(code: string) {
  try {
    return new Intl.DisplayNames([code], { type: 'language' }).of(code)
  } catch {
    return undefined
  }
}

function toOption(code: string): LanguageOption {
  const englishName = englishDisplayNames.of(code) ?? code
  const name = languageName(code) ?? englishName
  return {
    code,
    label: `${name} (${code})`,
    searchText: `${code} ${name} ${englishName}`.toLowerCase(),
  }
}

function hasKnownName(code: string) {
  return englishDisplayNames.of(code) !== code
}

function buildLanguageOptions(): LanguageOption[] {
  const top = TOP_LANGUAGE_CODES.map(toOption)
  const rest = ISO_639_1_CODES.filter(
    (code) => !TOP_LANGUAGE_CODES.includes(code) && hasKnownName(code),
  )
    .map(toOption)
    .sort((a, b) => a.label.localeCompare(b.label))
  return [...top, ...rest]
}

const languageOptions = buildLanguageOptions()

export function getLanguageOptions(): LanguageOption[] {
  return languageOptions
}
