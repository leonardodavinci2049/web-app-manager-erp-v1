# Dashboard Agent Guide

This file complements the repository-level `AGENTS.md` for
`src/app/dashboard`. It covers the shared dashboard shell, the root redirect,
and conventions that apply to every child route.

Read the closest child `AGENTS.md` before changing a feature route. In
particular:

- `product/AGENTS.md` covers the product catalog and child product routes.
- `product/_components/AGENTS.md` covers catalog UI internals.
- `category/AGENTS.md` covers the category management route.

## Segment Responsibilities

- `layout.tsx` provides the shared organization metadata, sidebar, and content
  inset for every `/dashboard/*` route.
- `page.tsx` is redirect-only. It must not render feature UI or fetch catalog
  data.
- An authenticated request to `/dashboard` redirects to `/dashboard/product`.
- A request without a valid session redirects to `/sign-in`.
- Feature screens belong in explicit child routes such as `category/`,
  `customer/`, `product/`, and `report/`.

## Structure

```text
dashboard/
├── AGENTS.md
├── layout.tsx
├── page.tsx                         # Session-aware redirect only
├── _components/
│   ├── app-sidebar/                 # Shared dashboard navigation
│   └── header/                      # Legacy/local header components
├── category/
├── customer/
├── product/
│   ├── AGENTS.md                    # Product list and child-route guide
│   ├── page.tsx                     # Canonical product catalog
│   ├── loading.tsx
│   ├── _components/
│   │   └── AGENTS.md                # Catalog component guide
│   ├── [id]/                        # Product detail
│   └── new-product/                 # Product creation
└── report/
```

## Root Redirect

Keep `page.tsx` small and server-side:

1. Keep the page component synchronous and render the request-dependent redirect
   child inside a route-local `<Suspense>` boundary.
2. Opt into request-time execution with `connection()` inside that child.
3. Read the session from the current request headers inside the same child.
4. Redirect authenticated users to `/dashboard/product`.
5. Redirect unauthenticated users and session-validation failures to
   `/sign-in`.
6. Re-throw Next.js redirect errors before handling real failures.
7. Log real server errors with `createLogger()`; do not use `console.error`.

Do not move organization-specific API context resolution or feature data
loading into the redirect page.

## Shared Layout and Navigation

- Keep `layout.tsx` as a Server Component.
- Keep the layout component synchronous and resolve organization-specific
  metadata in an async child under `<Suspense>`; session-derived organization
  selection must not use `"use cache"`.
- Do not expose organization metadata, credentials, or server-only context to
  Client Components beyond the minimal serializable values required by an
  existing provider.
- Shared sidebar components remain under `_components/app-sidebar`.
- Navigation to the product catalog must use `/dashboard/product`.
- `/dashboard` remains a valid semantic home entry because it performs the
  authenticated redirect, but feature-specific links should target their
  canonical child route directly.
- When moving or renaming a route, update sidebar entries, breadcrumbs, return
  links, redirects, and post-mutation navigation together.

## Server and Client Boundaries

- Pages and layouts are Server Components by default.
- Keep `"use client"` limited to interactive navigation, browser state,
  providers, and event handlers.
- Authentication in the root page does not replace authorization inside child
  routes, services, or Server Actions.
- Do not import server-only authentication, database, or integration modules
  into shared Client Components.

## Scope Discipline

- Changes to the root redirect should not modify feature behavior.
- Changes to one dashboard feature should avoid unrelated refactors in sibling
  routes.
- Preserve route-local `_components`, `_actions`, `_hooks`, and `_utils`
  conventions where they already exist.
- Follow a closer `AGENTS.md` whenever one is present.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Route, layout, authentication, configuration, integration, or Server Action
  changes: also run `pnpm build` when viable.
- Route changes should be checked in the development server, including
  authenticated and unauthenticated redirect behavior when credentials are
  available.
- This project currently has no automated test command; do not invent one.
