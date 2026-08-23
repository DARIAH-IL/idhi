import { useState } from 'react'
import {
  startAuthentication,
  startRegistration,
  WebAuthnError,
} from '@simplewebauthn/browser'
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/browser'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  postApiV1AuthPasskeyCreate,
  postApiV1AuthPasskeyCreateChallengeId,
  postApiV1AuthPasskeyLogin,
  postApiV1AuthPasskeyLoginChallengeId,
} from '@/api/hooks/user-auth/user-auth'
import type {
  PasskeyAuthenticationResponse,
  PasskeyRegistrationResponse,
} from '@/api/models'
import { getApiErrorMessage } from '@/lib/api-error'
import { usePasskeyStore } from '@/stores/passkey'

function isCeremonyCancellation(err: unknown): boolean {
  return err instanceof WebAuthnError && err.code === 'ERROR_CEREMONY_ABORTED'
}

function logCeremonyError(
  ceremony: 'authentication' | 'registration',
  err: unknown,
) {
  const details =
    err instanceof WebAuthnError
      ? {
          name: err.name,
          code: err.code,
          message: err.message,
          cause: err.cause,
        }
      : err

  // WebAuthn failures originate in the browser or authenticator and never reach
  // the API, so retain their diagnostic details in developer tools.
  // eslint-disable-next-line no-console
  console.error(`Passkey ${ceremony} ceremony failed`, details, err)
}

interface PasskeyLoginOptions {
  onToken: (jwt: string) => void
  onStaleCredential: (email: string, message: string) => void
  onCeremonyFailure: () => void
  onError: (message: string) => void
}

export function usePasskeyLogin({
  onToken,
  onStaleCredential,
  onCeremonyFailure,
  onError,
}: PasskeyLoginOptions) {
  const { t } = useTranslation()
  const credentialId = usePasskeyStore((state) => state.credentialId)
  const email = usePasskeyStore((state) => state.email)
  const clearCredential = usePasskeyStore((state) => state.clearCredential)
  const [busy, setBusy] = useState(false)

  const login = async () => {
    if (!credentialId || !email || busy) return
    setBusy(true)

    try {
      const challenge = await postApiV1AuthPasskeyLogin({ email })
      const options =
        challenge.options as unknown as PublicKeyCredentialRequestOptionsJSON

      if (
        !options.allowCredentials?.some(
          (credential) => credential.id === credentialId,
        )
      ) {
        clearCredential()
        onStaleCredential(email, t('auth.passkey_not_recognized'))
        return
      }

      let authResponse
      try {
        authResponse = await startAuthentication({ optionsJSON: options })
      } catch (err) {
        if (!isCeremonyCancellation(err)) {
          logCeremonyError('authentication', err)
          onCeremonyFailure()
          onError(t('auth.passkey_failed'))
        }
        return
      }

      const { jwt } = await postApiV1AuthPasskeyLoginChallengeId(
        challenge.challengeId,
        authResponse,
      )
      onToken(jwt)
    } catch (err) {
      onError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return { login, busy }
}

interface PasskeyEnrollOptions {
  onEnrolled: () => void
  onError: (message: string) => void
}

export function usePasskeyEnroll({
  onEnrolled,
  onError,
}: PasskeyEnrollOptions) {
  const { t } = useTranslation()
  const setCredential = usePasskeyStore((state) => state.setCredential)
  const [busy, setBusy] = useState(false)

  const enroll = async (
    accountEmail: string,
    replacingCredentialId?: string,
  ) => {
    if (busy) return
    setBusy(true)

    try {
      const challenge = await postApiV1AuthPasskeyCreate({
        ...(replacingCredentialId ? { replacingCredentialId } : {}),
      })
      const options =
        challenge.options as unknown as PublicKeyCredentialCreationOptionsJSON

      let registrationResponse
      try {
        registrationResponse = await startRegistration({
          optionsJSON: options,
        })
      } catch (err) {
        if (!isCeremonyCancellation(err)) {
          logCeremonyError('registration', err)
          onError(t('auth.passkey_create_failed'))
        }
        return
      }

      await postApiV1AuthPasskeyCreateChallengeId(
        challenge.challengeId,
        registrationResponse,
      )
      setCredential(registrationResponse.id, accountEmail)
      toast.success(t('auth.passkey_created'))
      onEnrolled()
    } catch (err) {
      onError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return { enroll, busy }
}
