# Dashboard Shared Components Agent Guide

This file complements the repository and dashboard guides for
`src/app/dashboard/_components`. It covers the shared dashboard chrome consumed by
every `/dashboard/*` route: the application sidebar, the site header with
breadcrumb, and the shared registration detail-page shells.

Read this before changing navigation, breadcrumbs, the shared header, or any
registration detail layout. For the shared layout shell, redirect behavior, and
dashboard-wide rules, follow `src/app/dashboard/AGENTS.md`. For the full detail
route contract, follow
`docs/architectural-patterns/registration-details-page/registration-details-page.md`.

## Scope

```text
_components/
├── app-sidebar/
│   ├── app-sidebar.tsx          # Client: Sidebar shell + HARDCODED nav data
│   ├── nav-main.tsx             # Renders the navMain sections passed from app-sidebar
│   ├── nav-projects.tsx         # Renders the projects list passed from app-sidebar
│   ├── nav-user.tsx             # Sidebar footer user menu (reads the real session via useUserData)
│   ├── sidebar-logo.tsx         # Brand/logo block in the sidebar header
│   └── team-switcher.tsx        # Team/workspace selector
├── header/
│   ├── site-header-with-breadcrumb.tsx  # Server: header + breadcrumb + session user
│   ├── header-nav-user.tsx              # Header user chip (real session)
│   └── logout-button.tsx                # Sign-out action
└── detail-page/                 # Shared registration detail shells (all 8 detail routes)
    ├── index.ts                 # Public API
    ├── detail-back-link.tsx     # Back-to-list button
    ├── detail-page-layout.tsx   # Grid + sticky gallery aside + heading/overview + tabs slot
    ├── overview/
    │   └── detail-record-heading.tsx   # Record heading; image rendered only below lg
    ├── tabs/
    │   ├── detail-tabs-list.tsx        # Scrollable TabsList + static desktop grid class
    │   ├── detail-tab-trigger.tsx      # TabsTrigger with the standard responsive classes
    │   └── detail-deletion-card.tsx    # "Zona de exclusão" danger-zone frame
    ├── image-gallery/
    │   └── detail-image-tab.tsx        # Imagem tab composition (mobile gallery + content)
    └── loading/
        └── registry-detail-loading.tsx # Detail segment skeletons (moved from src/components/registry)
```

## AppSidebar

`app-sidebar.tsx` is a **Client Component** (`"use client"`). It renders the shadcn
`Sidebar` shell and delegates sections to `NavMain`, `NavProjects`, `NavUser`, and
`SidebarLogo`.

### Hardcoded navigation data is a manual sync point

The navigation tree is a **hardcoded `data` object** inside `app-sidebar.tsx`, not
derived from the router or a config file. `data.navMain` groups routes into
sections ("Painel", "Compras", "Entrada de produtos", "Relatórios") and
`data.projects` holds the quick-access list.

- When a route is added, renamed, or moved, update `data.navMain` (or
  `data.projects`) here by hand. There is no build-time check that these links
  resolve.
- "Compras" and "Entrada de produtos" intentionally point their items at
  `/dashboard/development` (not yet implemented). "Relatórios" points at the real
  `/dashboard/report/*` routes.
- The "Painel" section is currently in sync with the registry routes
  (`catalog`, `category`, `customer`, `seller`, `brand`, `ptype`, `suppliers`,
  `carriers`).

When changing a route, update the sidebar entries together with breadcrumbs,
return links, redirects, and post-mutation navigation in that route (see
`src/app/dashboard/AGENTS.md`, "Shared Layout and Navigation").

### Sample user data

`data.teams` is **sample data** carried over from the shadcn template. The
sidebar footer `NavUser` no longer receives a hardcoded user: it reads the
authenticated session itself through `useUserData()` (same hook as the header
`HeaderNavUser`) and signs out through `useAuth()`. Do not reintroduce a
hardcoded/sample `user` object into `data` or pass it to `NavUser`.

## SiteHeaderWithBreadcrumb

`header/site-header-with-breadcrumb.tsx` is an **async Server Component**. It:

1. Resolves the session with `auth.api.getSession({ headers: await headers() })`.
2. Redirects to `/sign-in` when there is no session.
3. Renders the `SidebarTrigger`, a `Breadcrumb` built from the `breadcrumbItems`
   prop, a mobile title, `ModeToggle`, `LogoutButton`, and `NavUser` (which reads
   the real session client-side itself, inside `<Suspense>`).

Props:

- `title?: string` — shown on small screens (defaults to "Dashboard").
- `breadcrumbItems?: Array<{ label: string; href?: string; isActive?: boolean }>`
  — the last active item renders as `BreadcrumbPage`; others render as links. Use
  `isActive` on the current page crumb and `href` on ancestor crumbs.

This header is the standard top bar for most feature routes (catalog, category,
customer, brand, carriers, etc.). Pass route-appropriate `title` and
`breadcrumbItems` from each page; do not duplicate session resolution in the
page.

## Detail-Page Shared Shells

`detail-page/` holds only entity-agnostic visual/structural composition reused
by the registration detail routes (customer, seller, suppliers, carriers,
brand, ptype, entry, product). Each component receives primitives or
`ReactNode` props and never branches per entity. Domain DTOs, contracts,
Server Actions, forms, confirmation flows, gallery limits, and messages stay in
each route.

Conventions:

- Import shared shells from `@/app/dashboard/_components/detail-page`.
- The record heading image is rendered only below `lg`; on desktop the sticky
  gallery aside is the single image surface.
- Tab order in every route: **Anotações** first, **Imagem** after the common
  tabs and before domain-specific ones, **Exclusão** last.
- `RegistryDetailLoading` lives here (not in `src/components/registry`) because
  only detail routes consume it; `RegistryEntityImage` and `RegistryPageShell`
  remain in `src/components/registry` shared with the listings.
- Do not add entity-specific props, permissions, or conditional entity rules to
  these components.

## Conventions for Changes

- Keep `AppSidebar` and `SiteHeaderWithBreadcrumb` free of feature data; they are
  shared chrome. Feature-specific UI belongs in the route's own `_components/`.
- When adding a route, update the manual navigation indexes together:
  `app-sidebar.tsx` (`data.navMain` / `data.projects`) and the `welcome` page
  `modules` array (which currently has stale links — see
  `src/app/dashboard/welcome/AGENTS.md`). The sidebar is the source of truth for
  primary navigation.
- Do not pass server-only auth, database, or integration modules into the Client
  sidebar. `NavUser` resolves the session client-side via `useUserData()`; do not
  hand it a server-resolved user object.
- Keep user-facing text in Brazilian Portuguese and code/comments in US English.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Navigation, layout, or auth-redirect changes: also run `pnpm build` when viable,
  and validate the sidebar links, breadcrumbs, and the unauthenticated redirect
  in the development server (port set by the `PORT` env var).
- This project currently has no automated test command; do not invent one.
