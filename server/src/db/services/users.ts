import {
  Schema,
  type Connection,
  type HydratedDocument,
  type ToObjectOptions,
} from 'mongoose'
import type { UserWithCredentials } from '../models/UserWithCredentials'

type StoredUser = Omit<UserWithCredentials, 'id'> & {
  _id: string
}

const serializationOptions: ToObjectOptions<StoredUser> = {
  aliases: true,
  virtuals: true,
  transform(_document, user) {
    Reflect.deleteProperty(user, '_id')
    return user
  },
}

const userSchema = new Schema<StoredUser>(
  {
    _id: { type: String, alias: 'id' },
  },
  {
    id: false,
    strict: false,
    strictQuery: false,
    versionKey: false,
    toJSON: serializationOptions,
    toObject: serializationOptions,
  },
)

const emailCollation = { locale: 'en', strength: 2 } as const

export interface UserDatabaseService {
  getByEmail(email: string): Promise<UserWithCredentials | null>
  insert(user: UserWithCredentials): Promise<UserWithCredentials>
  update(user: UserWithCredentials): Promise<UserWithCredentials | null>
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function exposeUser(user: HydratedDocument<StoredUser>): UserWithCredentials {
  return user.toObject<UserWithCredentials>()
}

export async function createUserDatabaseService(
  connection: Connection,
): Promise<UserDatabaseService> {
  const users = connection.model<StoredUser>('User', userSchema, 'users')

  await users.collection.createIndex(
    { email: 1 },
    {
      name: 'users_email_unique_case_insensitive',
      unique: true,
      collation: emailCollation,
    },
  )

  return {
    async getByEmail(email) {
      const user = await users
        .findOne({ email: normalizeEmail(email) })
        .collation(emailCollation)
        .exec()

      return user ? exposeUser(user) : null
    },

    async insert(user) {
      const createdUser = new users()
      createdUser.set({ ...user, email: normalizeEmail(user.email) })
      await createdUser.save()

      return exposeUser(createdUser)
    },

    async update(user) {
      const { id, ...values } = user
      const updatedUser = await users
        .findByIdAndUpdate(
          id,
          { $set: { ...values, email: normalizeEmail(values.email) } },
          { new: true },
        )
        .exec()

      return updatedUser ? exposeUser(updatedUser) : null
    },
  }
}
