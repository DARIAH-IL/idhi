# Israeli Digital Humanities Index

<p>
  <a href="https://idh-index.org/"><img src="app/public/logo.png" alt="IDHI logo" height="90"></a>
  &nbsp;&nbsp;&nbsp;
  <img src="app/public/dariah-il.png" alt="DARIAH-IL logo" height="90">
</p>

The Israeli Digital Humanities Index (IDHI) is a searchable catalogue of digital humanities research, resources, and expertise across Israel. It is available at [idh-index.org](https://idh-index.org/).

## Components

- `openapi.yaml` — canonical API contract used by Orval to generate client and server types.
- `app/` — React and Vite web application.
- `server/` — Hono API and MCP server deployed as a Cloudflare Worker, backed by MongoDB.

## Data model

The [IDHI Manifests documentation](https://dariah-il.github.io/idhi-manifests/) describes the canonical semantic model: entities, fields, relationships, controlled vocabularies, and mappings to established web ontologies. It is central to interoperability and data quality; its [generated JSON Schema](https://raw.githubusercontent.com/DARIAH-IL/idhi-manifests/refs/tags/v1.2.0/gen/idhi.schema.json) is imported by `openapi.yaml`, keeping API validation and generated client/server types aligned. See the [LinkML source](https://github.com/DARIAH-IL/idhi-manifests/blob/v1.2.0/idhi.linkml.yaml) and [manifest repository](https://github.com/DARIAH-IL/idhi-manifests).

## Quick start

Requires Node.js, pnpm, and MongoDB. Install dependencies:

```sh
pnpm install
```

Create `server/.env.local` as described in the [server README](server/README.md#environment), which also covers test data, database backups, MCP testing, and email sending.

To run either the server or the app:

```sh
pnpm dev:server
pnpm dev:app
```

Web app is available at <http://localhost:3000>; the API is available at <http://localhost:8787>.
