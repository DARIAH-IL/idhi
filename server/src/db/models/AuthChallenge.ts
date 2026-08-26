import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server'
import type { User } from '../../models/user'

interface PasskeyChallenge {
  expectedOrigin: string
  expectedRPID: string
}

interface PasskeyCreateChallenge extends PasskeyChallenge {
  userId: string
  replacingCredentialId?: string
  options: PublicKeyCredentialCreationOptionsJSON
}

interface PasskeyLoginChallenge extends PasskeyChallenge {
  email: string
  options: PublicKeyCredentialRequestOptionsJSON
}

interface OtpChallenge {
  code: string
  attempts: number
  email: string
}

interface OauthCodeChallenge {
  user: User
  clientId: string
  redirectUri: string
  codeChallenge: string
  scope?: string
  resource?: string
}

export type AuthChallenge = {
  challengeId: string
  expiresAtEpoch: number
} & (
  | ({
      type: 'passkeyCreate'
    } & PasskeyCreateChallenge)
  | ({
      type: 'passkeyLogin'
    } & PasskeyLoginChallenge)
  | ({
      type: 'otp'
    } & OtpChallenge)
  | ({
      type: 'oauthCode'
    } & OauthCodeChallenge)
)
