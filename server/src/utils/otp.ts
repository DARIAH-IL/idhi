const DEFAULT_DIGITS = 4
const DEFAULT_MAX_ATTEMPTS = 5
const MAX_DIGITS = 32
const MAX_UNBIASED_BYTE = 250

export function otpDigits(value: string | undefined): number {
  const digits = Number(value || DEFAULT_DIGITS)

  if (!Number.isSafeInteger(digits) || digits <= 0 || digits > MAX_DIGITS) {
    throw new Error(
      `OTP_DIGITS must be a positive integer no greater than ${MAX_DIGITS}`,
    )
  }

  return digits
}

export function otpMaxAttempts(value: string | undefined): number {
  const maxAttempts = Number(value || DEFAULT_MAX_ATTEMPTS)

  if (!Number.isSafeInteger(maxAttempts) || maxAttempts <= 0) {
    throw new Error('OTP_MAX_ATTEMPTS must be a positive integer')
  }

  return maxAttempts
}

export function createOtp(digits: number): string {
  let otp = ''

  while (otp.length < digits) {
    const bytes = crypto.getRandomValues(
      new Uint8Array((digits - otp.length) * 2),
    )

    for (const byte of bytes) {
      if (byte >= MAX_UNBIASED_BYTE) {
        continue
      }

      otp += String(byte % 10)

      if (otp.length === digits) {
        break
      }
    }
  }

  return otp
}
