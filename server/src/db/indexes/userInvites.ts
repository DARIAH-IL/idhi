import type { mongo } from 'mongoose'

type Collection = mongo.Collection

const EMAIL_COLLATION = { locale: 'en', strength: 2 }

export async function initializeUserInviteIndexes(
  userInvites: Collection,
): Promise<void> {
  await userInvites.createIndex(
    { email: 1 },
    {
      name: 'user_invites_email_unique_case_insensitive',
      unique: true,
      collation: EMAIL_COLLATION,
    },
  )
}
