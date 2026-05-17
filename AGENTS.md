# AGENTS.md

## Project Context

Animeta is a web service for tracking anime viewing records. The repository is a pnpm workspace with a Node.js backend API, a React frontend, a frontend server, shared web code, and local tooling.

## Repository Layout

- `backend-ts/`: NestJS/TypeScript backend API, GraphQL schema and resolvers, TypeORM entities, services, PostgreSQL setup, and backend tests.
- `web/frontend/`: React 17 frontend using Vite, React Router 5, TypeScript/JavaScript, LESS, MUI, React Bootstrap, and GraphQL operations.
- `web/frontend-server/`: Express/serverless frontend server and SSR-related code.
- `web/shared/`: Shared web GraphQL/types package.
- `tooling/`: TypeScript helper tooling package.
- `docs/`: Project documentation.
- `patches/`: pnpm patched dependencies.

## Package Manager

Use pnpm 11.x only. Install dependencies from the repository root:

```sh
pnpm install
```

Avoid dependency upgrades, lockfile churn, or changes to patched/GitHub dependencies unless the task explicitly requires them.

## Build And Test Commands

Prefer the narrowest relevant build or test command for the files you changed.

Backend:

```sh
pnpm -C backend-ts test
pnpm -C backend-ts test:e2e
pnpm -C backend-ts build
```

Frontend:

```sh
pnpm -C web/frontend test
pnpm -C web/frontend build
```

Frontend server:

```sh
pnpm -C web/frontend-server build
```

Tooling:

```sh
pnpm -C tooling build
```

End-to-end backend tests use `@databases/pg-test` to launch a Dockerized PostgreSQL instance automatically; Docker must be available locally.

## GraphQL And Generated Code

Backend GraphQL schema files live under `backend-ts/schema/`, with generated backend types in `backend-ts/src/graphql/generated.ts`. Frontend GraphQL code generation is configured in `web/frontend/codegen.yaml`.

When changing GraphQL schemas or operations, run the relevant code generation command and include generated output if it changes:

```sh
pnpm -C backend-ts graphql-codegen:watch
pnpm -C web/frontend graphql-codegen
```

Do not hand-edit generated GraphQL output. Change the schema or source operations and regenerate.

## Database And Local Config

The backend uses PostgreSQL. `backend-ts/schema.sql` is the base schema used for initialization; do not edit it for follow-up schema changes. Add further database changes as migrations under `backend-ts/migrations/`.

Local configuration is derived from sample files:

- `backend-ts/.env.sample` -> `backend-ts/.env`
- `backend-ts/ormconfig.json.sample` -> `backend-ts/ormconfig.json`
- `web/frontend/config.json.sample` -> `web/frontend/config.json`

Do not commit real local config, credentials, tokens, database URLs, or production-derived secrets.

## Source And Generated Files

Edit source files, schemas, migrations, and tests. Do not hand-edit generated, build, or dependency output such as:

- `dist/`
- `node_modules/`
- generated GraphQL files

Regenerate or rebuild these artifacts from source when needed.

## Frontend Architecture

`web/frontend` is a Vite-built React 17 application. The public site uses `nuri` routing with server-side rendering support. The admin page is a separate React Router app.

Entry points and app bootstrap:

- `js/index.react.ts` is the browser entry point. It imports the route table and calls `main(app)`.
- `js/main.ts` configures the `nuri` app title, creates the `Loader`, registers the legacy REST/RPC client as `loader.v5`, registers GraphQL as `loader.graphql`, initializes Sentry when `window.SENTRY_DSN` exists, starts `nprogress` during route loads, and tracks page views after committed navigation.
- `js/serverEntry.ts` exports the same route app plus `nuri/server` rendering for SSR.
- `ViteAppProvider.js` runs Vite in middleware mode for development and SSR-loads `js/serverEntry.ts`.
- `vite.config.js` builds two HTML inputs, `index.html` and `index-admin.html`; SSR builds use `js/serverEntry.ts`.
- `index-admin.html` loads `js/admin.react.jsx`, which mounts the admin React app directly in the browser.

Routing and data loading:

- `js/routes.tsx` owns the route table. Add user-facing routes there with `app.route(...)`.
- Route modules live in `js/routes/`. Most export a `RouteHandler` created directly or through a layout wrapper.
- Route components receive `RouteComponentProps<Data>` from `js/routes.tsx`, including `data`, `writeData`, and `loader`.
- Route `load({ loader, ... })` functions fetch the data needed before rendering. Prefer loading route data there rather than adding ad hoc client-only fetches when the page should SSR or have initial data.
- Layout composition goes through `js/LayoutWrapper.tsx`. `AppLayout` in `js/layouts/AppLayout.tsx` loads global header data and wraps inner route data as `{ layoutData, innerData }`.

Admin routing:

- `js/admin.react.jsx` uses `HashRouter`, `Switch`, `Route`, and `Redirect` from `react-router-dom`.
- Admin screens live under `js/admin/`.
- Add admin-only routes in `js/admin.react.jsx`, not in the public `nuri` route table.
- The admin app is client-rendered from `index-admin.html`; do not assume public-site SSR or `nuri` route loaders apply there.

GraphQL organization:

- Keep route-level operations beside their route as `js/routes/*.graphql`.
- Keep reusable component operations beside components as `js/ui/*.graphql` or `js/layouts/*.graphql`.
- Generated frontend GraphQL files are placed in nearby `__generated__/` folders by `web/frontend/codegen.yaml`.
- Import generated `TypedDocumentNode` values from those generated files and call them through `loader.graphql(...)` or the `graphql(...)` helper from `js/API.ts`.
- Do not hand-edit `__generated__` files. Update `.graphql` documents or backend schema, then run codegen.

API and mutation patterns:

- `js/API.ts` contains the fetch helpers for REST-style endpoints and GraphQL. It refreshes CSRF tokens for mutating requests, sends credentials, reports unexpected errors to Sentry, and shows Korean user-facing alerts.
- `js/ApiClient.ts` adapts the shared `Client` interface from `web/shared` into `loader.v5` for older API calls.
- `js/CSRF.ts` reads CSRF cookies and refreshes them through `/api/fe/csrf-token`.
- `js/Mutations.ts` exposes RxJS subjects for cross-component mutation notifications. Reuse existing subjects before introducing a new event channel.

Component and styling layout:

- Shared route-independent UI components live under `js/ui/`.
- Page-level components live under `js/routes/`.
- Layout components live under `js/layouts/`.
- Styles are mostly LESS, with CSS modules named `*.module.less` beside the component or route. Global LESS lives under `less/` and is imported from `js/main.ts`.
- The codebase intentionally mixes TypeScript, JavaScript, older React conventions, MUI, React Bootstrap, Font Awesome, and local UI components. Follow the nearby file's conventions rather than normalizing styles or frameworks.

Testing and mocks:

- Vitest is configured in `web/frontend/vitest.config.js`.
- Frontend tests live beside code, such as `js/API.test.ts`.
- MSW and test helpers live under `js/mocks/` and `js/test-extend.ts` when browser/API mocking is needed.

## Working Guidelines

- Keep changes scoped to the task.
- Prefer existing abstractions and package-local patterns over new infrastructure.
- Add or update focused tests when behavior changes.
- Document the commands you ran and any commands you could not run in the final response.
