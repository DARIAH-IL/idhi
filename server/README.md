# IDHI server

## Environment

Create `server/.env.local`:

```dotenv
FRONTEND_URL=http://localhost:3000
MONGODB_CONNECTION_STRING=mongodb://<your-mongodb-connection-string>
MONGODB_DATABASE_NAME=<your-mongodb-database-name>
JWT_SECRET=<your-jwt-secret>
SENTRY_DISABLED=true
```

## Import test data

The test-data import creates 50 linked mock records: five people, projects,
tools, services, publications, events, datasets, training materials, and ten
organizations - five institutions and five sub-organizations nested under them.
Relationships between records include affiliations, organization structure,
project participation and outputs, authorship, providers, publishers, and
training-material references.

Install the [MongoDB Database Tools](https://www.mongodb.com/docs/database-tools/installation/)
so that `mongoimport` is available, then set the target database in
`server/.env.local`:

```env
MONGODB_CONNECTION_STRING=mongodb://localhost:27017
MONGODB_DATABASE_NAME=idhi
```

From the workspace root, run:

```sh
pnpm --filter @idhi/server test-data:import
```

The script drops every collection except `users` and `userInvites`, then invokes
`mongoimport` to load the deterministic mock entities. It adds an invite for
`reallyliri@gmail.com` that expires 30 days after the import only when the
database has no users.

## Database backups

Production database backups are compressed MongoDB archives stored in the
private Cloudflare R2 bucket `idhi-db-backup`. Archive names use UTC and have
the form `idhi-backup-yyyy-MM-dd-HH-mm.archive.gz`.

The `Backup database` GitHub Actions workflow creates a backup every day at
02:00 UTC and can be manually riggered.

### Create a backup locally

Install the [MongoDB Database Tools](https://www.mongodb.com/docs/database-tools/installation/).

```sh
read -rsp 'MongoDB connection string: ' MONGODB_CONNECTION_STRING
printf '\n'

backup_name="idhi-backup-$(date -u +'%Y-%m-%d-%H-%M').archive.gz"
mongodump \
  --uri="${MONGODB_CONNECTION_STRING}" \
  --db=idhi \
  --archive="${backup_name}" \
  --gzip
unset MONGODB_CONNECTION_STRING
```

### Restore a backup

Either use a local backup, or fetch one from R2:

```sh
backup_name="idhi-backup-yyyy-MM-dd-HH-mm.archive.gz"
pnpm --filter @idhi/server exec wrangler r2 object get \
  "idhi-db-backup/${backup_name}" \
  --file "${backup_name}" \
  --remote
```

Then:

```sh
read -rsp 'Target MongoDB connection string: ' TARGET_MONGODB_CONNECTION_STRING
printf '\n'
mongorestore \
  --uri="${TARGET_MONGODB_CONNECTION_STRING}" \
  --archive="${backup_name}" \
  --gzip \
  --nsInclude='idhi.*' \
  --drop
unset TARGET_MONGODB_CONNECTION_STRING
```

## Testing MCP

The server exposes an MCP endpoint at `/mcp` with entity tools: `get_entity`
and `search_entities` are public, while `create_entity`, `update_entity`, and
`delete_entity` require signing in through the OAuth flow (served by the
frontend at `/oauth/authorize`).

Start the server (and the frontend, if testing the authenticated tools), then
launch the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```sh
npx @modelcontextprotocol/inspector
```

In the inspector UI:

1. Select the `Streamable HTTP` transport type.
2. Set the URL to `http://localhost:8787/mcp` and connect.
3. Use `List Tools` and call the public tools directly.
4. To test the write tools, use the inspector's `Open Auth Settings` /
   `Quick OAuth Flow`: it discovers the OAuth metadata from the server,
   registers a client, and opens the frontend login page in the browser.
   Sign in (OTP or passkey), approve the request, and the inspector completes
   the token exchange and attaches the bearer token to subsequent calls.

Calling a write tool without a token returns a `401` challenge, which is also
how MCP clients discover that authentication is required.

## Cloudflare Email Sending setup

The Worker sends transactional email through its `EMAIL` binding. Onboard
`idh-index.org` in Cloudflare Email Sending and configure the sender in
`server/.env.local`:

```env
EMAIL_FROM_ADDRESS=noreply@idh-index.org
```

The binding restricts sending to that address. Local development uses the
remote binding and therefore sends real email.
