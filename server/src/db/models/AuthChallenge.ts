import {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server'

interface PasskeyCreateChallenge {
  options: PublicKeyCredentialCreationOptionsJSON
}

interface PasskeyLoginChallenge {
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
    } & PasskeyLoginChallenge)
)
