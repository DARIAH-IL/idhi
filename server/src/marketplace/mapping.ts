import type { MarketplaceCategory } from '../db/services/marketplace'
import type { Entity, Organization, Person } from '../models'
import { preferredLangStringValue } from '../utils/langString'
import type { LangString } from '../utils/langString'
import type {
  MarketplaceActorPayload,
  MarketplaceContributor,
  MarketplaceExternalId,
  MarketplaceItemPayload,
  MarketplaceProperty,
  MarketplaceRelatedItem,
} from './payloads'

export type ActorEntity = Person | Organization

export interface MappingContext {
  language: string
  sourceId: number
  resolveActor: (entityId: string) => Promise<number | undefined>
  resolveItem: (entityId: string) => string | undefined
  conceptExists: (vocabulary: string, code: string) => Promise<boolean>
  findConcept: (
    propertyType: string,
    label: string,
  ) => Promise<{ code: string; vocabulary: string } | null>
}

export type ItemPayloadResult =
  { payload: MarketplaceItemPayload } | { skipped: string }

const LICENSE_CODES = {
  CC_BY_4_0: 'CC-BY-4.0',
  CC_BY_SA_4_0: 'CC-BY-SA-4.0',
  CC0_1_0: 'CC0-1.0',
  MIT: 'MIT',
  APACHE_2_0: 'Apache-2.0',
  GPL_3_0: 'GPL-3.0-only',
} as const

const MODE_OF_USE_CODES: Record<string, string | undefined> = {
  WEB_APPLICATION: 'webApplication',
  DESKTOP_APPLICATION: 'localApplication',
  LIBRARY: 'library',
  COMMAND_LINE_TOOL: 'commandLine',
  API_SERVICE: 'restfulWebservice',
}

const CONTRIBUTION_ROLE_CODES: Record<string, string> = {
  CREATOR: 'creator',
  DEVELOPER: 'programmer',
  MAINTAINER: 'contributor',
  DATA_CURATOR: 'curator',
  CONTRIBUTOR: 'contributor',
  AUTHOR: 'author',
  EDITOR: 'editor',
  TRANSLATOR: 'contributor',
}

const PUBLICATION_TYPE_CODES: Record<string, string | undefined> = {
  'coar:c_6501': 'Article',
  'coar:c_2df8fbb1': 'Article',
  'coar:c_dcae04bc': 'Article',
  'coar:c_beb9': 'Article',
  'coar:c_0640': 'Journal',
  'coar:c_2f33': 'Book',
  'coar:c_3248': 'Book',
  'coar:c_5794': 'Conference',
  'coar:c_c94f': 'Conference',
  'coar:c_f744': 'Conference',
  'coar:c_18cp': 'Conference',
  'coar:c_816b': 'Pre-Print',
}

const ISO_639_3_CODES: Record<string, string | undefined> = {
  am: 'amh',
  ar: 'ara',
  arc: 'arc',
  cs: 'ces',
  da: 'dan',
  de: 'deu',
  el: 'ell',
  en: 'eng',
  es: 'spa',
  fa: 'fas',
  fi: 'fin',
  fr: 'fra',
  grc: 'grc',
  he: 'heb',
  hbo: 'hbo',
  hu: 'hun',
  it: 'ita',
  ja: 'jpn',
  la: 'lat',
  lad: 'lad',
  nl: 'nld',
  no: 'nor',
  pl: 'pol',
  pt: 'por',
  ro: 'ron',
  ru: 'rus',
  sv: 'swe',
  syc: 'syc',
  tr: 'tur',
  uk: 'ukr',
  yi: 'yid',
  zh: 'zho',
}

export function marketplaceCategory(
  entity: Entity,
): MarketplaceCategory | undefined {
  switch (entity.type) {
    case 'idhi:Tool':
    case 'idhi:Service':
      return 'tool-or-service'
    case 'idhi:Dataset':
      return 'dataset'
    case 'idhi:TrainingMaterial':
      return 'training-material'
    case 'idhi:Publication':
      return 'publication'
    default:
      return undefined
  }
}

export function isActorEntity(entity: Entity): entity is ActorEntity {
  return entity.type === 'idhi:Person' || entity.type === 'idhi:Organization'
}

export function marketplacePermalink(
  marketplaceUrl: string,
  category: MarketplaceCategory,
  persistentId: string,
): string {
  return `${marketplaceUrl.replace(/\/+$/, '')}/${category}/${persistentId}`
}

function unique<T>(values: T[], key: (value: T) => string): T[] {
  const seen = new Set<string>()
  return values.filter((value) => {
    const id = key(value)
    if (seen.has(id)) {
      return false
    }
    seen.add(id)
    return true
  })
}

function text(
  values: LangString[] | null | undefined,
  language: string,
): string | undefined {
  return values?.length ? preferredLangStringValue(values, language) : undefined
}

function urls(...values: (string | null | undefined)[]): string[] {
  return unique(
    values.flatMap((value) => {
      const trimmed = value?.trim()
      return trimmed ? [trimmed] : []
    }),
    (value) => value,
  )
}

function doiExternalId(doi: string | null | undefined) {
  const identifier = doi?.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').trim()
  return identifier ? [{ identifierService: { code: 'doi' }, identifier }] : []
}

function sameAsExternalIds(
  sameAs: string[] | null | undefined,
): MarketplaceExternalId[] {
  return (sameAs ?? []).flatMap((uri) => {
    const wikidata = uri.match(/wikidata\.org\/(?:wiki|entity)\/(Q\d+)/i)?.[1]
    if (wikidata) {
      return [{ identifierService: { code: 'Wikidata' }, identifier: wikidata }]
    }
    const handle = uri.match(/^https?:\/\/hdl\.handle\.net\/(.+)$/i)?.[1]
    if (handle) {
      return [{ identifierService: { code: 'hdl' }, identifier: handle }]
    }
    return []
  })
}

function gitHubRepository(url: string | null | undefined): string | undefined {
  return url
    ?.match(/^https?:\/\/(?:www\.)?github\.com\/([^/?#]+\/[^/?#]+)/i)?.[1]
    ?.replace(/\.git$/i, '')
}

function stringProperty(code: string, value: string | undefined) {
  return value ? [{ type: { code }, value }] : []
}

async function conceptProperties(
  context: MappingContext,
  code: string,
  vocabulary: string,
  concepts: (string | undefined)[],
): Promise<MarketplaceProperty[]> {
  const properties: MarketplaceProperty[] = []
  for (const concept of unique(
    concepts.filter((value): value is string => !!value),
    (value) => value,
  )) {
    if (await context.conceptExists(vocabulary, concept)) {
      properties.push({
        type: { code },
        concept: { code: concept, vocabulary: { code: vocabulary } },
      })
    }
  }
  return properties
}

async function keywordProperties(
  context: MappingContext,
  tags: string[] | null | undefined,
): Promise<MarketplaceProperty[]> {
  const properties: MarketplaceProperty[] = []
  for (const tag of unique(tags ?? [], (value) => value.toLowerCase())) {
    const concept = await context.findConcept('keyword', tag)
    if (concept) {
      properties.push({
        type: { code: 'keyword' },
        concept: {
          code: concept.code,
          vocabulary: { code: concept.vocabulary },
        },
      })
    }
  }
  return properties
}

function languageCode(tag: string): string | undefined {
  const primary = tag.split('-')[0]?.toLowerCase()
  if (!primary) {
    return undefined
  }
  return (
    ISO_639_3_CODES[primary] ?? (primary.length === 3 ? primary : undefined)
  )
}

function mediaTypeCode(mediaType: string): string {
  return mediaType.trim().toLowerCase().replace('/', 'slash')
}

async function contributors(
  context: MappingContext,
  entries: { entityId: string; role: string }[],
): Promise<MarketplaceContributor[]> {
  const result: MarketplaceContributor[] = []
  for (const { entityId, role } of entries) {
    const actorId = await context.resolveActor(entityId)
    if (actorId !== undefined) {
      result.push({ actor: { id: actorId }, role: { code: role } })
    }
  }
  return unique(result, ({ actor, role }) => `${actor.id}:${role.code}`)
}

function relatedItems(
  context: MappingContext,
  entries: { entityId: string | null | undefined; relation: string }[],
): MarketplaceRelatedItem[] {
  return unique(
    entries.flatMap(({ entityId, relation }) => {
      const persistentId = entityId ? context.resolveItem(entityId) : undefined
      return persistentId
        ? [{ persistentId, relation: { code: relation } }]
        : []
    }),
    ({ persistentId }) => persistentId,
  )
}

function references(
  ids: string[] | null | undefined,
  relation: string,
): { entityId: string; relation: string }[] {
  return (ids ?? []).map((entityId) => ({ entityId, relation }))
}

export async function buildItemPayload(
  entity: Entity,
  context: MappingContext,
): Promise<ItemPayloadResult> {
  const label =
    'name' in entity ? text(entity.name, context.language) : undefined
  const description =
    'description' in entity
      ? text(entity.description, context.language)
      : undefined

  if (!label) {
    return { skipped: 'missing name' }
  }
  if (!description) {
    return { skipped: 'missing description' }
  }

  const common = {
    label,
    description,
    source: { id: context.sourceId },
    sourceItemId: entity.id,
  }
  const activities = async (values: string[] | null | undefined) =>
    conceptProperties(
      context,
      'activity',
      'tadirah2',
      (values ?? []).map((value) => value.replace(/^tadirah:/, '')),
    )
  const license = async (value: keyof typeof LICENSE_CODES | undefined) =>
    conceptProperties(context, 'license', 'software-license', [
      value ? LICENSE_CODES[value] : undefined,
    ])
  const languages = async (values: string[] | null | undefined) =>
    conceptProperties(
      context,
      'language',
      'iso-639-3',
      (values ?? []).map(languageCode),
    )
  const formats = async (values: string[]) =>
    conceptProperties(
      context,
      'object-format',
      'iana-media-type',
      values.map(mediaTypeCode),
    )
  const modeOfUse = async (value: string | undefined) =>
    conceptProperties(context, 'mode-of-use', 'invocation-type', [
      value ? MODE_OF_USE_CODES[value] : undefined,
    ])

  switch (entity.type) {
    case 'idhi:Tool': {
      const repository = gitHubRepository(entity.code_repository)
      return {
        payload: {
          ...common,
          accessibleAt: urls(entity.homepage),
          externalIds: [
            ...doiExternalId(entity.doi),
            ...(repository
              ? [
                  {
                    identifierService: { code: 'GitHub' },
                    identifier: repository,
                  },
                ]
              : []),
            ...sameAsExternalIds(entity.same_as),
          ],
          contributors: await contributors(
            context,
            (entity.resource_contributions ?? []).map((contribution) => ({
              entityId: contribution.contributor,
              role:
                CONTRIBUTION_ROLE_CODES[
                  contribution.resource_contribution_role
                ] ?? 'contributor',
            })),
          ),
          properties: [
            ...(await activities(entity.digital_humanities_activities)),
            ...(await keywordProperties(context, entity.tags)),
            ...(await license(entity.license)),
            ...(await modeOfUse(entity.tool_type)),
            ...urls(entity.documentation_url).map((value) => ({
              type: { code: 'user-manual-url' },
              value,
            })),
            ...urls(
              ...(entity.additional_urls ?? []),
              repository ? undefined : entity.code_repository,
            ).map((value) => ({ type: { code: 'see-also' }, value })),
          ],
          relatedItems: relatedItems(
            context,
            references(entity.serves_datasets, 'relates-to'),
          ),
        },
      }
    }

    case 'idhi:Service':
      return {
        payload: {
          ...common,
          accessibleAt: urls(entity.homepage),
          externalIds: sameAsExternalIds(entity.same_as),
          contributors: await contributors(
            context,
            entity.provider
              ? [{ entityId: entity.provider, role: 'provider' }]
              : [],
          ),
          properties: [
            ...(await activities(entity.digital_humanities_activities)),
            ...(await keywordProperties(context, entity.tags)),
            ...(await modeOfUse(entity.service_type)),
            ...urls(entity.documentation_url).map((value) => ({
              type: { code: 'user-manual-url' },
              value,
            })),
            ...urls(...(entity.additional_urls ?? [])).map((value) => ({
              type: { code: 'see-also' },
              value,
            })),
          ],
          relatedItems: relatedItems(
            context,
            references(entity.related_tools, 'relates-to'),
          ),
        },
      }

    case 'idhi:Dataset':
      return {
        payload: {
          ...common,
          accessibleAt: urls(entity.homepage, entity.distribution_url),
          externalIds: [
            ...doiExternalId(entity.doi),
            ...sameAsExternalIds(entity.same_as),
          ],
          contributors: await contributors(context, [
            ...(entity.resource_contributions ?? []).map((contribution) => ({
              entityId: contribution.contributor,
              role:
                CONTRIBUTION_ROLE_CODES[
                  contribution.resource_contribution_role
                ] ?? 'contributor',
            })),
            ...(entity.publisher
              ? [{ entityId: entity.publisher, role: 'provider' }]
              : []),
          ]),
          properties: [
            ...(await activities(entity.digital_humanities_activities)),
            ...(await keywordProperties(context, entity.tags)),
            ...(await license(entity.license)),
            ...(await languages(entity.in_languages)),
            ...(await formats(entity.media_type ?? [])),
          ],
          relatedItems: relatedItems(context, [
            ...references(entity.related_publications, 'relates-to'),
            ...references(entity.datasets, 'relates-to'),
            ...references(entity.derived_from, 'relates-to'),
          ]),
        },
      }

    case 'idhi:TrainingMaterial':
      return {
        payload: {
          ...common,
          accessibleAt: urls(entity.material_url, entity.homepage),
          externalIds: [
            ...doiExternalId(entity.doi),
            ...sameAsExternalIds(entity.same_as),
          ],
          contributors: await contributors(context, [
            ...(entity.creators ?? []).map((entityId) => ({
              entityId,
              role: 'creator',
            })),
            ...(entity.publisher
              ? [{ entityId: entity.publisher, role: 'provider' }]
              : []),
          ]),
          properties: [
            ...(await activities(entity.digital_humanities_activities)),
            ...(await keywordProperties(context, entity.tags)),
            ...(await license(entity.license)),
            ...(await languages(entity.in_languages)),
            ...(await formats(entity.media_type ? [entity.media_type] : [])),
            ...urls(...(entity.additional_urls ?? [])).map((value) => ({
              type: { code: 'see-also' },
              value,
            })),
          ],
          relatedItems: relatedItems(context, [
            ...references(entity.related_tools, 'documents'),
            ...references(entity.related_services, 'documents'),
            ...references(entity.related_datasets, 'relates-to'),
            ...references(
              entity.part_of_training_material
                ? [entity.part_of_training_material]
                : [],
              'relates-to',
            ),
          ]),
        },
      }

    case 'idhi:Publication': {
      const publicationType = entity.publication_type
        ? PUBLICATION_TYPE_CODES[entity.publication_type]
        : undefined
      const publishedIn = text(entity.published_in, context.language)
      return {
        payload: {
          ...common,
          accessibleAt: urls(entity.homepage),
          externalIds: [
            ...doiExternalId(entity.doi),
            ...sameAsExternalIds(entity.same_as),
          ],
          contributors: await contributors(
            context,
            [...(entity.authorships ?? [])]
              .sort(
                (left, right) =>
                  (left.author_order ?? Number.MAX_SAFE_INTEGER) -
                  (right.author_order ?? Number.MAX_SAFE_INTEGER),
              )
              .map((authorship) => ({
                entityId: authorship.author,
                role: authorship.authorship_role
                  ? (CONTRIBUTION_ROLE_CODES[authorship.authorship_role] ??
                    'author')
                  : 'author',
              })),
          ),
          properties: [
            ...(await keywordProperties(context, entity.tags)),
            ...(await conceptProperties(
              context,
              'publication-type',
              'publication-type',
              [publicationType],
            )),
            ...stringProperty(
              'publisher',
              text(entity.publisher_name, context.language),
            ),
            ...stringProperty(
              publicationType === 'Conference' ? 'conference' : 'journal',
              publicationType === 'Article' || publicationType === 'Conference'
                ? publishedIn
                : undefined,
            ),
            ...stringProperty('year', entity.date_issued?.slice(0, 4)),
          ],
          relatedItems: relatedItems(
            context,
            references(entity.part_of ? [entity.part_of] : [], 'relates-to'),
          ),
        },
      }
    }

    default:
      return { skipped: `unsupported type ${entity.type}` }
  }
}

export function actorName(
  entity: ActorEntity,
  language: string,
): string | undefined {
  if (entity.type === 'idhi:Organization') {
    return text(entity.name, language)
  }
  const name = [
    text(entity.given_name, language),
    text(entity.family_name, language),
  ]
    .filter((part) => !!part)
    .join(' ')
  return name || undefined
}

export function actorExternalIds(entity: ActorEntity): MarketplaceExternalId[] {
  const orcid =
    entity.type === 'idhi:Person'
      ? entity.orcid?.replace(/^https?:\/\/orcid\.org\//i, '')
      : undefined
  const ror =
    entity.type === 'idhi:Organization'
      ? entity.ror?.replace(/^https?:\/\/ror\.org\//i, '')
      : undefined
  return [
    ...(orcid
      ? [{ identifierService: { code: 'ORCID' }, identifier: orcid }]
      : []),
    ...(ror ? [{ identifierService: { code: 'ROR' }, identifier: ror }] : []),
    ...sameAsExternalIds(entity.same_as).filter(
      ({ identifierService }) => identifierService.code === 'Wikidata',
    ),
  ]
}

export function actorAffiliationIds(entity: ActorEntity): string[] {
  if (entity.type === 'idhi:Organization') {
    return (entity.organization_structure ?? [])
      .filter(({ end_date }) => !end_date)
      .map(({ parent_organization }) => parent_organization)
  }
  return (entity.affiliations ?? [])
    .filter(({ end_date }) => !end_date)
    .map(({ organization }) => organization)
}

export async function buildActorPayload(
  entity: ActorEntity,
  context: MappingContext,
): Promise<MarketplaceActorPayload | undefined> {
  const name = actorName(entity, context.language)
  if (!name) {
    return undefined
  }

  const affiliations: { id: number }[] = []
  for (const organizationId of unique(
    actorAffiliationIds(entity),
    (id) => id,
  )) {
    const actorId = await context.resolveActor(organizationId)
    if (actorId !== undefined) {
      affiliations.push({ id: actorId })
    }
  }

  const website = entity.homepage?.trim()
  const email =
    entity.type === 'idhi:Organization'
      ? entity.contact_email?.trim()
      : undefined

  return {
    name,
    externalIds: actorExternalIds(entity),
    ...(website ? { website } : {}),
    ...(email ? { email } : {}),
    affiliations: unique(affiliations, ({ id }) => String(id)),
  }
}
