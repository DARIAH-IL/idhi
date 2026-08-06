import {
  Schema,
  type Connection,
  type HydratedDocument,
  type ToObjectOptions,
} from 'mongoose'
import type { UserInvite } from '../../models/userInvite'

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

export interface UserInviteDatabaseService {
  get(inviteId: string): Promise<UserInvite | null>
  add(invite: UserInvite): Promise<UserInvite>
  delete(inviteId: string): Promise<boolean>
}

function exposeUserInvite(
  invite: HydratedDocument<StoredUserInvite>,
): UserInvite {
  return invite.toObject<UserInvite>()
}

export function createUserInviteDatabaseService(
  connection: Connection,
): UserInviteDatabaseService {
  const userInvites = connection.model<StoredUserInvite>(
    'UserInvite',
    userInviteSchema,
    'userInvites',
  )

  return {
    async get(inviteId) {
      const invite = await userInvites.findById(inviteId).exec()

      return invite ? exposeUserInvite(invite) : null
    },

    async add(invite) {
      const createdInvite = new userInvites()
      createdInvite.set(invite)
      await createdInvite.save()

      return exposeUserInvite(createdInvite)
    },

    async delete(inviteId) {
      const result = await userInvites.deleteOne({ _id: inviteId }).exec()

      return result.deletedCount === 1
    },
  }
}
