import {
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server'

interface PasskeyChallenge {
  email: string
  expectedOrigin: string
  expectedRPID: string
}

interface PasskeyCreateChallenge extends PasskeyChallenge {
  options: PublicKeyCredentialCreationOptionsJSON
}

interface PasskeyLoginChallenge extends PasskeyChallenge {
  options: PublicKeyCredentialRequestOptionsJSON
}

interface OtpChallenge {
  code: string
  attempts: number
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
