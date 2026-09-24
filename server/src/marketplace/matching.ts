import type { MarketplaceActor, MarketplaceItem } from './api/client'
import type { MarketplaceExternalId } from './payloads'

const STRONG_SIMILARITY = 0.92
const URL_BACKED_SIMILARITY = 0.6

export function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

function normalizeUrl(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[/#?]+$/, '')
}

function bigrams(value: string): Map<string, number> {
  const grams = new Map<string, number>()
  const padded = ` ${value} `
  for (let index = 0; index < padded.length - 1; index += 1) {
    const gram = padded.slice(index, index + 2)
    grams.set(gram, (grams.get(gram) ?? 0) + 1)
  }
  return grams
}

export function similarity(left: string, right: string): number {
  const a = normalizeText(left)
  const b = normalizeText(right)
  if (!a || !b) {
    return 0
  }
  if (
    a === b ||
    a.split(' ').sort().join(' ') === b.split(' ').sort().join(' ')
  ) {
    return 1
  }
  const leftGrams = bigrams(a)
  const rightGrams = bigrams(b)
  let overlap = 0
  let total = 0
  for (const [gram, count] of leftGrams) {
    overlap += Math.min(count, rightGrams.get(gram) ?? 0)
    total += count
  }
  for (const count of rightGrams.values()) {
    total += count
  }
  return total ? (2 * overlap) / total : 0
}

function externalIdKey({
  identifierService,
  identifier,
}: MarketplaceExternalId) {
  return `${identifierService.code.toLowerCase()}:${identifier.trim().toLowerCase()}`
}

function sharesExternalId(
  left: MarketplaceExternalId[],
  right: MarketplaceExternalId[] | undefined,
): boolean {
  const keys = new Set(left.map(externalIdKey))
  return (right ?? []).some((externalId) => keys.has(externalIdKey(externalId)))
}

function conflictingExternalId(
  left: MarketplaceExternalId[],
  right: MarketplaceExternalId[] | undefined,
): boolean {
  return left.some(({ identifierService, identifier }) =>
    (right ?? []).some(
      (other) =>
        other.identifierService.code.toLowerCase() ===
          identifierService.code.toLowerCase() &&
        other.identifier.trim().toLowerCase() !==
          identifier.trim().toLowerCase(),
    ),
  )
}

export function bestItemMatch(
  target: {
    label: string
    accessibleAt: string[]
    externalIds: MarketplaceExternalId[]
  },
  candidates: MarketplaceItem[],
): MarketplaceItem | undefined {
  const targetUrls = new Set(target.accessibleAt.map(normalizeUrl))
  let best: { item: MarketplaceItem; score: number } | undefined

  for (const candidate of candidates) {
    if (conflictingExternalId(target.externalIds, candidate.externalIds)) {
      continue
    }
    const score = similarity(target.label, candidate.label)
    const sharesUrl = (candidate.accessibleAt ?? []).some((url) =>
      targetUrls.has(normalizeUrl(url)),
    )
    const accepted =
      sharesExternalId(target.externalIds, candidate.externalIds) ||
      score >= STRONG_SIMILARITY ||
      (sharesUrl && score >= URL_BACKED_SIMILARITY)
    if (accepted && (!best || score > best.score)) {
      best = { item: candidate, score }
    }
  }

  return best?.item
}

export function bestActorMatch(
  target: { name: string; externalIds: MarketplaceExternalId[] },
  candidates: MarketplaceActor[],
): MarketplaceActor | undefined {
  const byExternalId = candidates.find((candidate) =>
    sharesExternalId(target.externalIds, candidate.externalIds),
  )
  if (byExternalId) {
    return byExternalId
  }

  let best: { actor: MarketplaceActor; score: number } | undefined
  for (const candidate of candidates) {
    if (conflictingExternalId(target.externalIds, candidate.externalIds)) {
      continue
    }
    const score = similarity(target.name, candidate.name)
    if (score >= STRONG_SIMILARITY && (!best || score > best.score)) {
      best = { actor: candidate, score }
    }
  }
  return best?.actor
}
