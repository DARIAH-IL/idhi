import type {
  AuthenticatorTransportFuture,
  Base64URLString,
  CredentialDeviceType,
} from '@simplewebauthn/server'
import { User } from '../../models'

export interface PasskeyCredential {
  id: Base64URLString
  publicKey: Uint8Array
  webauthnUserID: Base64URLString
  counter: number
  deviceType: CredentialDeviceType
  backedUp: boolean
  transports?: AuthenticatorTransportFuture[]
}

export interface UserWithCredentials extends User {
  passkeyCredentials: PasskeyCredential[]
}
