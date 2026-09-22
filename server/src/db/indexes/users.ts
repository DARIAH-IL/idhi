import type { mongo } from 'mongoose'

type Collection = mongo.Collection

const EMAIL_COLLATION = { locale: 'en', strength: 2 }

export async function initializeUserIndexes(users: Collection): Promise<void> {
  await Promise.all([
    users.createIndex(
      { email: 1 },
      {
        name: 'users_email_unique_case_insensitive',
        unique: true,
        collation: EMAIL_COLLATION,
      },
    ),
    users.createIndex({ groups: 1 }, { name: 'users_groups' }),
  ])
}
