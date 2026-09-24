import type { MarketplaceCategory } from '../../db/services/marketplace'
import { MarketplaceApiError } from '../fetcher'
import type { MarketplaceRequestInit } from '../fetcher'
import * as actorApi from './generated/actor-controller/actor-controller'
import * as conceptApi from './generated/concept-controller/concept-controller'
import * as datasetApi from './generated/dataset-controller/dataset-controller'
import { getSignInUrl } from './generated/fake-auth-controller/fake-auth-controller'
import {
  ActorCore,
  ActorDto,
  ConceptDto,
  DatasetCore,
  DatasetDto,
  PaginatedItemsBasicItemBasicDto,
  PaginatedSearchActor,
  PaginatedSearchConcepts,
  PaginatedSearchItems,
  PaginatedSources,
  PublicationCore,
  PublicationDto,
  SourceCore,
  SourceDto,
  ToolCore,
  ToolDto,
  TrainingMaterialCore,
  TrainingMaterialDto,
} from './generated/models'
import * as publicationApi from './generated/publication-controller/publication-controller'
import * as searchApi from './generated/search-controller/search-controller'
import * as sourceApi from './generated/source-controller/source-controller'
import * as toolApi from './generated/tool-controller/tool-controller'
import * as trainingMaterialApi from './generated/training-material-controller/training-material-controller'
import type {
  MarketplaceActorPayload,
  MarketplaceExternalId,
  MarketplaceItemPayload,
} from '../payloads'

const SEARCH_PAGE_SIZE = 20

export interface MarketplaceItem {
  persistentId: string
  category?: string
  label: string
  status?: string
  accessibleAt?: string[]
  externalIds?: MarketplaceExternalId[]
}

export interface MarketplaceActor {
  id: number
  name: string
  externalIds?: MarketplaceExternalId[]
}

export interface MarketplaceSource {
  id: number
  label: string
  url: string
}

export interface MarketplaceClientConfig {
  apiUrl: string
  username: string
  password: string
}

export interface MarketplaceClient {
  findSource: (url: string) => Promise<MarketplaceSource | null>
  createSource: (
    label: string,
    url: string,
    urlTemplate: string,
  ) => Promise<MarketplaceSource>
  getSourceItems: (
    sourceId: number,
    sourceItemId: string,
  ) => Promise<MarketplaceItem[]>
  searchItems: (
    query: string,
    category: MarketplaceCategory,
  ) => Promise<MarketplaceItem[]>
  getItem: (
    category: MarketplaceCategory,
    persistentId: string,
    approved: boolean,
  ) => Promise<MarketplaceItem | null>
  createItem: (
    category: MarketplaceCategory,
    payload: MarketplaceItemPayload,
  ) => Promise<MarketplaceItem>
  updateItem: (
    category: MarketplaceCategory,
    persistentId: string,
    payload: MarketplaceItemPayload,
  ) => Promise<MarketplaceItem>
  deleteItem: (
    category: MarketplaceCategory,
    persistentId: string,
  ) => Promise<void>
  searchActors: (query: string) => Promise<MarketplaceActor[]>
  createActor: (payload: MarketplaceActorPayload) => Promise<MarketplaceActor>
  updateActor: (
    actorId: number,
    payload: MarketplaceActorPayload,
  ) => Promise<MarketplaceActor>
  deleteActor: (actorId: number) => Promise<void>
  conceptExists: (vocabulary: string, code: string) => Promise<boolean>
  findConcept: (
    propertyType: string,
    label: string,
  ) => Promise<{ code: string; vocabulary: string } | null>
}

type ExternalIdDto = {
  identifierService?: { code?: string }
  identifier?: string
}

type ItemDto = {
  persistentId?: string
  category?: string
  label?: string
  status?: string
  accessibleAt?: string[]
  externalIds?: ExternalIdDto[]
}

type ActorResponse = {
  id?: number
  name?: string
  externalIds?: ExternalIdDto[]
}

function toExternalIds(
  externalIds: ExternalIdDto[] | undefined,
): MarketplaceExternalId[] {
  return (externalIds ?? []).flatMap(({ identifierService, identifier }) =>
    identifierService?.code && identifier
      ? [{ identifierService: { code: identifierService.code }, identifier }]
      : [],
  )
}

function toItem(dto: ItemDto): MarketplaceItem {
  if (!dto.persistentId || dto.label === undefined) {
    throw new Error(
      `Marketplace item response is missing persistentId or label: ${JSON.stringify(dto)}`,
    )
  }
  return {
    persistentId: dto.persistentId,
    category: dto.category,
    label: dto.label,
    status: dto.status,
    accessibleAt: dto.accessibleAt,
    externalIds: toExternalIds(dto.externalIds),
  }
}

function toActor(dto: ActorResponse): MarketplaceActor {
  if (dto.id === undefined || dto.name === undefined) {
    throw new Error(
      `Marketplace actor response is missing id or name: ${JSON.stringify(dto)}`,
    )
  }
  return {
    id: dto.id,
    name: dto.name,
    externalIds: toExternalIds(dto.externalIds),
  }
}

function toSource(dto: SourceDto): MarketplaceSource {
  if (dto.id === undefined || !dto.label || !dto.url) {
    throw new Error(
      `Marketplace source response is missing id, label or url: ${JSON.stringify(dto)}`,
    )
  }
  return { id: dto.id, label: dto.label, url: dto.url }
}

async function orNull<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request
  } catch (error) {
    if (error instanceof MarketplaceApiError && error.status === 404) {
      return null
    }
    throw error
  }
}

export async function createMarketplaceClient({
  apiUrl,
  username,
  password,
}: MarketplaceClientConfig): Promise<MarketplaceClient> {
  const signInPath = getSignInUrl()
  const signIn = await fetch(`${apiUrl.replace(/\/+$/, '')}${signInPath}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const authorization = signIn.headers.get('authorization')
  if (!signIn.ok || !authorization) {
    throw new MarketplaceApiError(
      signIn.status,
      'POST',
      signInPath,
      await signIn.text(),
    )
  }

  const options: MarketplaceRequestInit = { apiUrl, authorization }

  const categories = {
    'tool-or-service': {
      get: async (persistentId: string, approved: boolean) =>
        ToolDto.parse(
          await toolApi.getTool(persistentId, { approved }, options),
        ),
      create: async (payload: MarketplaceItemPayload) =>
        ToolDto.parse(
          await toolApi.createTool(
            ToolCore.parse(payload),
            { draft: false },
            options,
          ),
        ),
      update: async (persistentId: string, payload: MarketplaceItemPayload) =>
        ToolDto.parse(
          await toolApi.updateTool(
            persistentId,
            ToolCore.parse(payload),
            { draft: false },
            options,
          ),
        ),
      delete: (persistentId: string) =>
        toolApi.deleteTool(persistentId, undefined, options),
    },
    dataset: {
      get: async (persistentId: string, approved: boolean) =>
        DatasetDto.parse(
          await datasetApi.getDataset(persistentId, { approved }, options),
        ),
      create: async (payload: MarketplaceItemPayload) =>
        DatasetDto.parse(
          await datasetApi.createDataset(
            DatasetCore.parse(payload),
            { draft: false },
            options,
          ),
        ),
      update: async (persistentId: string, payload: MarketplaceItemPayload) =>
        DatasetDto.parse(
          await datasetApi.updateDataset(
            persistentId,
            DatasetCore.parse(payload),
            { draft: false },
            options,
          ),
        ),
      delete: (persistentId: string) =>
        datasetApi.deleteDataset(persistentId, undefined, options),
    },
    'training-material': {
      get: async (persistentId: string, approved: boolean) =>
        TrainingMaterialDto.parse(
          await trainingMaterialApi.getTrainingMaterial(
            persistentId,
            { approved },
            options,
          ),
        ),
      create: async (payload: MarketplaceItemPayload) =>
        TrainingMaterialDto.parse(
          await trainingMaterialApi.createTrainingMaterial(
            TrainingMaterialCore.parse(payload),
            { draft: false },
            options,
          ),
        ),
      update: async (persistentId: string, payload: MarketplaceItemPayload) =>
        TrainingMaterialDto.parse(
          await trainingMaterialApi.updateTrainingMaterial(
            persistentId,
            TrainingMaterialCore.parse(payload),
            { draft: false },
            options,
          ),
        ),
      delete: (persistentId: string) =>
        trainingMaterialApi.deleteTrainingMaterial(
          persistentId,
          undefined,
          options,
        ),
    },
    publication: {
      get: async (persistentId: string, approved: boolean) =>
        PublicationDto.parse(
          await publicationApi.getPublication(
            persistentId,
            { approved },
            options,
          ),
        ),
      create: async (payload: MarketplaceItemPayload) =>
        PublicationDto.parse(
          await publicationApi.createPublication(
            PublicationCore.parse(payload),
            { draft: false },
            options,
          ),
        ),
      update: async (persistentId: string, payload: MarketplaceItemPayload) =>
        PublicationDto.parse(
          await publicationApi.updatePublication(
            persistentId,
            PublicationCore.parse(payload),
            { draft: false },
            options,
          ),
        ),
      delete: (persistentId: string) =>
        publicationApi.deletePublication(persistentId, undefined, options),
    },
  } satisfies Record<MarketplaceCategory, unknown>

  const conceptCache = new Map<string, Promise<boolean>>()

  return {
    async findSource(url) {
      const { sources } = PaginatedSources.parse(
        await sourceApi.getSources({ q: url }, options),
      )
      const source = (sources ?? []).find((candidate) => candidate.url === url)
      return source ? toSource(source) : null
    },

    async createSource(label, url, urlTemplate) {
      return toSource(
        SourceDto.parse(
          await sourceApi.createSource(
            SourceCore.parse({ label, url, urlTemplate }),
            options,
          ),
        ),
      )
    },

    async getSourceItems(sourceId, sourceItemId) {
      const result = await orNull(
        sourceApi.getItemsForSourceAndSourceItemId(
          sourceId,
          sourceItemId,
          undefined,
          options,
        ),
      )
      if (!result) {
        return []
      }
      return (PaginatedItemsBasicItemBasicDto.parse(result).items ?? []).map(
        toItem,
      )
    },

    async searchItems(query, category) {
      const { items } = PaginatedSearchItems.parse(
        await searchApi.searchItems(
          { q: query, categories: [category], perpage: SEARCH_PAGE_SIZE },
          options,
        ),
      )
      return (items ?? []).map(toItem)
    },

    async getItem(category, persistentId, approved) {
      const item = await orNull(
        categories[category].get(persistentId, approved),
      )
      return item ? toItem(item) : null
    },

    async createItem(category, payload) {
      return toItem(await categories[category].create(payload))
    },

    async updateItem(category, persistentId, payload) {
      return toItem(await categories[category].update(persistentId, payload))
    },

    async deleteItem(category, persistentId) {
      await categories[category].delete(persistentId)
    },

    async searchActors(query) {
      const { actors } = PaginatedSearchActor.parse(
        await searchApi.searchActors(
          { q: query, perpage: SEARCH_PAGE_SIZE },
          options,
        ),
      )
      return (actors ?? []).map(toActor)
    },

    async createActor(payload) {
      return toActor(
        ActorDto.parse(
          await actorApi.createActor(ActorCore.parse(payload), options),
        ),
      )
    },

    async updateActor(actorId, payload) {
      return toActor(
        ActorDto.parse(
          await actorApi.updateActor(
            actorId,
            ActorCore.parse(payload),
            options,
          ),
        ),
      )
    },

    async deleteActor(actorId) {
      await actorApi.deleteActor(actorId, undefined, options)
    },

    conceptExists(vocabulary, code) {
      const key = `${vocabulary}\n${code}`
      let exists = conceptCache.get(key)
      if (!exists) {
        exists = orNull(conceptApi.getConcept(vocabulary, code, options)).then(
          (concept) =>
            concept !== null && ConceptDto.parse(concept).code === code,
        )
        conceptCache.set(key, exists)
      }
      return exists
    },

    async findConcept(propertyType, label) {
      const { concepts } = PaginatedSearchConcepts.parse(
        await searchApi.searchConcepts(
          { q: label, types: [propertyType] },
          options,
        ),
      )
      const normalized = label.trim().toLowerCase()
      const concept = (concepts ?? []).find(
        (candidate) =>
          candidate.label?.trim().toLowerCase() === normalized ||
          candidate.code?.toLowerCase() === normalized,
      )
      return concept?.code && concept.vocabulary?.code
        ? { code: concept.code, vocabulary: concept.vocabulary.code }
        : null
    },
  }
}
