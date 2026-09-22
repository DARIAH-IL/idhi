import type { DatabaseService } from '../db/service'
import type { EntityViewer } from '../db/services/entities'
import type { User } from '../models/user'

export async function resolveEntityViewer(
  db: DatabaseService,
  user: User,
): Promise<EntityViewer> {
  if (user.isAdmin) {
    return { id: user.id, isAdmin: true, draftAuthorIds: [user.id] }
  }

  const storedUser = await db.users.get(user.id)
  const peerIds = await db.users.listIdsSharingGroups(storedUser?.groups ?? [])

  return {
    id: user.id,
    isAdmin: false,
    draftAuthorIds: [...new Set([user.id, ...peerIds])],
  }
}

export async function resolveOptionalEntityViewer(
  db: DatabaseService,
  user: User | undefined,
): Promise<EntityViewer | undefined> {
  return user ? resolveEntityViewer(db, user) : undefined
}
