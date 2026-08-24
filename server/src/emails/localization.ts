import otpEnHtml from './templates/otp-en.html?raw'
import otpHeHtml from './templates/otp-he.html?raw'
import otpArHtml from './templates/otp-ar.html?raw'
import inviteEnHtml from './templates/invite-en.html?raw'
import inviteHeHtml from './templates/invite-he.html?raw'
import inviteArHtml from './templates/invite-ar.html?raw'
import { UiLanguage } from '../models'

const OTP_SUBJECTS: Record<UiLanguage, string> = {
  en: 'Your IDHI login code',
  he: 'קוד ההתחברות שלך ל-IDHI',
  ar: 'رمز الدخول الخاص بك إلى IDHI',
}

const OTP_TEMPLATES: Record<UiLanguage, string> = {
  en: otpEnHtml,
  he: otpHeHtml,
  ar: otpArHtml,
}

const INVITE_SUBJECTS: Record<UiLanguage, string> = {
  en: "You've been invited to IDHI",
  he: 'הוזמנת להצטרף ל-IDHI',
  ar: 'تمت دعوتك للانضمام إلى IDHI',
}

const INVITE_TEMPLATES: Record<UiLanguage, string> = {
  en: inviteEnHtml,
  he: inviteHeHtml,
  ar: inviteArHtml,
}

function render(template: string, vars: Record<string, string>): string {
  return template.replace(/{{(\w+)}}/g, (_match, key) => vars[key] ?? '')
}

export function otpEmailContent(
  lang: UiLanguage,
  otp: string,
  expiration: string,
  loginUrl: string,
): { subject: string; html: string } {
  return {
    subject: OTP_SUBJECTS[lang],
    html: render(OTP_TEMPLATES[lang], { otp, expiration, loginUrl }),
  }
}

export function inviteEmailContent(
  lang: UiLanguage,
  inviteUrl: string,
): { subject: string; html: string } {
  return {
    subject: INVITE_SUBJECTS[lang],
    html: render(INVITE_TEMPLATES[lang], { inviteUrl }),
  }
}

export function defaultLang(value: string | undefined): UiLanguage {
  if (value === undefined || value.trim() === '') {
    return UiLanguage.en
  }

  const trimmed = value.trim()

  if (
    trimmed === UiLanguage.en ||
    trimmed === UiLanguage.he ||
    trimmed === UiLanguage.ar
  ) {
    return trimmed
  }

  throw new Error('DEFAULT_LANG must be one of: en, he, ar')
}
