import { Hono } from 'hono'
import {
  OAuthError,
  bearerAuthChallengeResponse,
  createMcpHandler,
  getOAuthProtectedResourceMetadataUrl,
  isJsonContentType,
  oauthMetadataResponse,
  verifyBearerToken,
} from '@modelcontextprotocol/server'
import type { AuthInfo } from '@modelcontextprotocol/server'
import type { Bindings } from '../bindings'
import { databaseMiddleware } from '../middleware/db'
import {
  authorizeRedirectHandlers,
  registerClientHandlers,
  tokenHandlers,
} from '../oauth/handlers'
import {
  MCP_PATH,
  OAUTH_AUTHORIZE_PATH,
  OAUTH_REGISTER_PATH,
  OAUTH_TOKEN_PATH,
  authMetadataOptions,
  serverOrigin,
} from '../oauth/metadata'
import { WRITE_TOOL_NAMES, createEntityMcpServer } from './tools'
import { authInfoUser, createTokenVerifier } from './verifier'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isWriteToolCall(parsedBody: unknown): boolean {
  const messages = Array.isArray(parsedBody) ? parsedBody : [parsedBody]

  return messages.some((message) => {
    if (!isRecord(message) || message.method !== 'tools/call') {
      return false
    }

    const params = message.params

    return (
      isRecord(params) &&
      typeof params.name === 'string' &&
      WRITE_TOOL_NAMES.has(params.name)
    )
  })
}

const app = new Hono<{ Bindings: Bindings }>()

app.all('/.well-known/*', (c) => {
  const response = oauthMetadataResponse(
    c.req.raw,
    authMetadataOptions(serverOrigin(c.req.url)),
  )

  return response ?? c.notFound()
})

app.post(OAUTH_REGISTER_PATH, ...registerClientHandlers)
app.get(OAUTH_AUTHORIZE_PATH, ...authorizeRedirectHandlers)
app.post(OAUTH_TOKEN_PATH, databaseMiddleware, ...tokenHandlers)

app.all(MCP_PATH, databaseMiddleware, async (c) => {
  const resourceMetadataUrl = getOAuthProtectedResourceMetadataUrl(
    new URL(`${serverOrigin(c.req.url)}${MCP_PATH}`),
  )
  const challengeOptions = { resourceMetadataUrl }
  let authInfo: AuthInfo | undefined

  if (c.req.header('Authorization')) {
    try {
      authInfo = await verifyBearerToken(c.req.header('Authorization'), {
        verifier: createTokenVerifier(c.env),
        resourceMetadataUrl,
      })
    } catch (error) {
      return bearerAuthChallengeResponse(error, challengeOptions)
    }
  }

  let parsedBody: unknown

  if (
    c.req.method === 'POST' &&
    isJsonContentType(c.req.header('Content-Type'))
  ) {
    try {
      parsedBody = await c.req.json()
    } catch {
      parsedBody = undefined
    }
  }

  if (!authInfo && isWriteToolCall(parsedBody)) {
    return bearerAuthChallengeResponse(
      new OAuthError('invalid_token', 'Authentication required'),
      challengeOptions,
    )
  }

  const handler = createMcpHandler(() =>
    createEntityMcpServer(c.var.db, authInfoUser(authInfo)),
  )

  return handler.fetch(c.req.raw, { authInfo, parsedBody })
})

export default app
