import { createFactory } from 'hono/factory'
import type { ZodError } from 'zod'
import type { Bindings } from '../bindings'
import { createJwtForUser, jwtExpirationSeconds } from '../utils/jwt'
import { requiredValue } from '../utils/values'
import { randomUrlSafeToken, verifyPkceS256 } from '../utils/crypto'
import { isAllowedRedirectUri, OAUTH_AUTHORIZE_PATH } from './metadata'
import { AuthorizeRequest, RegisterRequest, TokenRequest } from './oauth.zod'

const factory = createFactory<{ Bindings: Bindings }>()

function oauthError(
  error: string,
  description: string,
  status = 400,
): Response {
  return Response.json({ error, error_description: description }, { status })
}

function zodErrorDescription(error: ZodError): string {
  const issue = error.issues[0]

  return issue
    ? `${issue.path.join('.') || 'request'}: ${issue.message}`
    : 'Invalid request'
}

export const registerClientHandlers = factory.createHandlers(async (c) => {
  let body: unknown

  try {
    body = await c.req.json()
  } catch {
    return oauthError('invalid_client_metadata', 'Request body must be JSON')
  }

  const result = RegisterRequest.safeParse(body)

  if (!result.success) {
    return oauthError(
      'invalid_client_metadata',
      zodErrorDescription(result.error),
    )
  }

  const { redirect_uris: redirectUris, client_name: clientName } = result.data

  if (redirectUris && !redirectUris.every(isAllowedRedirectUri)) {
    return oauthError(
      'invalid_redirect_uri',
      'Redirect URIs must use https or a localhost http address',
    )
  }

  return c.json(
    {
      client_id: randomUrlSafeToken(),
      client_id_issued_at: Math.floor(Date.now() / 1000),
      token_endpoint_auth_method: 'none',
      grant_types: ['authorization_code'],
      response_types: ['code'],
      ...(redirectUris ? { redirect_uris: redirectUris } : {}),
      ...(clientName ? { client_name: clientName } : {}),
    },
    201,
  )
})

function validateAuthorizeRequest(
  query: Record<string, string>,
): AuthorizeRequest | Response {
  const result = AuthorizeRequest.safeParse(query)

  if (!result.success) {
    return oauthError('invalid_request', zodErrorDescription(result.error))
  }

  if (!isAllowedRedirectUri(result.data.redirect_uri)) {
    return oauthError(
      'invalid_request',
      'redirect_uri must use https or a localhost http address',
    )
  }

  return result.data
}

export const authorizeRedirectHandlers = factory.createHandlers((c) => {
  const validated = validateAuthorizeRequest(c.req.query())

  if (validated instanceof Response) {
    return validated
  }

  const frontendUrl = new URL(requiredValue(c.env, 'FRONTEND_URL'))
  const loginUrl = new URL(`${frontendUrl.origin}${OAUTH_AUTHORIZE_PATH}`)

  for (const [key, value] of Object.entries(c.req.query())) {
    loginUrl.searchParams.set(key, value)
  }

  return c.redirect(loginUrl.toString(), 302)
})

export const tokenHandlers = factory.createHandlers(async (c) => {
  const form = await c.req.parseBody()
  const result = TokenRequest.safeParse(form)

  if (!result.success) {
    return oauthError('invalid_request', zodErrorDescription(result.error))
  }

  const request = result.data
  const challenge = await c.var.db.authChallenges.takeById(request.code)

  if (
    !challenge ||
    challenge.type !== 'oauthCode' ||
    challenge.expiresAtEpoch <= Date.now()
  ) {
    return oauthError(
      'invalid_grant',
      'Authorization code is invalid or expired',
    )
  }

  if (
    challenge.clientId !== request.client_id ||
    challenge.redirectUri !== request.redirect_uri
  ) {
    return oauthError(
      'invalid_grant',
      'Authorization code was issued to a different client',
    )
  }

  if (!(await verifyPkceS256(request.code_verifier, challenge.codeChallenge))) {
    return oauthError('invalid_grant', 'PKCE verification failed')
  }

  c.var.logger.debug('OAuth access token issued', {
    userId: challenge.user.id,
    clientId: challenge.clientId,
  })

  return c.json({
    access_token: await createJwtForUser(challenge.user, c.env),
    token_type: 'bearer',
    expires_in: jwtExpirationSeconds(c.env),
    ...(challenge.scope === undefined ? {} : { scope: challenge.scope }),
  })
})
