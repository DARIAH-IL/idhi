import { z } from 'zod'

const codeChallenge = z
  .string()
  .min(43)
  .max(128)
  .regex(/^[A-Za-z0-9\-._~]+$/)

export const AuthorizeRequest = z.object({
  response_type: z.literal('code'),
  client_id: z.string().min(1),
  redirect_uri: z.url(),
  code_challenge: codeChallenge,
  code_challenge_method: z.literal('S256'),
  state: z.string().optional(),
  scope: z.string().optional(),
  resource: z.string().optional(),
})

export type AuthorizeRequest = z.infer<typeof AuthorizeRequest>

export const TokenRequest = z.object({
  grant_type: z.literal('authorization_code'),
  code: z.string().min(1),
  redirect_uri: z.url(),
  client_id: z.string().min(1),
  code_verifier: z.string().min(43).max(128),
})

export const RegisterRequest = z
  .object({
    redirect_uris: z.array(z.url()).optional(),
    client_name: z.string().optional(),
  })
  .loose()
