import type {
  AuthMetadataOptions,
  OAuthMetadata,
} from '@modelcontextprotocol/server'

export const MCP_PATH = '/mcp'
export const OAUTH_AUTHORIZE_PATH = '/oauth/authorize'
export const OAUTH_TOKEN_PATH = '/oauth/token'
export const OAUTH_REGISTER_PATH = '/oauth/register'
export const SWAGGER_CLIENT_ID = 'idhi-swagger-ui'

export function serverOrigin(requestUrl: string): string {
  return new URL(requestUrl).origin
}

export function swaggerRedirectUri(origin: string): string {
  return `${origin}/swagger/oauth2-redirect.html`
}

export function authMetadataOptions(origin: string): AuthMetadataOptions {
  const oauthMetadata: OAuthMetadata = {
    issuer: origin,
    authorization_endpoint: `${origin}${OAUTH_AUTHORIZE_PATH}`,
    token_endpoint: `${origin}${OAUTH_TOKEN_PATH}`,
    registration_endpoint: `${origin}${OAUTH_REGISTER_PATH}`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
  }

  return {
    oauthMetadata,
    resourceServerUrl: new URL(`${origin}${MCP_PATH}`),
    resourceName: 'IDHI',
  }
}

export function isAllowedRedirectUri(value: string): boolean {
  let url: URL

  try {
    url = new URL(value)
  } catch {
    return false
  }

  if (url.protocol === 'https:') {
    return true
  }

  if (url.protocol === 'http:') {
    return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  }

  return false
}
