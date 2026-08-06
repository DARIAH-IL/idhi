import {
  Schema,
  type Connection,
  type HydratedDocument,
  type ToObjectOptions,
} from 'mongoose'
import type { AuthChallenge } from '../models/AuthChallenge'

type StoredAuthChallenge = Omit<AuthChallenge, 'challengeId'> & {
  _id: string
}

const serializationOptions: ToObjectOptions<StoredAuthChallenge> = {
  aliases: true,
  virtuals: true,
  transform(_document, challenge) {
    Reflect.deleteProperty(challenge, '_id')
    return challenge
  },
}

const authChallengeSchema = new Schema<StoredAuthChallenge>(
  {
    _id: { type: String, alias: 'challengeId' },
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
  delete(challengeId: string): Promise<boolean>
}

function exposeAuthChallenge(
  challenge: HydratedDocument<StoredAuthChallenge>,
): AuthChallenge {
  return challenge.toObject<AuthChallenge>()
}

export function createAuthChallengeDatabaseService(
  connection: Connection,
): AuthChallengeDatabaseService {
  const authChallenges = connection.model<StoredAuthChallenge>(
    'AuthChallenge',
    authChallengeSchema,
    'authChallenges',
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
      createdChallenge.set(challenge)
      await createdChallenge.save()

      return exposeAuthChallenge(createdChallenge)
    },

    async delete(challengeId) {
      const result = await authChallenges.deleteOne({ _id: challengeId }).exec()

      return result.deletedCount === 1
    },
  }
}
