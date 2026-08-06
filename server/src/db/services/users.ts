import {
  Schema,
  type Connection,
  type HydratedDocument,
  type ToObjectOptions,
} from 'mongoose'
import type {
  PasskeyCredential,
  UserWithCredentials,
} from '../models/UserWithCredentials'
import type { UserWrite } from '../../models/userWrite'
import { COLLECTIONS } from '../collections'

export interface UserListResult {
  results: UserWithCredentials[]
  total: number
}

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
  list(page: number, pageSize: number): Promise<UserListResult>
  get(userId: string): Promise<UserWithCredentials | null>
  getPasskeyCredentials(userId: string): Promise<PasskeyCredential[]>
  getByEmail(email: string): Promise<UserWithCredentials | null>
  insert(user: UserWithCredentials): Promise<UserWithCredentials>
  update(user: UserWithCredentials): Promise<UserWithCredentials | null>
  enrollPasskeyCredential(
    userId: string,
    credential: PasskeyCredential,
  ): Promise<'enrolled' | 'duplicate' | 'userNotFound'>
  replace(userId: string, user: UserWrite): Promise<UserWithCredentials | null>
  delete(userId: string): Promise<boolean>
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
  const users = connection.model<StoredUser>(
    'User',
    userSchema,
    COLLECTIONS.users,
  )

  await users.collection.createIndex(
    { email: 1 },
    {
      name: 'users_email_unique_case_insensitive',
      unique: true,
      collation: emailCollation,
    },
  )

  return {
    async list(page, pageSize) {
      const [documents, total] = await Promise.all([
        users
          .find()
          .sort({ email: 1, _id: 1 })
          .skip(page * pageSize)
          .limit(pageSize)
          .exec(),
        users.countDocuments().exec(),
      ])

      return { results: documents.map(exposeUser), total }
    },

    async get(userId) {
      const user = await users.findById(userId).exec()
      return user ? exposeUser(user) : null
    },

    async getPasskeyCredentials(userId) {
      const user = await users
        .findById(userId)
        .select({ passkeyCredentials: 1 })
        .exec()

      return user?.passkeyCredentials ?? []
    },

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

    async enrollPasskeyCredential(userId, credential) {
      const result = await users.updateOne(
        {
          _id: userId,
          'passkeyCredentials.id': { $ne: credential.id },
        },
        { $push: { passkeyCredentials: credential } },
      )

      if (result.modifiedCount === 1) {
        return 'enrolled'
      }

      return (await users.exists({ _id: userId }))
        ? 'duplicate'
        : 'userNotFound'
    },

    async replace(userId, user) {
      const updatedUser = await users
        .findByIdAndUpdate(
          userId,
          { $set: { ...user, email: normalizeEmail(user.email) } },
          { new: true },
        )
        .exec()

      return updatedUser ? exposeUser(updatedUser) : null
    },

    async delete(userId) {
      const result = await users.deleteOne({ _id: userId }).exec()
      return result.deletedCount === 1
    },
  }
}
