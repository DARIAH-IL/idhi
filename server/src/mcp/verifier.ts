import { OAuthError } from '@modelcontextprotocol/server'
import type { AuthInfo, OAuthTokenVerifier } from '@modelcontextprotocol/server'
import type { Bindings } from '../bindings'
import type { User } from '../models/user'
import { parseUser, verifyUserJwt } from '../utils/jwt'

const TOKEN_CLIENT_ID = 'idhi'

export function createTokenVerifier(bindings: Bindings): OAuthTokenVerifier {
  return {
    async verifyAccessToken(token) {
      const verified = await verifyUserJwt(token, bindings)

      if (!verified) {
        throw new OAuthError(
          'invalid_token',
          'Access token is invalid or expired',
        )
      }

      return {
        token,
        clientId: TOKEN_CLIENT_ID,
        scopes: [],
        expiresAt: verified.expiresAtEpochSeconds,
        extra: { user: verified.user },
      }
    },
  }
}

export function authInfoUser(authInfo: AuthInfo | undefined): User | undefined {
  return parseUser(authInfo?.extra?.user)
}
