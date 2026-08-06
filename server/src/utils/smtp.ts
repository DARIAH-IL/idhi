import nodemailer from 'nodemailer'
import type { Bindings } from '../bindings'
import { requiredValue } from './values'

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

export async function sendOtpEmail(
  recipient: string,
  otp: string,
  expiresAtEpoch: number,
  bindings: Bindings,
): Promise<void> {
  const host = requiredValue(bindings, 'SMTP_HOST')
  const username = requiredValue(bindings, 'SMTP_USERNAME')
  const password = requiredValue(bindings, 'SMTP_PASSWORD')
  const from = requiredValue(bindings, 'SMTP_FROM_EMAIL')
  const expiration = new Date(expiresAtEpoch).toISOString()
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
    subject: 'Your IDHI login code',
    text: `Your IDHI login code is: ${otp}\n\nThis code expires at ${expiration}.`,
  })
}
