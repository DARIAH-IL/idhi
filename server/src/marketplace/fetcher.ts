export class MarketplaceApiError extends Error {
  constructor(
    readonly status: number,
    readonly method: string,
    readonly path: string,
    readonly body: string,
  ) {
    super(`Marketplace ${method} ${path} failed with ${status}: ${body}`)
  }
}

export type MarketplaceRequestInit = RequestInit & {
  apiUrl?: string
  authorization?: string
}

export async function marketplaceFetch<T>(
  path: string,
  { apiUrl, authorization, headers, ...init }: MarketplaceRequestInit = {},
): Promise<T> {
  if (!apiUrl) {
    throw new Error('Marketplace API URL is required')
  }
  const method = init.method ?? 'GET'
  const response = await fetch(`${apiUrl.replace(/\/+$/, '')}${path}`, {
    ...init,
    method,
    headers: {
      accept: 'application/json',
      ...(authorization ? { authorization } : {}),
      ...Object.fromEntries(new Headers(headers).entries()),
    },
  })
  const text = await response.text()
  if (!response.ok) {
    throw new MarketplaceApiError(response.status, method, path, text)
  }
  return JSON.parse(text || 'null')
}
