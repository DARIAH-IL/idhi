## App architecture

Routes live under `app/src/routes/` and TanStack Router generates `app/src/routeTree.gen.ts`; do not edit that generated route tree. Route-aware data loading should use generated TanStack Query options/hooks, with URL/search state represented through TanStack Router. Shared UI primitives live in `app/src/components/ui/`, shared browser helpers in `app/src/lib/`, and global styling in `app/src/styles.css`.

Use the `#/*` or `@/*` aliases for app source imports where appropriate. Maintain strict TypeScript behavior and the existing accessibility-oriented React Aria/component conventions. Keep server-only code and secrets out of the browser bundle.

Always use css start/end and not left/right.

## UI primitives

Shared primitives in `app/src/components/ui/` were originally scaffolded via shadcn but have since been hand-adapted onto `react-aria-components` (not Radix) and onto this app's RTL logical-property conventions (`start`/`end`, `inset-s`/`inset-e`, never `left`/`right`). Treat every file in that directory as the house style, not as vanilla shadcn output.

When a needed primitive doesn't exist yet (e.g. a drawer/sheet), do not just run `npx shadcn add <x>` and drop it in unasked — its Radix/Vaul-based output will conflict with the RAC + logical-property conventions already in place. Do not silently hand-roll a replacement either. Instead, surface the tradeoff to the user before writing code: stock shadcn component vs. a hand-rolled one matching the existing `ui/` pattern, and that adding it via the shadcn CLI means running an `npx`/package-manager command, which requires explicit user instruction per the global CLAUDE.md rule against running `npm`/`yarn`/`pip` unasked. Let the user pick; don't default to either path on your own.

## Accessibility (WCAG 2.1/2.2 AA)

The app went through a full WCAG audit and remediation (see `app/A11Y_PLAN.md` for the
tracked items and their status). All new code must preserve these conventions — do not
regress them:

- **Names**: every interactive element needs an accessible name. Icon-only buttons get
  `aria-label` (translated); decorative icons get `aria-hidden="true"`. When the same control
  repeats per row/section (remove, revoke, select all), scope its name with the item context,
  e.g. ``aria-label={`${t('common.remove')} (${index + 1})`}``.
- **Async status**: loading/empty/success messages get `role="status"`, errors get
  `role="alert"`. A live region that must announce updates has to be permanently mounted with
  changing text — a conditionally-mounted `aria-live` node is not announced.
- **Forms**: use `FieldRow`'s render-prop form so the control gets `aria-labelledby={labelId}`;
  wire errors with `aria-invalid` + `aria-describedby` pointing at a `FieldError` with an `id`.
  Pass `required` so `FieldRow` renders the visual marker. Never label an input by placeholder
  alone.
- **Focus**: never unmount the focused element without moving focus — for list-item removal
  use `focusAfterRemove` (`app/src/components/form-fields/removeFocus.ts`): mark the list
  container with `ref` + `data-remove-scope=""` and the buttons with
  `data-remove-button`/`data-add-button` (the helper only matches buttons whose nearest
  `data-remove-scope` ancestor is that container, so nested lists stay independent), and call
  it after the removal promise resolves
  (`void Promise.resolve(field.removeValue(i)).then(() => focusAfterRemove(...))`). Never add `outline-none`/`outline-hidden`
  without a visible `focus-visible`/`data-focus-visible` replacement. Focus-ring strength
  (`--ring` token, `ring-ring/70`) was tuned to meet 3:1 non-text contrast — do not lighten it.
- **Tooltips**: RAC `Button` triggers work inside `TooltipTrigger` as-is; any non-RAC
  interactive trigger (e.g. TanStack `Link`, a clickable `Card`) must be wrapped in RAC
  `<Focusable>` or its tooltip silently stops working. Never put essential info in a
  hover-only tooltip.
- **Dialogs/drawers/popovers**: every `Dialog` needs a `DialogTitle`; `DialogDescription` is
  auto-wired to `aria-describedby` — use it for consequence text (especially destructive
  confirms). Drawers need a `DrawerTitle` (sr-only is fine). `ui/popover` renders a RAC
  `Dialog` inside for focus containment — don't bypass it.
- **RTL/lang**: LTR-only values (ids, emails, URLs, code) rendered inside localized text get
  `dir="ltr"`. Values in a language other than the UI language get a `lang` attribute.
  `lang`/`dir`/`document.title` are managed once in `src/routes/__root.tsx` — the app keeps a
  single localized title; do not add per-route titles.
- **State, not remount**: don't force-remount panels with `key={JSON.stringify(...)}` to sync
  props to state — it destroys keyboard focus. Sync state to props instead (see
  `useDraftFacetFilters`).
- **Motion**: pair `animate-*` with `motion-reduce:animate-none`; check
  `prefers-reduced-motion` before `scrollIntoView({ behavior: 'smooth' })`.

## Localization

All user-visible app text must use the app's localization system. Add copy to the locale resources and reference it through translation keys; do not hard-code user-facing strings in TSX or browser helpers.

The app ships three languages — English (`en`), Hebrew (`he`), and Arabic (`ar`) — and all three must be kept in sync at all times. Every key added, renamed, or removed in one locale file must be added, renamed, or removed in the other two in the same change; never leave a key present in only some locales. When adding new copy, provide real translations for all three languages rather than placeholder or copied English text in `he.json`/`ar.json`.

Prefer gender-neutral phrasing in all user-facing copy, in every language. Avoid wording that presumes a specific gender for the user, an entity's contributors, or people described by the data (e.g. authors, contacts, administrators). Where a language's grammar forces a gendered form, choose the most neutral construction available in that language rather than defaulting to masculine.

Scope translation keys by meaning and reuse, not by the first feature that needs them. Generic interface copy — including pagination ranges, previous/next-page labels, page counts, loading states, and common actions — belongs under `common` and must be reused across features. Do not duplicate or feature-scope generic text under namespaces such as `admin`, `entity`, or a specific component; reserve those namespaces for genuinely domain-specific copy.

Locale resources live in `app/src/i18n/locales/` (`en.json`, `he.json`, `ar.json`), initialized in `app/src/i18n/index.ts`. Translation keys are fully typed: `app/src/i18n/i18next.d.ts` derives the key space from `en.json`, so adding a key there immediately makes it available (and type-checked) through `t(...)`; still add the matching key to `he.json` and `ar.json` so the three files stay structurally identical.

Locale files are standard 2-space-indented JSON that round-trip byte-identically through `JSON.stringify(data, null, 2)`; scripted edits that parse, modify, and re-serialize the files are safe and preferred for bulk changes, and should touch all three locale files together.

Entity field copy lives under `entity.fields`, keyed by schema class name then field name, mirroring the key structure of `app/src/api/termUris/termUris.ts`. Each entry holds both a `label` and a `description`, and each class also has a `$self` entry describing the class itself:

```json
"entity": {
  "fields": {
    "Person": {
      "$self": { "label": "Person", "description": "..." },
      "given_name": { "label": "Given name", "description": "..." }
    }
  }
}
```

Covered classes are the user-facing ones from `termUris.ts`: the nine top-level entity types plus the nested relationship classes (Affiliation, Authorship, EventAgentRole, Funding, OrganizationStructure, OrganizationProjectRole, ProjectParticipation, ResourceContribution). LangString is covered too, since multilingual values render as language/value pairs. Abstract classes (Entity, Agent, Relationship, IndexContainer) are intentionally excluded.

Descriptions are adapted from the property descriptions in the upstream IDHI manifest schema (`https://raw.githubusercontent.com/DARIAH-IL/idhi-manifests/refs/tags/v1.0.0/gen/idhi.schema.json`, the same source `scripts/generate-term-uris.mjs` reads). They are rewritten for editors, not copied: drop modeling jargon (reified objects, IDHI URNs, discriminators, slot_usage), keep the practical guidance about what belongs in the field, what belongs elsewhere, and when to leave it empty. Every description must be written for its specific class context — never reuse one generic text across classes, even for fields they share (`name`, `homepage`, `start_date` and the like each get a per-class text naming the concrete entity). When the upstream schema gains a class or field, add the matching `entity.fields` entries so coverage stays complete.

<!-- intent-skills:start -->

# TanStack Intent - before editing files, run the matching guidance command.

tanstackIntent:

- id: "@tanstack/devtools#devtools-app-setup"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools#devtools-app-setup"
  for: "Install TanStack Devtools, pick framework adapter (React/Vue/Solid/Preact), register plugins via plugins prop, configure shell (position, hotkeys, theme, hideUntilHover, requireUrlFlag, eventBusConfig). TanStackDevtools component, defaultOpen, localStorage persistence."
- id: "@tanstack/devtools#devtools-marketplace"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools#devtools-marketplace"
  for: "Publish plugin to npm and submit to TanStack Devtools Marketplace. PluginMetadata registry format, plugin-registry.ts, pluginImport (importName, type), requires (packageName, minVersion), framework tagging, multi-framework submissions, featured plugins."
- id: "@tanstack/devtools#devtools-plugin-panel"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools#devtools-plugin-panel"
  for: "Build devtools panel components that display emitted event data. Listen via EventClient.on(), handle theme (light/dark), use @tanstack/devtools-ui components. Plugin registration (name, render, id, defaultOpen), lifecycle (mount, activate, destroy), max 3 active plugins. Two paths: Solid.js core with devtools-ui for multi-framework support, or framework-specific panels."
- id: "@tanstack/devtools#devtools-production"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools#devtools-production"
  for: "Handle devtools in production vs development. removeDevtoolsOnBuild, devDependency vs regular dependency, conditional imports, NoOp plugin variants for tree-shaking, non-Vite production exclusion patterns."
- id: "@tanstack/devtools-event-client#devtools-bidirectional"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools-event-client#devtools-bidirectional"
  for: "Two-way event patterns between devtools panel and application. App-to-devtools observation, devtools-to-app commands, time-travel debugging with snapshots and revert. structuredClone for snapshot safety, distinct event suffixes for observation vs commands, serializable payloads only."
- id: "@tanstack/devtools-event-client#devtools-event-client"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools-event-client#devtools-event-client"
  for: "Create typed EventClient for a library. Define event maps with typed payloads, pluginId auto-prepend namespacing, emit()/on()/onAll()/onAllPluginEvents() API. Connection lifecycle (5 retries, 300ms), event queuing, enabled/disabled state, SSR fallbacks, singleton pattern. Unique pluginId requirement to avoid event collisions."
- id: "@tanstack/devtools-event-client#devtools-instrumentation"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools-event-client#devtools-instrumentation"
  for: "Analyze library codebase for critical architecture and debugging points, add strategic event emissions. Identify middleware boundaries, state transitions, lifecycle hooks. Consolidate events (1 not 15), debounce high-frequency updates, DRY shared payload fields, guard emit() for production. Transparent server/client event bridging."
- id: "@tanstack/devtools-vite#devtools-vite-plugin"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/devtools-vite#devtools-vite-plugin"
  for: "Configure @tanstack/devtools-vite for source inspection (data-tsd-source, inspectHotkey, ignore patterns), console piping (client-to-server, server-to-client, levels), enhanced logging, server event bus (port, host, HTTPS), production stripping (removeDevtoolsOnBuild), editor integration (launch-editor, custom editor.open). Must be FIRST plugin in Vite config. Vite ^6 || ^7 only."
- id: "@tanstack/router-core#router-core"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core"
  for: "Framework-agnostic core concepts for TanStack Router: route trees, createRouter, createRoute, createRootRoute, createRootRouteWithContext, addChildren, Register type declaration, route matching, route sorting, file naming conventions. Entry point for all router skills."
- id: "@tanstack/router-core#router-core/auth-and-guards"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/auth-and-guards"
  for: "Route protection with beforeLoad, redirect()/throw redirect(), isRedirect helper, authenticated layout routes (_authenticated), non-redirect auth (inline login), RBAC with roles and permissions, auth provider integration (Auth0, Clerk, Supabase), router context for auth state."
- id: "@tanstack/router-core#router-core/code-splitting"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/code-splitting"
  for: "Automatic code splitting (autoCodeSplitting), .lazy.tsx convention, createLazyFileRoute, createLazyRoute, lazyRouteComponent, getRouteApi for typed hooks in split files, codeSplitGroupings per-route override, splitBehavior programmatic config, critical vs non-critical properties."
- id: "@tanstack/router-core#router-core/data-loading"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/data-loading"
  for: "Route loader option, loaderDeps for cache keys, staleTime/gcTime/ defaultPreloadStaleTime SWR caching, pendingComponent/pendingMs/ pendingMinMs, errorComponent/onError/onCatch, beforeLoad, router context and createRootRouteWithContext DI pattern, router.invalidate, Await component, deferred data loading with unawaited promises."
- id: "@tanstack/router-core#router-core/navigation"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/navigation"
  for: "Link component, useNavigate, Navigate component, router.navigate, ToOptions/NavigateOptions/LinkOptions, from/to relative navigation, activeOptions/activeProps, preloading (intent/viewport/render), preloadDelay, navigation blocking (useBlocker, Block), createLink, linkOptions helper, scroll restoration, MatchRoute."
- id: "@tanstack/router-core#router-core/not-found-and-errors"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/not-found-and-errors"
  for: "notFound() function, notFoundComponent, defaultNotFoundComponent, notFoundMode (fuzzy/root), errorComponent, CatchBoundary, CatchNotFound, isNotFound, NotFoundRoute (deprecated), route masking (mask option, createRouteMask, unmaskOnReload)."
- id: "@tanstack/router-core#router-core/path-params"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/path-params"
  for: "Dynamic path segments ($paramName), splat routes ($ / _splat), optional params ({-$paramName}), prefix/suffix patterns ({$param}.ext), useParams, params.parse/stringify, pathParamsAllowedCharacters, i18n locale patterns."
- id: "@tanstack/router-core#router-core/search-params"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/search-params"
  for: "validateSearch, search param validation with Zod/Valibot/ArkType adapters, fallback(), search middlewares (retainSearchParams, stripSearchParams), custom serialization (parseSearch, stringifySearch), search param inheritance, loaderDeps for cache keys, reading and writing search params."
- id: "@tanstack/router-core#router-core/ssr"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/ssr"
  for: "Non-streaming and streaming SSR, RouterClient/RouterServer, renderRouterToString/renderRouterToStream, createRequestHandler, defaultRenderHandler/defaultStreamHandler, HeadContent/Scripts components, head route option (meta/links/styles/scripts), ScriptOnce, automatic loader dehydration/hydration, memory history on server, data serialization, document head management."
- id: "@tanstack/router-core#router-core/type-safety"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-core#router-core/type-safety"
  for: "Full type inference philosophy (never cast, never annotate inferred values), Register module declaration, from narrowing on hooks and Link, strict:false for shared components, getRouteApi for code-split typed access, addChildren with object syntax for TS perf, LinkProps and ValidateLinkOptions type utilities, as const satisfies pattern."
- id: "@tanstack/router-plugin#router-plugin"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/router-plugin#router-plugin"
  for: "TanStack Router bundler plugin for route generation and automatic code splitting. Supports Vite, Webpack, Rspack, and esbuild. Configures autoCodeSplitting, routesDirectory, target framework, and code split groupings."
- id: "@tanstack/virtual-file-routes#virtual-file-routes"
  run: "pnpm dlx @tanstack/intent@latest load @tanstack/virtual-file-routes#virtual-file-routes"
  for: "Programmatic route tree building as an alternative to filesystem conventions: rootRoute, index, route, layout, physical, defineVirtualSubtreeConfig. Use with TanStack Router plugin's virtualRouteConfig option."

<!-- intent-skills:end -->
