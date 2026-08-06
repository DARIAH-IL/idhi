const ALPHANUMERIC =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const RANDOM_PART_LENGTH = 8
const MAX_UNBIASED_BYTE =
  Math.floor(256 / ALPHANUMERIC.length) * ALPHANUMERIC.length

function randomPart(): string {
  let result = ''

  while (result.length < RANDOM_PART_LENGTH) {
    const bytes = crypto.getRandomValues(
      new Uint8Array((RANDOM_PART_LENGTH - result.length) * 2),
    )

    for (const byte of bytes) {
      if (byte >= MAX_UNBIASED_BYTE) {
        continue
      }

      result += ALPHANUMERIC.charAt(byte % ALPHANUMERIC.length)

      if (result.length === RANDOM_PART_LENGTH) {
        break
      }
    }
  }

  return result
}

export function createId(type: string): string {
  if (!/^[a-z][a-z0-9_]*$/.test(type)) {
    throw new Error('ID type must be lowercase alphanumeric or underscores')
  }

  return `idhi:${type}:${randomPart()}`
}
