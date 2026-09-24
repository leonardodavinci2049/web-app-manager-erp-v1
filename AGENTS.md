# Repository Guidelines

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Guidelines for Manager ERP

Operational guide for agents working in `web-app-manager-erp-v1`. Be concise, follow existing patterns, and prefer editing only what is necessary.

Sections: Product and Stack · Prerequisites and Setup · Commands · Skills · Git Workflow · Architecture · Nested AGENTS.md Hierarchy · Placement · Cross-Repository Work · Next.js and React · Data, Services, and Mutations · Cache Components · Security and Env · Styling, Components, and Forms · Style and Naming · Language · Verification · Scope and Definition of Done · Communication and Delivery.

## Product and Stack

- Manager ERP: admin dashboard for catalog, products, brands, categories, customers, orders, reports, CRM, authentication, and multi-organization support.
- Main stack: Next.js (App Router, Cache Components, React Compiler), React, strict TypeScript, Biome, Better Auth, mysql2, Axios, Zod, Tailwind CSS 4, shadcn/ui.
- See `package.json` for the exact installed versions; do not hardcode version numbers in code or docs.
- Sources of truth: `package.json`, `next.config.ts`, `tsconfig.json`, `biome.json`, `README.md`, `src/lib/cache-config.ts`, `src/core/constants/api-constants.ts`, and local Next.js docs in `node_modules/next/dist/docs/`.

## Prerequisites and Setup

- Requirements: Node.js >= 22, pnpm >= 10, MySQL 8 (or compatible), per `README.md`.
- Install: `pnpm install`.
- Env: copy `.env.example` to `.env` (and `.env.local` when needed) and fill in real values. Never commit real secrets.
- The dev server port comes from `PORT` in `.env` (see `.env.example`). Production examples use `http://localhost:3000` only as a placeholder.
- `EXTERNAL_API_MAIN_URL` and `EXTERNAL_API_ASSETS_URL` point to the external REST API (see Cross-Repository Work). Without it, `src/services/api-main/*` reads fail; check `API-documentation/` for the expected contract.

## Commands

```bash
pnpm install  # install dependencies
pnpm dev      # dotenv -e .env -- next dev; serves on the port from PORT in .env
pnpm lint     # biome check (use for TS/React/doc-with-code changes)
pnpm format   # biome format --write (run before commit when you touched code)
pnpm build    # plain `next build`, no dotenv wrapper (use for route/build/action/cache/config/integration changes, when viable)
pnpm start    # dotenv -e .env -- next start
```

- `pnpm dev` wraps `next dev` with `dotenv -e .env`; `pnpm build` does not. `pnpm start` wraps `next start` with dotenv.
- When `pnpm dev` is already running, reuse it via the port in `PORT` and `.next/dev/lock`; do not start a duplicate server.
- This project does not currently use automated tests. Do not invent or suggest test commands; if tests are added in the future, update this file.

## Skills

Check `.agents/skills/` first; use the matching skill instead of reinventing the workflow:

- `access-development-database`: queries, schema/EXPLAIN, and fixes against the dev MariaDB/MySQL via `.env` credentials.
- `create-api-service-method`: server-only consumption of a documented REST endpoint under `src/services/api-main/*` (route constant, request/response types, Zod schema, service method, error handling, exports; optional cached read).
- `update-table-inline-field`: typed single-field writes via `generalCallServiceApi.updateTableInlineField` without creating a dedicated endpoint.
- `create-feature-worktree`: isolated Git worktree for a new feature (feature branch from `develop`, local agent configs, protected env files).
- `create-action-plan` / `create-execution-prompt` / `refine-initial-intention`: plan or clarify multi-phase or ambiguous work before implementing; do not execute the task inside those flows.
- `security-diagnostic` / `nextjs-security-auditor`: read-only defensive security reviews (report in pt-BR, no code changes).
- `safe-dependency-update`: grouped, supply-chain-aware npm/pnpm updates with lint/build per step.

## Git Workflow

- This repository follows Git Flow, with `develop` as the integration base. Do not implement directly on `develop` or `main`.
- For each new implementation task: inspect the current branch and working tree, fast-forward local `develop` from `origin/develop` when remote access is available, then create `feature/<kebab-case-task-slug>` from `develop` (or use the `create-feature-worktree` skill when isolation is needed).
- If the request continues work on the current feature branch, keep that branch.
- Read-only analysis, diagnosis, review, explanation, and status requests do not require a new branch unless they result in project file changes.
- If the working tree is not clean or the checkout cannot safely change branches, stop and report the conflict. If local changes still need committing, ask the user to commit first and wait for confirmation.
- Do not merge, finish, delete, or push a feature branch without explicit user authorization.
- Commits follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc., per `README.md`). Run `pnpm format` before committing code changes. Never commit `.env` / `.env.local` with real values.

## Architecture

- `src/app`: App Router routes, layouts, pages, route handlers, and special files. Includes `(home)`, `(auth)`, `dashboard/*`, `admin/`, `api/` (auth, invitations), and `actions/` (application-wide Server Actions).
- `src/app/**/_actions`, `_components`, `_hooks`, `_utils`: route-local Server Actions, UI, hooks, and utilities (see Placement).
- `src/components`: installed or application-wide shared components only. Current scopes: `auth/`, `common/`, `emails/` (React Email templates), `header/`, `theme/` (dark/light provider), `ui/` (shadcn/ui base).
- `src/services/api-main/*`: main external API integration, one folder per module. Preserve the local split `*-service-api.ts` / `types/` / `validation/` / `transformers/`. These modules read real-time data (no `"use cache"`).
- `src/services/api-assets`, `src/services/api-cep`, `src/services/api-voice`: assets/images, ViaCEP lookup, and voice integrations.
- `src/services/db/*`: DB/server-only access with mysql2 (`auth`, `log`, `organization-meta`, `user-meta`). `*-cached-service.ts` wrappers live only here, not under `api-main`.
- `src/server/*`: server-only domain helpers (`auth-context`, `members`, `organizations`, `permissions`, `subscription`, `users`).
- `src/database/*`: singleton `DatabaseService` (`dbConnection.ts`) wrapping `mysql2/promise`, plus `schema.ts` and `shared/`/`utils/`. `src/db/schema.ts` holds DB schema types; keep both in sync when the schema changes.
- `src/core`: `config/` (`envs.server.ts`, `envs.client.ts`, `env-validation.ts`, `image-origins.ts`), `constants/` (`api-constants.ts`, `globalConstants.ts`, `brazilian-states.ts`), `logger.ts`.
- `src/lib`: shared utilities (`auth/` for Better Auth, `axios/`, `cache-config.ts`, `constants/`, `translations/` with `pt.json`/`en.json`, `validations/`, `logger.ts`, `utils.ts`).
- `src/hooks/`: client hooks (`use-auth`, `use-mobile`, `use-debounce`, domain list hooks). `src/types/` or module-level `types/`: shared types. `src/utils/`: shared helpers.
- `API-documentation/`, `API-assets-documentation/`: external API contracts. `docs/`: plans, prompts, reports, security notes. `scripts/`, `app-config/`, `public/`: scripts, app config, static assets.
- No `middleware.ts` in this project.
- Path alias: `@/*` maps to `./src/*`.

## Nested AGENTS.md Hierarchy

- If an `AGENTS.md` is closer to the file being edited, it complements or specializes this guide. Read it before changing anything in its scope.
- Mandatory reads: `src/app/dashboard/AGENTS.md` (plus the closest child route guide) before touching `dashboard/*`; the module-local `AGENTS.md` under `src/services/api-main/<module>/` before touching that module (only some modules have one).
- On conflict, the closer file wins within its scope; this root file wins on cross-cutting rules (security, cache, placement across routes).

## Placement of New Components and Server Actions

Keep route-specific files close to the routes that use them so a route can be copied to another project with its local files.

- Create a file used by only one route inside that route's local folder (`_components`, `_actions`, `_hooks`, `_utils`), alongside its `page.tsx` or `layout.tsx`.
- Create a file shared by two or more routes in the same-named folder at the nearest common ancestor directory of those routes. Keep it within the smallest route scope that includes all its consumers.
- Use `src/components` only for installed components or components shared across the entire application. Sharing between a few routes alone does not justify placing it there.
- Reserve `src/app/actions` for application-wide Server Actions.
- Use the exact folder names `_components`, `_actions`, `_hooks`, `_utils` (plural, underscore-prefixed) for new files; migrate existing files only when explicitly requested.
- Avoid importing route-specific files from a sibling route. When sharing becomes necessary, move the shared file to the nearest common ancestor.
- Preserve existing route conventions where present (`loading.tsx`, `error.tsx`, `not-found.tsx`, route-local `AGENTS.md`).

## Cross-Repository Work

- When explicitly requested by the user, the agent is authorized to inspect and modify the sibling REST API server repository (`srvapi01`, same parent projects directory as this repo).
- Before changing the API server, read and follow its applicable `AGENTS.md` files and preserve any existing user changes.
- Before changing an integration, sync the contract in `API-documentation/` (and `API-assets-documentation/` for assets); do not silently change request/response shapes consumed under `src/services/api-main/*`.
- Treat the web app and API server as separate Git repositories: inspect their status, validate their changes, and report their results independently.

## Next.js and React

- Server Components by default. `page.tsx` and `layout.tsx` must remain server-side unless there is a real framework exception. Keep the `"use client"` boundary in the smallest possible component.
- Use Client Components only for interactive state, events, browser APIs, providers, and client-only libraries. Isolate `"use client"` in leaf components, never in layouts/pages.
- `error.tsx` and `global-error.tsx` are Client Components by App Router convention.
- For request-time data (`cookies()`, `headers()`, session-derived organization context, `params`/`searchParams` when dynamic): keep the page/layout synchronous, resolve the dynamic work in an async child inside a route-local `<Suspense>` boundary, and opt into request-time execution with `connection()` in that child (see `src/app/dashboard/AGENTS.md` root-redirect pattern).
- Data reads belong in Server Components, services, or cached services. Mutations belong in Server Actions.
- Create Route Handlers only when there is a real need for an HTTP endpoint.
- Use absolute imports with `@/` for files inside `src`.
- Default exports are required in App Router special files; otherwise, prefer named exports when they make sense.

## Data, Services, and Mutations

- In `src/services/api-main/*`, preserve the local separation between `*-service-api.ts`, `types`, `validation`, and `transformers`. These admin modules read real-time data (no `"use cache"`); check the module's local `AGENTS.md` where one exists. For a new endpoint, use the `create-api-service-method` skill.
- `*-cached-service.ts` wrappers exist only under `src/services/db/*`, not under `src/services/api-main/*`.
- Follow the module pattern: class extends `BaseApiService`, Zod-validate inputs (`.parse()` for required, `.partial().parse()` for optional queries), build the payload with `buildBasePayload()` (`pe_app_id`, `pe_store_id` from env) plus `pe_system_client_id` from `session.session.systemId`, prefix API params with `pe_`, extract/validate the response, throw typed errors (`XError`, `XNotFoundError`), normalize `NOT_FOUND`/`EMPTY_RESULT` to empty results in reads, and transform entities to minimal UI DTOs via `transformers/`.
- Guard reads: return `[]`/`undefined` when the required session context is missing; paginated list readers return `{ data, total }` with `total` from `recordId` and fallback to `quantity`/loaded items.
- In server-only services, use `import "server-only"` when accessing secrets, the DB, internal APIs, or user context.
- Validate inputs with Zod or an existing schema. Avoid `any`; use `unknown` or specific types.
- Return minimal DTOs to UI and Client Components. Do not expose raw entities, secrets, tokens, or internal errors.
- Server Actions must revalidate authentication (`auth.api.getSession()`, redirect to `/sign-in` when unauthenticated) and resource/organization authorization via `src/server/*` helpers, even if the screen has already checked the session. Return the module's standard `MutationResult` (`{ success, data?, error? }`) with safe, generic messages.
- For single-field writes covered by the generic endpoint, use the `update-table-inline-field` skill instead of creating a dedicated endpoint.
- Use `createLogger("context")` instead of `console.error` for relevant errors. Sanitize rendered HTML with DOMPurify.

## Cache Components

- `cacheComponents: true` and `reactCompiler: true` are enabled in `next.config.ts`.
- Rule of thumb: `src/services/api-main/*` reads are real-time (no `"use cache"`); `"use cache"` lives in deterministic cached readers, primarily under `src/services/db/*` (`*-cached-service.ts`) and other explicitly cache-safe functions/components.
- Use `"use cache"` only in deterministic functions/components that are safe to cache. Never cache session-derived organization selection or other private data without a proper key by user, organization, or resource; resolve those under `connection()` + `<Suspense>` instead.
- `cacheLife` profiles are defined in `next.config.ts` (source of truth for timings): `seconds` (stale 5s), `frequent` (stale 5m), `quarter` (stale 15m), `hours` (stale 1h), `daily` (stale 24h). Prefer the named constants in `CACHE_PROFILES` (`src/lib/cache-config.ts`).
- Use `cacheTag` with `CACHE_TAGS` from `src/lib/cache-config.ts` (static tags plus per-id generators such as `product(id)`, `organization(id)`).
- After mutations, invalidate with `updateTag` for `"use cache"` entries (fall back to `revalidateTag`/`revalidatePath` for page/router cache, depending on the expected effect).

## Security and Env

- Env files: server vars are validated in `src/core/config/envs.server.ts` (`import "server-only"`); public vars in `src/core/config/envs.client.ts` (`NEXT_PUBLIC_*` only). Never read private vars in Client Components. `.env` and `.env.local` are secrets: do not log, copy, or expose values.
- Authentication does not replace authorization. Verify ownership, organization, and permissions in actions/services that mutate or return sensitive data, using `src/server/*` (`auth-context`, `members`, `organizations`, `permissions`, `subscription`).
- Do not import server-only modules in Client Components.
- Auth stack: Better Auth (email/password plus GitHub/Google OAuth), Resend for transactional email, Deepgram for voice. Keep secrets server-side.
- Client-facing messages must be safe and generic; internal details belong in logs.

## Styling, Components, and Forms

- Build mobile-first and support both light and dark themes (`next-themes` provider) in every interface change.
- **Tailwind CSS 4** via `@tailwindcss/postcss` (no tailwind.config.js)
- **shadcn/ui** components configured in `components.json`:
  - Style: "new-york"
  - Base color: "stone"
  - CSS variables: enabled
  - Icon library: lucide
- Biome configuration (`biome.json`):
  - 2-space indentation
  - Recommended rules + Next.js + React domains
  - `noUnknownAtRules` off (for Tailwind)
- Component placement: new base primitives go in `src/components/ui/`; app-wide shared UI in `src/components/common/` (or `auth/`/`header/`/`theme/`/`emails/` by scope); route-local UI stays in the route's `_components/`.
- Forms: use React Hook Form with Zod resolvers and existing schemas in `src/lib/validations/` (or module-local `validation/`); surface feedback with Sonner toasts; icons from Lucide (Tabler only when already used).

## Style and Naming

- Use Biome for formatting and import organization. Do not change lint/format config unless necessary.
- Files and folders: kebab-case (e.g., `app-sidebar.tsx`, `user-profile/`).
- Component exports: **ALWAYS PascalCase** — every React component must be named and exported in PascalCase (e.g., `export function AppSidebar()`, `export function UserProfileCard()`).
- Functions/hooks: camelCase with `use` prefix for hooks. Types/interfaces: PascalCase, no `I` prefix. Global constants: UPPER_SNAKE_CASE.
- Keep TypeScript strict and models local. Avoid out-of-scope refactors.

## Language

- The default development language is US English. Code comments, error messages, documentation, and file names should use English.
- User-facing output messages, labels, and interface text should use Brazilian Portuguese because the project is intended for a Brazilian audience. Shared strings live in `src/lib/translations/` (`pt.json`/`en.json`).

## Verification

- Documentation-only change: review Markdown; run `pnpm lint` only if it touches code examples or config.
- TS/React change: run `pnpm lint`.
- Route, build, Server Action, cache, config, or integration change: also run `pnpm build` when viable.
- Visual/interactive change: validate in the browser/dev server; if the Next.js MCP is available, use it for errors, routes, and logs.
- Database-affecting change: verify via the `access-development-database` skill (schema/EXPLAIN/row checks) rather than guessing.
- If you cannot run an expected verification, state the reason in the final summary.

## Scope and Definition of Done

- Keep the change minimal: fix only the requested scope, preserve existing patterns, and do not migrate unrelated files or refactor siblings.
- Do not silently change API contracts, cache semantics, auth/authorization checks, or env handling; call those out explicitly.
- Done means: lint passes, build passes when required above, manual/dev-server check passes for visual or route changes, no secrets exposed, and client messages are generic/safe.

## Communication and Delivery

- After completing a task, suggest one to three related follow-up tasks that represent the natural next steps. Do not execute these additional tasks without my authorization.
