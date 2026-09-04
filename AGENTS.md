# Agent Guidelines for Manager ERP

Operational guide for agents working in `web-app-manager-erp-v1`. Be concise, follow existing patterns, and prefer editing only what is necessary.

## Product and Stack

- Manager ERP: admin dashboard for catalog, products, brands, categories, customers, orders, reports, CRM, authentication, and multi-organization support.
- Main stack: Next.js 16.2, React 19.2, App Router, React Compiler, Cache Components, strict TypeScript, Biome, Better Auth, mysql2, and HTTP integrations.
- Sources of truth: `package.json`, `next.config.ts`, `tsconfig.json`, `biome.json`, `README.md`, `src/lib/cache-config.ts`, and local Next.js docs.
- If there is an `AGENTS.md` closer to the file being edited, it complements or specializes this guide.

## Commands

```bash
pnpm dev      # dotenv -e .env -- next dev; dev server on the port set by the `PORT` env var (see `.env`)
pnpm lint     # biome check
pnpm format   # biome format --write
pnpm build    # production build
pnpm start    # production start with dotenv
```

This project does not currently use automated tests. Do not invent or suggest test commands; if tests are added in the future, update this file.

## Git Workflow

- This repository follows Git Flow, with `develop` as the integration base for new development work.
- Before changing tracked project files for each new implementation task requested in chat, inspect the current branch and working tree, update the local `develop` from `origin/develop` with a fast-forward-only operation when remote access is available, and create a dedicated `feature/<kebab-case-task-slug>` branch from `develop`. Do not implement directly on `develop` or `main`.
- If the request explicitly continues work already associated with the current feature branch, keep using that branch instead of creating another one.
- Read-only analysis, diagnosis, review, explanation, and status requests do not require a new branch unless they result in project file changes.
- If the `develop` working tree contains local changes that still need to be committed, do not start the new implementation task or create its feature branch. Ask the user to commit those changes first and wait for confirmation before proceeding.
- Preserve existing user changes. If the working tree is not clean or the current checkout cannot safely change branches, stop and report the conflict before creating the feature branch.
- Do not merge, finish, delete, or push a feature branch without explicit user authorization.

## Architecture

- `src/app`: App Router routes, layouts, pages, route handlers, and special files.
- `src/app/actions`: global Server Actions.
- `src/app/**/_actions`: feature/route Server Actions.
- `src/app/**/_components`: feature/route colocated UI; follow the existing local pattern.
- `src/components`: shared components; `src/components/ui` for base/design system components.
- `src/services/api-main/*`: main API integration by module. Read the local `AGENTS.md` before changing anything.
- `src/services/api-assets` and `src/services/api-cep`: specific external integrations.
- `src/services/db/*`: DB/server-only access with mysql2.
- `src/core` and `src/lib`: shared config, logger, auth, helpers, cache, and utilities.
- `src/types` or module-level `types/`: shared types.

## Cross-Repository Work

- When explicitly requested by the user, the agent is authorized to inspect and modify the REST API server repository at `/home/leomer/projects/mercury-projects/srvapi01`.
- Before changing the API server, read and follow its applicable `AGENTS.md` files and preserve any existing user changes.
- Treat the web app and API server as separate Git repositories: inspect their status, validate their changes, and report their results independently.

## Next.js and React

- Server Components by default. `page.tsx` and `layout.tsx` should remain server-side unless there is a real framework exception.
- Use Client Components only for interactive state, events, browser APIs, providers, and client-only libraries. Isolate `"use client"` in the smallest possible component.
- `error.tsx` and `global-error.tsx` are Client Components by App Router convention.
- Data reads belong in Server Components, services, or cached services. Mutations belong in Server Actions.
- Create Route Handlers only when there is a real need for an HTTP endpoint.
- Use absolute imports with `@/` for files inside `src`.
- Default exports are required in App Router special files; otherwise, prefer named exports when they make sense.

## Data, Services, and Mutations

- In `src/services/api-main/*`, preserve the local separation between `*-service-api.ts`, `*-cached-service.ts`, `types`, `validation`, and `transformers`.
- In server-only services, use `import "server-only"` when accessing secrets, the DB, internal APIs, or user context.
- Validate inputs with Zod or an existing schema. Avoid `any`; use `unknown` or specific types.
- Return minimal DTOs to UI and Client Components. Do not expose raw entities, secrets, tokens, or internal errors.
- Server Actions must revalidate authentication and resource/organization authorization, even if the screen has already checked the session.
- Use `createLogger("context")` instead of `console.error` for relevant errors.

## Cache Components

- `cacheComponents: true` and `reactCompiler: true` are enabled in `next.config.ts`.
- Use `"use cache"` only in deterministic functions/components that are safe to cache.
- Use `cacheLife` with the profiles defined in `next.config.ts`.
- Use `cacheTag` with `CACHE_TAGS` from `src/lib/cache-config.ts`.
- After mutations, invalidate with `updateTag`, `revalidateTag`, or `revalidatePath`, depending on the expected effect.
- Do not cache private data without an appropriate key by user, organization, or resource.
- For `cookies()`, `headers()`, `params`, `searchParams`, runtime data, or uncached data, consult the local docs and use `Suspense` when necessary.

## Security and Env

- Never read private variables in Client Components; on the client, use only `NEXT_PUBLIC_*`.
- `.env` and `.env.local` are secrets. Do not log, copy, or expose values.
- Authentication does not replace authorization. Verify ownership, organization, and permissions in actions/services that mutate or return sensitive data.
- Do not import server-only modules in Client Components.
- Client-facing messages must be safe and generic; internal details belong in logs.

## Styling & Components

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

## Style

- Use Biome for formatting and import organization. Do not change lint/format config unless necessary.
- Files in kebab-case; components in PascalCase; functions in camelCase; global constants in UPPER_SNAKE_CASE.
- Keep TypeScript strict and local models. Avoid out-of-scope refactors.

## Language

- The default development language is US English. Code comments, error messages, documentation, and file names should use English.
- User-facing output messages, labels, and interface text should use Brazilian Portuguese because the project is intended for a Brazilian audience.

## Naming conventions

- **Files and folders**: kebab-case (e.g., `app-sidebar.tsx`, `user-profile/`)
- **Component exports**: **ALWAYS PascalCase** — every React component must be named and exported in PascalCase (e.g., `export function AppSidebar()`, `export function UserProfileCard()`).
- **Functions/hooks**: camelCase with `use` prefix for hooks
- **Types/Interfaces**: PascalCase, no `I` prefix

## Verification

- Documentation change: review Markdown; run `pnpm lint` if the change touches code examples or config.
- TS/React change: run `pnpm lint`.
- Route, build, Server Action, cache, config, or integration change: run `pnpm build` when viable.
- Visual/interactive change: validate in the browser/dev server; if the Next.js MCP is available, use it for errors, routes, and logs.
- If you cannot run an expected verification, state the reason in the final summary.

## Communication and Delivery

- After completing a task, suggest one to three related follow-up tasks that represent the natural next steps. Do not execute these additional tasks without my authorization.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
