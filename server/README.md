# IDHI server

## Import test data

The test-data import creates 50 linked mock records: five people, organizations,
facilities, projects, tools, services, publications, events, datasets, and
training materials. Relationships between records include affiliations, project
participation and outputs, authorship, providers, publishers, facilities, and
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
