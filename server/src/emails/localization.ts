import { Language } from '../models/language'
import otpEnHtml from './templates/otp-en.html?raw'
import otpHeHtml from './templates/otp-he.html?raw'
import otpArHtml from './templates/otp-ar.html?raw'
import inviteEnHtml from './templates/invite-en.html?raw'
import inviteHeHtml from './templates/invite-he.html?raw'
import inviteArHtml from './templates/invite-ar.html?raw'

const OTP_SUBJECTS: Record<Language, string> = {
  en: 'Your IDHI login code',
  he: 'קוד ההתחברות שלך ל-IDHI',
  ar: 'رمز الدخول الخاص بك إلى IDHI',
}

const OTP_TEMPLATES: Record<Language, string> = {
  en: otpEnHtml,
  he: otpHeHtml,
  ar: otpArHtml,
}

const INVITE_SUBJECTS: Record<Language, string> = {
  en: "You've been invited to IDHI",
  he: 'הוזמנת להצטרף ל-IDHI',
  ar: 'تمت دعوتك للانضمام إلى IDHI',
}

const INVITE_TEMPLATES: Record<Language, string> = {
  en: inviteEnHtml,
  he: inviteHeHtml,
  ar: inviteArHtml,
}

function render(template: string, vars: Record<string, string>): string {
  return template.replace(/{{(\w+)}}/g, (_match, key) => vars[key] ?? '')
}

export function otpEmailContent(
  lang: Language,
  otp: string,
  expiration: string,
): { subject: string; html: string } {
  return {
    subject: OTP_SUBJECTS[lang],
    html: render(OTP_TEMPLATES[lang], { otp, expiration }),
  }
}

export function inviteEmailContent(
  lang: Language,
  inviteUrl: string,
): { subject: string; html: string } {
  return {
    subject: INVITE_SUBJECTS[lang],
    html: render(INVITE_TEMPLATES[lang], { inviteUrl }),
  }
}

export function defaultLang(value: string | undefined): Language {
  if (value === undefined || value.trim() === '') {
    return Language.en
  }

  const trimmed = value.trim()

  if (
    trimmed === Language.en ||
    trimmed === Language.he ||
    trimmed === Language.ar
  ) {
    return trimmed
  }

  throw new Error('DEFAULT_LANG must be one of: en, he, ar')
}
