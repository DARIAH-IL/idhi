# IDHI project guide

## Repository shape

This is a pnpm workspace with two TypeScript packages:

- `app/` is the browser application: React 19, Vite, TanStack Router, TanStack Query, Tailwind CSS, React Aria Components, and shadcn-style UI components.
- `server/` is the HTTP API: Hono running as a Cloudflare Worker through the Cloudflare Vite plugin, with MongoDB accessed through Mongoose.
- `openapi.yaml` at the workspace root is the canonical API contract shared by both packages.

Use pnpm from the workspace root. Scope package commands with `pnpm --filter @idhi/app ...` or `pnpm --filter @idhi/server ...`. Preserve package boundaries and use ESM imports throughout.

## Command execution

Do not run `pnpm`, `npm`, `npx`, `yarn`, `bun`, or similar package-manager commands unless the user explicitly directs you to run them. The same restriction applies to project scripts and tooling commands, including dependency installation, generators, development servers, builds, tests, linters, formatters, type-checkers, and database or deployment commands. Instructions elsewhere in this file describe how to run these commands when authorized; they do not constitute authorization. Read-only shell commands used to inspect the repository are allowed.

Do not compromise on the requested implementation or replace an established generator, installer, or project workflow with a hand-written workaround merely because permission to run its command is missing. Stop before making the workaround, explain which command or permission is required and why, and ask the user to authorize it. Continue only after authorization or after the user explicitly chooses an alternative approach.

## Contract-first API design

API changes start in `openapi.yaml`. It defines paths, methods, parameters, request and response bodies, reusable schemas, error shapes, and bearer-auth requirements. Do not independently duplicate or reshape the contract in app or server code.

The API is rooted at `/api/v1`. Top-level bearer authentication applies by default; an operation with `security: []` is public. Keep the specification and the server authorization policy aligned whenever routes or security requirements change.

OpenAPI tags are architectural: Orval uses `tags-split` mode, so a tag determines the generated client module and server handler group. Reuse the established PascalCase tags and give every non-default operation the appropriate tag. Stable paths and methods produce stable generated symbol names; add an explicit `operationId` when a contract needs a name that should not be derived from the route.

Prefer reusable definitions under `components` for domain models, parameters, responses, and security schemes. Model every status code and media type handlers may return. Keep required/optional fields, formats, defaults, bounds, discriminators, and nullability precise because they become TypeScript types and server-side Zod validation. Remote IDHI manifest schemas are legitimate OpenAPI inputs; both Orval configs allow external references, so generation may require network access.

## Orval generation

Orval is the only API code generator. Both packages read `../openapi.yaml` and use `orval.config.ts` in their package directory.

After every contract edit, regenerate both sides from the workspace root:

```sh
pnpm --filter @idhi/server exec orval
pnpm --filter @idhi/app exec orval
```

The `dev` and `build` scripts also run Orval before Vite. Review generated diffs together with the OpenAPI diff; unexpected broad deletion or renaming usually means a tag, path, schema name, or external reference changed.

Never hand-edit generated API artifacts. Fix `openapi.yaml`, an Orval config, or a handwritten extension point and regenerate instead.

### Server generation and handler ownership

`server/orval.config.ts` uses Orval's `hono` client in `tags-split` mode. It derives:

- `server/src/routes.ts`, the composite Hono route registration;
- `server/src/models/`, TypeScript API models;
- `server/src/handlers/<tag>/*.context.ts`, typed Hono contexts;
- `server/src/handlers/<tag>/*.zod.ts`, request and response schemas;
- `server/src/handlers/api.validator.ts`, the Hono/Zod validation adapter.

Files ending in `*.handlers.ts` are the handwritten implementation seam. The server Orval clean rule preserves them so business logic survives regeneration. When a new tag or operation creates a handler scaffold, replace scaffold behavior with real handlers but retain the exact generated export names expected by `server/src/routes.ts`. Import request data from `c.req.valid(...)` after the generated validators and type handlers with the generated context types. Do not bypass generated validation by reparsing the same payload manually.

Handler modules should stay thin: authorize the resolved user, call services, translate expected domain failures into `ApiError`, and return the status/body declared by OpenAPI. Put persistence in `server/src/db/services/`, shared infrastructure in middleware or utilities, and API error codes/shapes in the OpenAPI contract.

### Client generation and runtime ownership

`app/orval.config.ts` uses the `react-query` client with Axios in `tags-split` mode. It derives:

- `app/src/api/hooks/<tag>/`, request functions, query keys/options, query hooks, and mutation hooks;
- `app/src/api/models/`, TypeScript API models.

`app/src/api/client.ts` is the handwritten Axios mutator used by every generated request. Centralize API base URL, bearer-token attachment, transport behavior, and cross-cutting error handling there. Feature code should consume generated request functions/hooks and generated model types rather than creating parallel endpoint wrappers or handwritten wire types. Use generated query-key helpers for cache reads, invalidation, and optimistic updates.

The app generator uses `clean: true`; files placed inside generated hook/model output directories can be removed. Keep handwritten client helpers outside those generated directories.

## Server architecture and infrastructure

`server/src/index.ts` owns the root Hono application and global middleware order. Requests receive a request ID and structured logger, CORS is restricted by `SERVER_ALLOWED_HOSTS`, errors are normalized, MongoDB services are attached to the Hono context, and JWT identity/authorization is resolved before generated routes are mounted. Preserve middleware ordering when adding cross-cutting behavior.

Hono context variables are declared in `server/src/hono.d.ts`; Cloudflare environment bindings are typed in `server/src/bindings.ts`. Add a binding type whenever server code consumes a new environment value. Read required values through the validation helpers in `server/src/utils/values.ts`, never hard-code secrets, log credentials/tokens, or commit `.env`, `.env.local`, or `.dev.vars` files.

Runtime configuration includes frontend/CORS origins, JWT settings, MongoDB connection, OTP limits, and SMTP credentials. Local development loads Vite environment files and mirrors declared keys to the Worker's ignored `.dev.vars`; deployment uses Wrangler. `server/wrangler.toml` defines the Worker entry point, Node compatibility, and observability. Treat production bindings and secrets as deployment configuration rather than source files.

Authentication uses bearer JWTs, OTP challenges, passkeys through SimpleWebAuthn, and SMTP email. `authMiddleware` is the route-level policy gate; handlers still assert and use the typed authenticated user for protected mutations. Keep anonymous-only auth routes, authenticated entity writes, and administrator-only user/invite operations synchronized with OpenAPI security declarations.

Mongo access is exposed through `DatabaseService`. Add collection names centrally in `server/src/db/collections.ts`, schemas under `server/src/db/models/`, and domain operations under `server/src/db/services/`. Reuse the cached connection/service construction. IDs use the `idhi:<type>:<random>` convention through `server/src/utils/id.ts`; keep public ID patterns reflected in OpenAPI schemas.

Throw `ApiError` for expected API failures and use an `ErrorCode` declared by the contract. Let the global error handler log and serialize failures. Use the request-scoped structured logger rather than `console` in request/business code, and avoid sensitive values in log attributes.
