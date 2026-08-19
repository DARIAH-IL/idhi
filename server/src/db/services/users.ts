import { Buffer } from 'node:buffer'
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

const passkeyCredentialSchema = new Schema<PasskeyCredential>(
  {
    id: { type: String, required: true },
    publicKey: { type: Schema.Types.Buffer, required: true },
    webauthnUserID: { type: String, required: true },
    counter: { type: Number, required: true },
    deviceType: { type: String, required: true },
    backedUp: { type: Boolean, required: true },
    transports: { type: [String], required: false },
  },
  { _id: false },
)

const userSchema = new Schema<StoredUser>(
  {
    _id: { type: String, alias: 'id' },
    passkeyCredentials: {
      type: [passkeyCredentialSchema],
      required: true,
      default: [],
    },
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
  replacePasskeyCredential(
    userId: string,
    replacingCredentialId: string,
    credential: PasskeyCredential,
  ): Promise<'replaced' | 'duplicate' | 'credentialNotFound' | 'userNotFound'>
  replace(userId: string, user: UserWrite): Promise<UserWithCredentials | null>
  delete(userId: string): Promise<boolean>
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function exposePasskeyCredential(
  credential: PasskeyCredential,
): PasskeyCredential {
  return {
    id: credential.id,
    publicKey: new Uint8Array(credential.publicKey),
    webauthnUserID: credential.webauthnUserID,
    counter: credential.counter,
    deviceType: credential.deviceType,
    backedUp: credential.backedUp,
    ...(credential.transports
      ? { transports: [...credential.transports] }
      : {}),
  }
}

function storePasskeyCredential(
  credential: PasskeyCredential,
): PasskeyCredential {
  return {
    ...credential,
    publicKey: Buffer.from(credential.publicKey),
  }
}

function exposeUser(user: HydratedDocument<StoredUser>): UserWithCredentials {
  const exposed = user.toObject<UserWithCredentials>()

  return {
    ...exposed,
    passkeyCredentials: user.passkeyCredentials.map(exposePasskeyCredential),
  }
}

export async function createUserDatabaseService(
  connection: Connection,
  initializeIndexes: boolean,
): Promise<UserDatabaseService> {
  const users = connection.model<StoredUser>(
    'User',
    userSchema,
    COLLECTIONS.users,
  )

  if (initializeIndexes) {
    await users.collection.createIndex(
      { email: 1 },
      {
        name: 'users_email_unique_case_insensitive',
        unique: true,
        collation: emailCollation,
      },
    )
  }

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

      return user?.passkeyCredentials.map(exposePasskeyCredential) ?? []
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
      createdUser.set({
        ...user,
        email: normalizeEmail(user.email),
        passkeyCredentials: user.passkeyCredentials.map(storePasskeyCredential),
      })
      await createdUser.save()

      return exposeUser(createdUser)
    },

    async update(user) {
      const { id, passkeyCredentials, ...values } = user
      const updatedUser = await users
        .findByIdAndUpdate(
          id,
          {
            $set: {
              ...values,
              email: normalizeEmail(values.email),
              passkeyCredentials: passkeyCredentials.map(
                storePasskeyCredential,
              ),
            },
          },
          { new: true },
        )
        .exec()

      return updatedUser ? exposeUser(updatedUser) : null
    },

    async enrollPasskeyCredential(userId, credential) {
      const storedCredential = storePasskeyCredential(credential)
      const result = await users.updateOne(
        {
          _id: userId,
          'passkeyCredentials.id': { $ne: credential.id },
        },
        { $push: { passkeyCredentials: storedCredential } },
      )

      if (result.modifiedCount === 1) {
        return 'enrolled'
      }

      return (await users.exists({ _id: userId }))
        ? 'duplicate'
        : 'userNotFound'
    },

    async replacePasskeyCredential(userId, replacingCredentialId, credential) {
      const storedCredential = storePasskeyCredential(credential)
      const result = await users.updateOne(
        {
          _id: userId,
          passkeyCredentials: { $elemMatch: { id: replacingCredentialId } },
          ...(credential.id === replacingCredentialId
            ? {}
            : { 'passkeyCredentials.id': { $ne: credential.id } }),
        },
        { $set: { 'passkeyCredentials.$': storedCredential } },
      )

      if (result.matchedCount === 1) {
        return 'replaced'
      }

      const user = await users.findById(userId).exec()

      if (!user) {
        return 'userNotFound'
      }

      if (
        user.passkeyCredentials.some(
          (candidate) => candidate.id === credential.id,
        )
      ) {
        return 'duplicate'
      }

      return 'credentialNotFound'
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
