import type { DatabaseService } from '../db/service'
import { ApiError } from '../errors/ApiError'
import { ErrorCode } from '../models/errorCode'
import type { User } from '../models/user'
import { randomUrlSafeToken } from '../utils/crypto'
import { isAllowedRedirectUri } from './metadata'
import type { AuthorizeRequest } from './oauth.zod'

const AUTHORIZATION_CODE_TTL_MS = 5 * 60 * 1000

export async function issueAuthorizationCode(
  db: DatabaseService,
  user: User,
  request: AuthorizeRequest,
): Promise<string> {
  if (!isAllowedRedirectUri(request.redirect_uri)) {
    throw new ApiError(
      ErrorCode.InvalidInput,
      'redirect_uri must use https or a localhost http address',
    )
  }

  const code = randomUrlSafeToken()

  await db.authChallenges.insert({
    challengeId: code,
    type: 'oauthCode',
    user,
    clientId: request.client_id,
    redirectUri: request.redirect_uri,
    codeChallenge: request.code_challenge,
    ...(request.scope === undefined ? {} : { scope: request.scope }),
    ...(request.resource === undefined ? {} : { resource: request.resource }),
    expiresAtEpoch: Date.now() + AUTHORIZATION_CODE_TTL_MS,
  })

  const url = new URL(request.redirect_uri)
  url.searchParams.set('code', code)

  if (request.state !== undefined) {
    url.searchParams.set('state', request.state)
  }

  return url.toString()
}
