import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { createConnection } from 'mongoose'

/** @typedef {import('../src/models/entity.ts').Entity} Entity */

const ENTITY_COUNT = 5
const CREATED_BY = 'idhi:user:mockseed'
const INVITE_ID = 'idhi:invite:mockseed'
const INVITE_EMAIL = 'reallyliri@gmail.com'
const INVITE_EXPIRY_DAYS = 30
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000
const MOCK_IMAGE = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" rx="20" fill="#312e81"/><circle cx="80" cy="90" r="48" fill="#818cf8"/><path d="M150 58h118v16H150zm0 32h86v16h-86zm0 32h104v16H150z" fill="#e0e7ff"/></svg>',
).toString('base64')

function entityId(kind, index) {
  return `idhi:${kind}:${String(index + 1).padStart(4, '0')}mock`
}

function ids(kind) {
  return Array.from({ length: ENTITY_COUNT }, (_, index) =>
    entityId(kind, index),
  )
}

function localized(value, index) {
  return [
    { language: 'en', value: `${value} ${index + 1}` },
    { language: 'he', value: `${value} לדוגמה ${index + 1}` },
  ]
}

function related(values, index) {
  return values[index % values.length]
}

function image(index) {
  return index % 3 === 0 ? MOCK_IMAGE : undefined
}

function auditTimestamps(index) {
  const createdAt = new Date(
    Date.UTC(
      2018 + (index % 6),
      (index * 7) % 12,
      1 + ((index * 11) % 27),
      (index * 5) % 24,
      (index * 13) % 60,
      (index * 17) % 60,
    ),
  )
  const modifiedAt = new Date(
    createdAt.getTime() +
      (3 + ((index * 37) % 540)) * DAY_IN_MILLISECONDS +
      ((index * 43) % 24) * 60 * 60 * 1000 +
      ((index * 47) % 60) * 60 * 1000,
  )

  return {
    createdAt: createdAt.toISOString(),
    modifiedAt: modifiedAt.toISOString(),
  }
}

const personIds = ids('person')
const organizationIds = ids('organization')
const facilityIds = ids('facility')
const projectIds = ids('project')
const toolIds = ids('tool')
const serviceIds = ids('service')
const publicationIds = ids('publication')
const eventIds = ids('event')
const datasetIds = ids('dataset')
const trainingMaterialIds = ids('training_material')

/** @type {Entity[]} */
export const entities = [
  ...organizationIds.map((id, index) => ({
    id,
    type: 'idhi:Organization',
    name: localized('Mock DH Organization', index),
    description: localized('An organization created for local testing', index),
    organization_type: [
      'ACADEMIC_INSTITUTION',
      'GLAM_INSTITUTION',
      'RESEARCH_CENTER',
      'FUNDER',
      'NON_PROFIT',
    ][index],
    parent_organization: index === 0 ? null : organizationIds[0],
    location: localized('Jerusalem', index),
    contact_email: `organization${index + 1}@example.test`,
    homepage: `https://example.test/organizations/${index + 1}`,
    image: image(index),
    marketplace_sync: index % 2 === 0,
    tags: ['mock-data', 'digital-humanities'],
  })),
  ...personIds.map((id, index) => ({
    id,
    type: 'idhi:Person',
    given_name: localized('Mock', index),
    family_name: localized('Researcher', index),
    description: localized('A researcher created for local testing', index),
    emails: [`researcher${index + 1}@example.test`],
    affiliations: [
      {
        member: id,
        organization: related(organizationIds, index),
        affiliation_role: index === 0 ? 'PROFESSOR' : 'MEMBER',
        start_date: `202${index}-01-01`,
      },
    ],
    project_participations: [
      {
        participant: id,
        project: related(projectIds, index),
        participation_role:
          index === 0 ? 'PRINCIPAL_INVESTIGATOR' : 'RESEARCHER',
        start_date: `202${index}-02-01`,
      },
    ],
    authorships: [
      {
        author: id,
        publication: related(publicationIds, index),
        author_order: 1,
        authorship_role: 'AUTHOR',
      },
    ],
    homepage: `https://example.test/people/${index + 1}`,
    image: image(index + 1),
    tags: ['mock-data', index % 2 === 0 ? 'history' : 'linguistics'],
  })),
  ...toolIds.map((id, index) => ({
    id,
    type: 'idhi:Tool',
    name: localized('Mock Research Tool', index),
    description: localized('A reusable tool created for local testing', index),
    tool_type: index % 2 === 0 ? 'WEB_APPLICATION' : 'COMMAND_LINE_TOOL',
    digital_humanities_activities: [
      'tadirah:contextualizing',
      'tadirah:dataVisualization',
    ],
    license: index % 2 === 0 ? 'MIT' : 'GPL_3_0',
    programming_language: index % 2 === 0 ? 'TypeScript' : 'Python',
    code_repository: `https://example.test/tools/${index + 1}/source`,
    documentation_url: `https://example.test/tools/${index + 1}/docs`,
    homepage: `https://example.test/tools/${index + 1}`,
    image: image(index + 2),
    tags: ['mock-data', 'research-software'],
  })),
  ...serviceIds.map((id, index) => ({
    id,
    type: 'idhi:Service',
    name: localized('Mock DH Service', index),
    description: localized(
      'A research service created for local testing',
      index,
    ),
    service_type:
      index % 2 === 0 ? 'DIGITIZATION_SERVICE' : 'CONSULTING_SERVICE',
    provider: related(organizationIds, index),
    digital_humanities_activities: [
      'tadirah:capturing',
      'tadirah:contextualizing',
    ],
    contact_email: `service${index + 1}@example.test`,
    documentation_url: `https://example.test/services/${index + 1}/docs`,
    homepage: `https://example.test/services/${index + 1}`,
    image: image(index),
    tags: ['mock-data', 'research-service'],
  })),
  ...facilityIds.map((id, index) => ({
    id,
    type: 'idhi:Facility',
    name: localized('Mock Digital Lab', index),
    description: localized('A facility created for local testing', index),
    facility_affiliations: [
      {
        facility: id,
        organization: related(organizationIds, index),
        start_date: `202${index}-01-01`,
      },
    ],
    services_offered: [related(serviceIds, index)],
    tools_provided: [related(toolIds, index)],
    location: localized('Jerusalem', index),
    address: localized('1 Mock Street', index),
    contact_email: `facility${index + 1}@example.test`,
    homepage: `https://example.test/facilities/${index + 1}`,
    image: image(index + 1),
    tags: ['mock-data', 'laboratory'],
  })),
  ...eventIds.map((id, index) => ({
    id,
    type: 'idhi:Event',
    name: localized('Mock DH Event', index),
    description: localized(
      'A scholarly event created for local testing',
      index,
    ),
    event_type: [
      'CONFERENCE',
      'WORKSHOP',
      'SEMINAR',
      'HACKATHON',
      'EXHIBITION',
    ][index],
    start_date: `2025-0${index + 1}-10`,
    end_date: `2025-0${index + 1}-11`,
    location: localized('Tel Aviv', index),
    address: localized('10 Example Avenue', index),
    homepage: `https://example.test/events/${index + 1}`,
    image: image(index + 2),
    tags: ['mock-data', 'event'],
  })),
  ...publicationIds.map((id, index) => ({
    id,
    type: 'idhi:Publication',
    name: localized('Mock DH Publication', index),
    description: localized('A publication created for local testing', index),
    publication_type: 'coar:c_6501',
    authorships: [
      {
        author: related(personIds, index),
        publication: id,
        author_order: 1,
        authorship_role: 'AUTHOR',
      },
    ],
    presented_at: [related(eventIds, index)],
    publisher: related(organizationIds, index),
    date_issued: `202${index}-06-01`,
    doi: `https://doi.org/10.5555/mock.${index + 1}`,
    homepage: `https://example.test/publications/${index + 1}`,
    image: image(index),
    tags: ['mock-data', 'publication'],
  })),
  ...datasetIds.map((id, index) => ({
    id,
    type: 'idhi:Dataset',
    name: localized('Mock Research Dataset', index),
    description: localized('A dataset created for local testing', index),
    themes: localized(
      index % 2 === 0 ? 'Cultural heritage' : 'Historical texts',
      index,
    ),
    datasets: index === 0 ? datasetIds.slice(1) : null,
    publisher: related(organizationIds, index),
    license: index % 2 === 0 ? 'CC_BY_4_0' : 'CC0_1_0',
    date_issued: `202${index}-07-01`,
    distribution_url: `https://example.test/datasets/${index + 1}/download`,
    homepage: `https://example.test/datasets/${index + 1}`,
    image: image(index + 1),
    tags: ['mock-data', 'open-data'],
  })),
  ...trainingMaterialIds.map((id, index) => ({
    id,
    type: 'idhi:TrainingMaterial',
    name: localized('Mock DH Tutorial', index),
    description: localized(
      'Training material created for local testing',
      index,
    ),
    training_material_type: index % 2 === 0 ? 'TUTORIAL' : 'WORKSHOP_MATERIAL',
    creators: [related(personIds, index), related(organizationIds, index)],
    publisher: related(organizationIds, index),
    related_tools: [related(toolIds, index)],
    related_services: [related(serviceIds, index)],
    related_datasets: [related(datasetIds, index)],
    part_of_training_material: index === 0 ? null : trainingMaterialIds[0],
    digital_humanities_activities: ['tadirah:contextualizing'],
    educational_level: localized(
      index % 2 === 0 ? 'Beginner' : 'Intermediate',
      index,
    ),
    target_audiences: localized('Researchers and students', index),
    learning_outcomes: localized('Analyze a small humanities dataset', index),
    prerequisites: localized('Basic computer literacy', index),
    in_languages: ['en', 'he'],
    license: 'CC_BY_4_0',
    date_issued: `202${index}-08-01`,
    media_type: 'text/html',
    material_url: `https://example.test/training/${index + 1}/start`,
    homepage: `https://example.test/training/${index + 1}`,
    image: image(index + 2),
    tags: ['mock-data', 'training'],
  })),
  ...projectIds.map((id, index) => ({
    id,
    type: 'idhi:Project',
    name: localized('Mock Digital Humanities Project', index),
    description: localized(
      'A connected research project created for local testing',
      index,
    ),
    organization_roles: [
      {
        organization: related(organizationIds, index),
        project: id,
        org_project_role: 'COORDINATOR',
        start_date: `202${index}-01-01`,
      },
    ],
    project_participations: [
      {
        participant: related(personIds, index),
        project: id,
        participation_role:
          index === 0 ? 'PRINCIPAL_INVESTIGATOR' : 'RESEARCHER',
        start_date: `202${index}-02-01`,
      },
    ],
    funding: [
      {
        funding_organization: related(organizationIds, index + 1),
        funding_amount: 100000 + index * 25000,
      },
    ],
    outputs_tools: [related(toolIds, index)],
    outputs_datasets: [related(datasetIds, index)],
    outputs_publications: [related(publicationIds, index)],
    outputs_training_materials: [related(trainingMaterialIds, index)],
    digital_humanities_activities: [
      'tadirah:contextualizing',
      'tadirah:dataVisualization',
    ],
    research_disciplines: localized(
      index % 2 === 0 ? 'History' : 'Linguistics',
      index,
    ),
    studied_places: localized('Levant', index),
    studied_periods: localized('Twentieth century', index),
    start_date: `202${index}-01-01`,
    end_date: index === ENTITY_COUNT - 1 ? null : `202${index + 2}-12-31`,
    homepage: `https://example.test/projects/${index + 1}`,
    image: image(index),
    tags: ['mock-data', 'research-project'],
  })),
]

function appendSearchValues(value, values) {
  if (value === null || value === undefined) return
  if (Array.isArray(value)) {
    for (const item of value) appendSearchValues(item, values)
    return
  }
  if (typeof value === 'object') {
    for (const nestedValue of Object.values(value))
      appendSearchValues(nestedValue, values)
    return
  }
  values.push(String(value))
}

function toStoredEntity(entity, index) {
  const { id, ...values } = entity
  const { createdAt, modifiedAt } = auditTimestamps(index)
  const audit = {
    createdAt,
    createdBy: CREATED_BY,
    modifiedAt,
    modifiedBy: CREATED_BY,
  }
  const searchableEntity = { id, ...values, audit }
  const searchValues = []
  appendSearchValues(searchableEntity, searchValues)
  return { _id: id, ...values, audit, _s: searchValues.join(' ') }
}

function importCollection(
  connectionString,
  databaseName,
  collection,
  documents,
) {
  const result = spawnSync(
    'mongoimport',
    [
      '--uri',
      connectionString,
      '--db',
      databaseName,
      '--collection',
      collection,
      '--jsonArray',
    ],
    {
      input: JSON.stringify(documents),
      stdio: ['pipe', 'inherit', 'inherit'],
    },
  )

  if (result.error) {
    console.error(`Could not run mongoimport: ${result.error.message}`)
    process.exit(1)
  }

  if (result.status !== 0) process.exit(result.status ?? 1)
}

async function dropDatabase(connectionString, databaseName) {
  const connection = await createConnection(connectionString, {
    bufferCommands: false,
    dbName: databaseName,
  }).asPromise()

  try {
    await connection.dropDatabase()
  } finally {
    await connection.close()
  }
}

async function main() {
  const connectionString = process.env.MONGODB_CONNECTION_STRING
  const databaseName = process.env.MONGODB_DATABASE_NAME

  if (!connectionString || !databaseName) {
    console.error(
      'MONGODB_CONNECTION_STRING and MONGODB_DATABASE_NAME must be set (server/.env.local is loaded automatically).',
    )
    process.exit(1)
  }

  await dropDatabase(connectionString, databaseName)

  const documents = entities.map(toStoredEntity)
  const now = new Date()
  const importedAt = now.toISOString()
  const invite = {
    _id: INVITE_ID,
    email: INVITE_EMAIL,
    expiration: new Date(
      now.getTime() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString(),
    audit: {
      createdAt: importedAt,
      createdBy: CREATED_BY,
      modifiedAt: importedAt,
      modifiedBy: CREATED_BY,
    },
  }

  importCollection(connectionString, databaseName, 'entities', documents)
  importCollection(connectionString, databaseName, 'userInvites', [invite])

  console.log(
    `Imported ${documents.length} linked mock entities (${ENTITY_COUNT} of each type) and an invite for ${INVITE_EMAIL}.`,
  )
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main()
}
