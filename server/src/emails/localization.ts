import otpEnHtml from './templates/otp-en.html?raw'
import otpHeHtml from './templates/otp-he.html?raw'
import otpArHtml from './templates/otp-ar.html?raw'
import inviteEnHtml from './templates/invite-en.html?raw'
import inviteHeHtml from './templates/invite-he.html?raw'
import inviteArHtml from './templates/invite-ar.html?raw'
import { UiLanguage } from '../models'

const OTP_SUBJECTS: Record<UiLanguage, string> = {
  en: 'Your IDHI login code',
  he: 'קוד ההתחברות שלך לאינדקס מדעי הרוח הדיגיטליים',
  ar: 'رمز تسجيل الدخول الخاص بك إلى فهرس العلوم الإنسانية الرقمية',
}

const OTP_TEMPLATES: Record<UiLanguage, string> = {
  en: otpEnHtml,
  he: otpHeHtml,
  ar: otpArHtml,
}

const OTP_FALLBACK_TEXT_TEMPLATES: Record<UiLanguage, string> = {
  en: 'Your IDHI login code is: {{otp}}\n\nSign in: {{loginUrl}}\n\nThis code expires at {{expiration}}.',
  he: 'קוד ההתחברות שלך הוא: {{otp}}\n\nלהתחברות: {{loginUrl}}\n\nהקוד תקף עד {{expiration}}.',
  ar: 'رمز تسجيل الدخول الخاص بك هو: {{otp}}\n\nلتسجيل الدخول: {{loginUrl}}\n\nهذا الرمز صالح حتى {{expiration}}.',
}

const INVITE_SUBJECTS: Record<UiLanguage, string> = {
  en: "You've been invited to IDHI",
  he: 'הוזמנת להצטרף לאינדקס מדעי הרוח הדיגיטליים',
  ar: 'لقد تمت دعوتك للانضمام إلى مؤشر العلوم الإنسانية الرقمية',
}

const INVITE_TEMPLATES: Record<UiLanguage, string> = {
  en: inviteEnHtml,
  he: inviteHeHtml,
  ar: inviteArHtml,
}

const INVITE_FALLBACK_TEXT_TEMPLATES: Record<UiLanguage, string> = {
  en: "You've been invited to join IDHI.{{message}}\n\nAccept the invitation: {{inviteUrl}}",
  he: 'הוזמנת להצטרף ל-IDHI.{{message}}\n\nלקבלת ההזמנה: {{inviteUrl}}',
  ar: 'تمت دعوتك للانضمام إلى IDHI.{{message}}\n\nلقبول الدعوة: {{inviteUrl}}',
}

const NEW_USER_SUBJECTS: Record<UiLanguage, string> = {
  en: 'A new user joined IDHI',
  he: 'משתמש חדש הצטרף לאינדקס מדעי הרוח הדיגיטליים',
  ar: 'انضم مستخدم جديد إلى مؤشر العلوم الإنسانية الرقمية',
}

const NEW_USER_TEXT_TEMPLATES: Record<UiLanguage, string> = {
  en: 'The invited user {{email}} signed in for the first time and now has an IDHI account.',
  he: 'המשתמש המוזמן {{email}} התחבר בפעם הראשונה וכעת יש לו חשבון ב-IDHI.',
  ar: 'قام المستخدم المدعو {{email}} بتسجيل الدخول للمرة الأولى ولديه الآن حساب في IDHI.',
}

function render(template: string, vars: Record<string, string>): string {
  return template.replace(/{{(\w+)}}/g, (_match, key) => vars[key] ?? '')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function messageBlockHtml(message: string | undefined): string {
  if (!message?.trim()) {
    return ''
  }

  return `<p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #18181b; text-align: center; white-space: pre-wrap;">${escapeHtml(message)}</p>`
}

function messageBlockFallbackText(message: string | undefined): string {
  return message?.trim() ? `\n\n${message.trim()}` : ''
}

export function otpEmailContent(
  lang: UiLanguage,
  otp: string,
  expiration: string,
  loginUrl: string,
): { subject: string; html: string; text: string } {
  return {
    subject: OTP_SUBJECTS[lang],
    html: render(OTP_TEMPLATES[lang], { otp, expiration, loginUrl }),
    text: render(OTP_FALLBACK_TEXT_TEMPLATES[lang], {
      otp,
      expiration,
      loginUrl,
    }),
  }
}

export function inviteEmailContent(
  lang: UiLanguage,
  inviteUrl: string,
  message?: string,
): { subject: string; html: string; text: string } {
  return {
    subject: INVITE_SUBJECTS[lang],
    html: render(INVITE_TEMPLATES[lang], {
      inviteUrl,
      messageBlock: messageBlockHtml(message),
    }),
    text: render(INVITE_FALLBACK_TEXT_TEMPLATES[lang], {
      inviteUrl,
      message: messageBlockFallbackText(message),
    }),
  }
}

export function newUserEmailContent(
  lang: UiLanguage,
  email: string,
): { subject: string; html: string; text: string } {
  const text = render(NEW_USER_TEXT_TEMPLATES[lang], { email })

  return {
    subject: NEW_USER_SUBJECTS[lang],
    html: `<p>${escapeHtml(text)}</p>`,
    text,
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
