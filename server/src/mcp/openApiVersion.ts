import openApiYaml from '../../../openapi.yaml?raw'

function extractInfoVersion(yaml: string): string {
  const lines = yaml.split('\n')
  const infoIndex = lines.findIndex((line) => /^info:\s*$/.test(line))

  if (infoIndex === -1) {
    throw new Error('openapi.yaml: could not find an "info:" block')
  }

  for (let i = infoIndex + 1; i < lines.length; i++) {
    const line = lines[i]

    if (line === undefined || /^\S/.test(line)) {
      break
    }

    const value = /^\s+version:\s*(.+)$/.exec(line)?.[1]

    if (value !== undefined) {
      return value.trim().replace(/^['"]|['"]$/g, '')
    }
  }

  throw new Error('openapi.yaml: could not find "info.version"')
}

export const OPENAPI_VERSION = extractInfoVersion(openApiYaml)
