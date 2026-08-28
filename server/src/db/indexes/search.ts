import type { Collection } from 'mongoose'

type SearchIndexDefinition = Record<string, unknown>

function normalizeIndexDefinition(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeIndexDefinition)
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [
          key,
          normalizeIndexDefinition(nestedValue),
        ]),
    )
  }

  return value
}

function sameIndexDefinition(left: unknown, right: unknown): boolean {
  return (
    JSON.stringify(normalizeIndexDefinition(left)) ===
    JSON.stringify(normalizeIndexDefinition(right))
  )
}

async function getSearchIndex(collection: Collection, name: string) {
  const [searchIndex] = await collection
    .aggregate([{ $listSearchIndexes: { name } }])
    .toArray()
  return searchIndex
}

export async function ensureSearchIndex(
  collection: Collection,
  name: string,
  definition: SearchIndexDefinition,
): Promise<void> {
  let searchIndex = await getSearchIndex(collection, name)
  if (!searchIndex) {
    try {
      await collection.createSearchIndex({ name, definition })
      return
    } catch (error) {
      searchIndex = await getSearchIndex(collection, name)
      if (!searchIndex) {
        throw error
      }
    }
  }

  if (!sameIndexDefinition(searchIndex.latestDefinition, definition)) {
    await collection.updateSearchIndex(name, definition)
  }
}
