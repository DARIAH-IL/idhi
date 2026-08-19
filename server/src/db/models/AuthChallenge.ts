import {
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server'

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
)
