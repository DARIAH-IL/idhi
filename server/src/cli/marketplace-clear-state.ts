import { pathToFileURL } from 'node:url'
import { connectToDatabase } from '../db/connection'
import { createDatabaseService } from '../db/service'
import type { EntityViewer } from '../db/services/entities'
import { MARKETPLACE_CATEGORIES } from '../db/services/marketplace'
import { serializeError } from '../middleware/logger'
import { requiredValue } from '../utils/values'

const ENTITY_PAGE_SIZE = 100

function log(
  level: 'info' | 'error',
  message: string,
  attributes: Record<string, unknown>,
): void {
  process.stderr.write(
    `${JSON.stringify({ level, message, at: new Date().toISOString(), ...attributes })}\n`,
  )
}

function permalinkPattern(marketplaceUrl: string): RegExp {
  const base = marketplaceUrl
    .replace(/\/+$/, '')
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(
    `^${base}/(${MARKETPLACE_CATEGORIES.join('|')})/[^/?#]+/?$`,
    'i',
  )
}

async function main(): Promise<void> {
  const env = process.env
  const dryRun = process.argv.includes('--dry-run')
  const pattern = permalinkPattern(
    requiredValue(env, 'MARKETPLACE_FRONTEND_URL'),
  )
  const auditUserId = requiredValue(env, 'EMAIL_FROM_ADDRESS')
  const viewer: EntityViewer = {
    id: auditUserId,
    isAdmin: true,
    draftAuthorIds: [],
  }

  const connection = await connectToDatabase(
    requiredValue(env, 'MONGODB_CONNECTION_STRING'),
    requiredValue(env, 'MONGODB_DATABASE_NAME'),
  )

  try {
    const db = await createDatabaseService(connection)
    const unlinked: string[] = []

    for (let page = 0; ; page += 1) {
      const { results } = await db.entities.search(
        undefined,
        undefined,
        undefined,
        [{ property: 'id', direction: 'asc' }],
        page,
        ENTITY_PAGE_SIZE,
        viewer,
      )
      for (const { audit: _audit, isDraft, ...entity } of results) {
        const current = entity.same_as ?? []
        const sameAs = current.filter((uri) => !pattern.test(uri.trim()))
        if (sameAs.length === current.length) {
          continue
        }
        if (!dryRun) {
          await db.entities.replace(
            entity.id,
            { ...entity, same_as: sameAs },
            auditUserId,
            isDraft === true,
            viewer,
            { source: 'marketplace-sync' },
          )
        }
        unlinked.push(entity.id)
        log('info', 'Removed marketplace permalinks', {
          entityId: entity.id,
          removed: current.filter((uri) => !sameAs.includes(uri)),
        })
      }
      if (results.length < ENTITY_PAGE_SIZE) {
        break
      }
    }

    const items = dryRun
      ? (await db.marketplace.items.list()).length
      : await db.marketplace.items.clear()
    const actors = dryRun
      ? (await db.marketplace.actors.list()).length
      : await db.marketplace.actors.clear()

    process.stdout.write(
      `${JSON.stringify({ unlinked, deletedMappings: { items, actors } }, null, 2)}\n`,
    )
  } finally {
    await connection.close()
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    await main()
  } catch (error) {
    log('error', 'Marketplace state clear failed', serializeError(error))
    process.exitCode = 1
  }
}
