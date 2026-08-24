import nodemailer from 'nodemailer'
import type { Bindings } from '../bindings'
import { inviteEmailContent, otpEmailContent } from '../emails/localization'
import { requiredValue } from './values'
import { formatDate } from './date'
import type { UiLanguage } from '../models'

const DEFAULT_SMTP_PORT = 465

function smtpPort(value: string | undefined): number {
  if (value === undefined || value.trim() === '') {
    return DEFAULT_SMTP_PORT
  }

  const port = Number(value)

  if (!Number.isSafeInteger(port) || port <= 0 || port > 65_535) {
    throw new Error('SMTP_PORT must be an integer between 1 and 65535')
  }

  return port
}

function smtpSecure(value: string | undefined, port: number): boolean {
  if (value === undefined || value.trim() === '') {
    return port === 465
  }

  const normalized = value.trim().toLowerCase()

  if (normalized === 'true') {
    return true
  }

  if (normalized === 'false') {
    return false
  }

  throw new Error('SMTP_SECURE must be true or false')
}

async function sendEmail(
  bindings: Bindings,
  recipient: string,
  subject: string,
  html: string,
): Promise<void> {
  const host = requiredValue(bindings, 'SMTP_HOST')
  const username = requiredValue(bindings, 'SMTP_USERNAME')
  const password = requiredValue(bindings, 'SMTP_PASSWORD')
  const from = requiredValue(bindings, 'SMTP_FROM_EMAIL')
  const port = smtpPort(bindings.SMTP_PORT)
  const secure = smtpSecure(bindings.SMTP_SECURE, port)
  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user: username,
      pass: password,
    },
  })

  await transport.sendMail({
    from: `IDHI <${from}>`,
    to: recipient,
    subject,
    html,
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
  const expiration = formatDate(expiresAtEpoch)
  const { subject, html } = otpEmailContent(lang, otp, expiration, loginUrl)

  await sendEmail(bindings, recipient, subject, html)
}

export async function sendInviteEmail(
  recipient: string,
  inviteUrl: string,
  lang: UiLanguage,
  bindings: Bindings,
): Promise<void> {
  const { subject, html } = inviteEmailContent(lang, inviteUrl)

  await sendEmail(bindings, recipient, subject, html)
}
