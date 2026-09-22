import type { User } from '#/api/models'

export function userFromToken(token: string): User | null {
  try {
    const encodedPayload = token.split('.')[1]
    if (!encodedPayload) {
      return null
    }

    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const bytes = Uint8Array.from(atob(paddedBase64), (character) =>
      character.charCodeAt(0),
    )
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes))

    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('id' in payload) ||
      typeof payload.id !== 'string' ||
      payload.id.length === 0 ||
      !('email' in payload) ||
      typeof payload.email !== 'string' ||
      !('isAdmin' in payload) ||
      typeof payload.isAdmin !== 'boolean' ||
      ('groups' in payload &&
        payload.groups !== undefined &&
        !Array.isArray(payload.groups)) ||
      ('name' in payload &&
        payload.name !== undefined &&
        typeof payload.name !== 'string')
    ) {
      return null
    }

    return {
      id: payload.id,
      email: payload.email,
      isAdmin: payload.isAdmin,
      groups:
        'groups' in payload && Array.isArray(payload.groups)
          ? payload.groups.filter(
              (group): group is string => typeof group === 'string',
            )
          : [],
      ...('name' in payload && typeof payload.name === 'string'
        ? { name: payload.name }
        : {}),
    }
  } catch {
    return null
  }
}
