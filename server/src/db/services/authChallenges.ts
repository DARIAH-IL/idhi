import {
  Schema,
  type Connection,
  type HydratedDocument,
  type ToObjectOptions,
} from 'mongoose'
import type { AuthChallenge } from '../models/AuthChallenge'
import { COLLECTIONS } from '../collections'

type StoredAuthChallenge = Omit<AuthChallenge, 'challengeId'> & {
  _id: string
  expiresAt: Date
}

const serializationOptions: ToObjectOptions<StoredAuthChallenge> = {
  aliases: true,
  virtuals: true,
  transform(_document, challenge) {
    Reflect.deleteProperty(challenge, '_id')
    Reflect.deleteProperty(challenge, 'expiresAt')
    return challenge
  },
}

const authChallengeSchema = new Schema<StoredAuthChallenge>(
  {
    _id: { type: String, alias: 'challengeId' },
    expiresAt: { type: Date, required: true },
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

export interface AuthChallengeDatabaseService {
  getById(challengeId: string): Promise<AuthChallenge | null>
  takeById(challengeId: string): Promise<AuthChallenge | null>
  insert(challenge: AuthChallenge): Promise<AuthChallenge>
  update(challenge: AuthChallenge): Promise<AuthChallenge | null>
  delete(challengeId: string): Promise<boolean>
}

function exposeAuthChallenge(
  challenge: HydratedDocument<StoredAuthChallenge>,
): AuthChallenge {
  return challenge.toObject<AuthChallenge>()
}

export async function createAuthChallengeDatabaseService(
  connection: Connection,
): Promise<AuthChallengeDatabaseService> {
  const authChallenges = connection.model<StoredAuthChallenge>(
    'AuthChallenge',
    authChallengeSchema,
    COLLECTIONS.authChallenges,
  )

  await authChallenges.collection.createIndex(
    { expiresAt: 1 },
    {
      name: 'auth_challenges_expiration',
      expireAfterSeconds: 0,
    },
  )

  return {
    async getById(challengeId) {
      const challenge = await authChallenges.findById(challengeId).exec()

      return challenge ? exposeAuthChallenge(challenge) : null
    },

    async takeById(challengeId) {
      const challenge = await authChallenges
        .findByIdAndDelete(challengeId)
        .exec()

      return challenge ? exposeAuthChallenge(challenge) : null
    },

    async insert(challenge) {
      const createdChallenge = new authChallenges()
      createdChallenge.set({
        ...challenge,
        expiresAt: new Date(challenge.expiresAtEpoch),
      })
      await createdChallenge.save()

      return exposeAuthChallenge(createdChallenge)
    },

    async update(challenge) {
      const { challengeId, ...values } = challenge
      const updatedChallenge = await authChallenges
        .findByIdAndUpdate(
          challengeId,
          {
            $set: {
              ...values,
              expiresAt: new Date(values.expiresAtEpoch),
            },
          },
          { new: true },
        )
        .exec()

      return updatedChallenge ? exposeAuthChallenge(updatedChallenge) : null
    },

    async delete(challengeId) {
      const result = await authChallenges.deleteOne({ _id: challengeId }).exec()

      return result.deletedCount === 1
    },
  }
}
