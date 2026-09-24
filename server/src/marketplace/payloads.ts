export interface MarketplaceExternalId {
  identifierService: { code: string }
  identifier: string
}

export interface MarketplaceProperty {
  type: { code: string }
  value?: string
  concept?: { code: string; vocabulary: { code: string } }
}

export interface MarketplaceContributor {
  actor: { id: number }
  role: { code: string }
}

export interface MarketplaceRelatedItem {
  persistentId: string
  relation: { code: string }
}

export interface MarketplaceItemPayload {
  label: string
  description: string
  accessibleAt: string[]
  externalIds: MarketplaceExternalId[]
  contributors: MarketplaceContributor[]
  properties: MarketplaceProperty[]
  relatedItems: MarketplaceRelatedItem[]
  source: { id: number }
  sourceItemId: string
}

export interface MarketplaceActorPayload {
  name: string
  externalIds: MarketplaceExternalId[]
  website?: string
  email?: string
  affiliations: { id: number }[]
}
