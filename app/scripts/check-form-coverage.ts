import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(scriptDir, '..')
const entityDir = path.join(appRoot, 'src/components/forms/entity')

const COVERAGE_FILE = path.join(entityDir, 'entity-form-coverage.ts')
const COMMON_FIELDS_FILE = path.join(entityDir, 'subforms/common.tsx')

const ENTITY_FIELDS_FILES: Record<string, string> = {
  person: 'PersonFields.tsx',
  organization: 'OrganizationFields.tsx',
  facility: 'FacilityFields.tsx',
  project: 'ProjectFields.tsx',
  tool: 'ToolFields.tsx',
  service: 'ServiceFields.tsx',
  publication: 'PublicationFields.tsx',
  event: 'EventFields.tsx',
  dataset: 'DatasetFields.tsx',
  trainingMaterial: 'TrainingMaterialFields.tsx',
}

function extractObjectBlock(source: string, marker: string): string {
  const start = source.indexOf(marker)
  if (start === -1) {
    throw new Error(`Could not find "${marker}"`)
  }
  const braceStart = source.indexOf('{', start)
  let depth = 0
  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === '{') {
      depth++
    } else if (source[i] === '}') {
      depth--
      if (depth === 0) {
        return source.slice(braceStart + 1, i)
      }
    }
  }
  throw new Error(`Unbalanced braces after "${marker}"`)
}

function extractCoverageEntries(block: string): Map<string, string> {
  const entries = new Map<string, string>()
  const entryRegex =
    /(?:'([^']+)'|([A-Za-z_][A-Za-z0-9_]*)):\s*'((?:rendered|omitted:[^']*))'/g
  for (const match of block.matchAll(entryRegex)) {
    const key = match[1] ?? match[2]
    if (key) {
      entries.set(key, match[3] ?? '')
    }
  }
  return entries
}

function extractRenderedFieldNames(source: string): Set<string> {
  const names = new Set<string>()
  for (const match of source.matchAll(/\bname="([^"]+)"/g)) {
    const name = match[1]
    if (name) {
      names.add(name)
    }
  }
  for (const match of source.matchAll(/\bname=\{`([^`]+)`\}/g)) {
    const name = match[1]
    if (name) {
      names.add(name.replace(/\$\{[^}]+\}/g, ''))
    }
  }
  return names
}

function isCovered(fieldPath: string, renderedNames: Set<string>): boolean {
  if (renderedNames.has(fieldPath)) {
    return true
  }
  if (fieldPath.endsWith('.language') || fieldPath.endsWith('.value')) {
    const withoutSuffix = fieldPath.slice(0, fieldPath.lastIndexOf('.'))
    const withoutTrailingArray = withoutSuffix.replace(/\[\]$/, '')
    return renderedNames.has(withoutTrailingArray)
  }
  return false
}

const coverageSource = readFileSync(COVERAGE_FILE, 'utf8')
const commonSource = readFileSync(COMMON_FIELDS_FILE, 'utf8')

const commonEntries = extractCoverageEntries(
  extractObjectBlock(coverageSource, 'const COMMON_ENTITY_FIELDS'),
)
const commonRenderedNames = extractRenderedFieldNames(commonSource)

const coverageBlock = extractObjectBlock(
  coverageSource,
  'export const ENTITY_FORM_FIELD_COVERAGE',
)

const failures: string[] = []

for (const [entityKey, fieldsFileName] of Object.entries(ENTITY_FIELDS_FILES)) {
  const entityBlock = extractObjectBlock(coverageBlock, `${entityKey}: {`)
  const entityEntries = new Map([
    ...commonEntries,
    ...extractCoverageEntries(entityBlock),
  ])

  const fieldsFilePath = path.join(entityDir, 'fields', fieldsFileName)
  const fieldsSource = readFileSync(fieldsFilePath, 'utf8')
  const renderedNames = new Set([
    ...commonRenderedNames,
    ...extractRenderedFieldNames(fieldsSource),
  ])

  for (const [fieldPath, disposition] of entityEntries) {
    if (disposition !== 'rendered') {
      continue
    }
    if (!isCovered(fieldPath, renderedNames)) {
      failures.push(
        `${entityKey}: "${fieldPath}" is declared "rendered" in entity-form-coverage.ts but no matching form field was found in ${fieldsFileName} (or common.tsx)`,
      )
    }
  }
}

if (failures.length > 0) {
  console.error(
    `Form coverage check failed: ${failures.length} field(s) claim to be rendered but are not wired into their form.\n`,
  )
  for (const failure of failures) {
    console.error(`  - ${failure}`)
  }
  process.exitCode = 1
} else {
  console.log(
    'Form coverage check passed: every "rendered" field is wired into its form.',
  )
}
