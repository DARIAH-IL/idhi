import type { UiLanguage } from '../models'

export type AuthLinkFlow = 'invite' | 'otp'

export function createAuthLink(
  frontendUrl: string,
  challengeId: string,
  otp: string,
  lang: UiLanguage,
  flow: AuthLinkFlow,
): string {
  const url = new URL(frontendUrl)
  url.searchParams.set('challengeId', challengeId)
  url.searchParams.set('otp', otp)
  url.searchParams.set('lang', lang)
  url.searchParams.set('authFlow', flow)
  return url.toString()
}
