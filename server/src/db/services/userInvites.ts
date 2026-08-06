import {
  Schema,
  type Connection,
  type HydratedDocument,
  type ToObjectOptions,
} from 'mongoose'
import type { UserInvite } from '../../models/userInvite'
import { COLLECTIONS } from '../collections'

type StoredUserInvite = Omit<UserInvite, 'id'> & {
  _id: string
}

const serializationOptions: ToObjectOptions<StoredUserInvite> = {
  aliases: true,
  virtuals: true,
  transform(_document, invite) {
    Reflect.deleteProperty(invite, '_id')
    return invite
  },
}

const userInviteSchema = new Schema<StoredUserInvite>(
  {
    _id: { type: String, alias: 'id' },
    email: { type: String, required: true },
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

export interface UserInviteDatabaseService {
  listPending(): Promise<UserInvite[]>
  get(inviteId: string): Promise<UserInvite | null>
  getByEmail(email: string): Promise<UserInvite | null>
  add(invite: UserInvite): Promise<UserInvite>
  delete(inviteId: string): Promise<boolean>
  takePendingByEmail(email: string): Promise<UserInvite | null>
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function exposeUserInvite(
  invite: HydratedDocument<StoredUserInvite>,
): UserInvite {
  return invite.toObject<UserInvite>()
}

export async function createUserInviteDatabaseService(
  connection: Connection,
): Promise<UserInviteDatabaseService> {
  const userInvites = connection.model<StoredUserInvite>(
    'UserInvite',
    userInviteSchema,
    COLLECTIONS.userInvites,
  )

  await userInvites.collection.createIndex(
    { email: 1 },
    {
      name: 'user_invites_email_unique_case_insensitive',
      unique: true,
      collation: emailCollation,
    },
  )

  return {
    async listPending() {
      const invites = await userInvites
        .find({ expiration: { $gt: new Date().toISOString() } })
        .sort({ expiration: 1, _id: 1 })
        .exec()

      return invites.map(exposeUserInvite)
    },

    async get(inviteId) {
      const invite = await userInvites.findById(inviteId).exec()

      return invite ? exposeUserInvite(invite) : null
    },

    async getByEmail(email) {
      const invite = await userInvites
        .findOne({ email: normalizeEmail(email) })
        .collation(emailCollation)
        .exec()

      return invite ? exposeUserInvite(invite) : null
    },

    async add(invite) {
      const createdInvite = new userInvites()
      createdInvite.set({ ...invite, email: normalizeEmail(invite.email) })
      await createdInvite.save()

      return exposeUserInvite(createdInvite)
    },

    async delete(inviteId) {
      const result = await userInvites.deleteOne({ _id: inviteId }).exec()

      return result.deletedCount === 1
    },

    async takePendingByEmail(email) {
      const invite = await userInvites
        .findOneAndDelete({
          email: normalizeEmail(email),
          expiration: { $gt: new Date().toISOString() },
        })
        .collation(emailCollation)
        .exec()

      return invite ? exposeUserInvite(invite) : null
    },
  }
}
