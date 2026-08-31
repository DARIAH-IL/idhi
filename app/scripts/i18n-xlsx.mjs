import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOCALES_DIR = join(__dirname, '..', 'src', 'i18n', 'locales')
const LANGS = ['en', 'he', 'ar']
const SHEET_NAME = 'i18n'

const localePath = (lang) => join(LOCALES_DIR, `${lang}.json`)

const flatten = (obj, prefix = '', result = {}) => {
  for (const [key, value] of Object.entries(obj)) {
    const flatKey = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, flatKey, result)
    } else {
      result[flatKey] = value
    }
  }
  return result
}

const unflatten = (flat) => {
  const result = {}
  for (const [flatKey, value] of Object.entries(flat)) {
    const parts = flatKey.split('.')
    let node = result
    for (let i = 0; i < parts.length - 1; i++) {
      node = node[parts[i]] ??= {}
    }
    node[parts.at(-1)] = value
  }
  return result
}

const exportXlsx = (xlsxPath) => {
  const flattened = Object.fromEntries(
    LANGS.map((lang) => [lang, flatten(JSON.parse(readFileSync(localePath(lang), 'utf8')))]),
  )

  const otherKeys = LANGS.filter((lang) => lang !== 'en').flatMap((lang) =>
    Object.keys(flattened[lang]),
  )
  const keys = [...new Set([...Object.keys(flattened.en), ...otherKeys.sort()])]

  const rows = keys.map((key) => {
    const row = { key }
    for (const lang of LANGS) {
      row[lang] = flattened[lang][key] ?? ''
    }
    return row
  })

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: ['key', ...LANGS] })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, SHEET_NAME)
  XLSX.writeFile(workbook, xlsxPath)

  console.log(`Exported ${keys.length} keys to ${xlsxPath}`)
}

const importXlsx = (xlsxPath) => {
  const workbook = XLSX.readFile(xlsxPath)
  const worksheet = workbook.Sheets[SHEET_NAME] ?? workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

  const flattened = Object.fromEntries(LANGS.map((lang) => [lang, {}]))

  for (const row of rows) {
    const key = row.key
    if (!key) continue
    for (const lang of LANGS) {
      const value = row[lang]
      if (value !== '' && value !== undefined && value !== null) {
        flattened[lang][key] = String(value)
      }
    }
  }

  for (const lang of LANGS) {
    const json = unflatten(flattened[lang])
    writeFileSync(localePath(lang), JSON.stringify(json, null, 2) + '\n')
    console.log(`Imported ${Object.keys(flattened[lang]).length} keys into ${localePath(lang)}`)
  }
}

const [command, xlsxArg] = process.argv.slice(2)
const xlsxPath = resolve(xlsxArg ?? 'i18n.xlsx')

if (command === 'export') {
  exportXlsx(xlsxPath)
} else if (command === 'import') {
  if (!existsSync(xlsxPath)) {
    throw new Error(`File not found: ${xlsxPath}`)
  }
  importXlsx(xlsxPath)
} else {
  console.error('Usage: node scripts/i18n-xlsx.mjs <export|import> [path-to-xlsx]')
  process.exit(1)
}
