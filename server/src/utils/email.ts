import type { Bindings } from '../bindings'
import { inviteEmailContent, otpEmailContent } from '../emails/localization'
import { requiredValue } from './values'
import { formatDate } from './date'
import type { UiLanguage } from '../models'

async function sendEmail(
  bindings: Bindings,
  recipient: string,
  subject: string,
  html: string,
  text: string,
): Promise<void> {
  const from = requiredValue(bindings, 'EMAIL_FROM_ADDRESS')

  await bindings.EMAIL.send({
    from: { email: from, name: 'IDHI' },
    to: recipient,
    subject,
    html,
    text,
  })
}

export async function sendOtpEmail(
  recipient: string,
  otp: string,
  expiresAtEpoch: number,
  loginUrl: string,
  lang: UiLanguage,
  bindings: Bindings,
): Promise<void> {
  const expiration = formatDate(expiresAtEpoch, lang)
  const { subject, html, text } = otpEmailContent(
    lang,
    otp,
    expiration,
    loginUrl,
  )

  await sendEmail(bindings, recipient, subject, html, text)
}

export async function sendInviteEmail(
  recipient: string,
  inviteUrl: string,
  lang: UiLanguage,
  bindings: Bindings,
  message?: string,
): Promise<void> {
  const { subject, html, text } = inviteEmailContent(lang, inviteUrl, message)

  await sendEmail(bindings, recipient, subject, html, text)
}
