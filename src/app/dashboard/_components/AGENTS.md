# Dashboard Shared Components Agent Guide

This file complements the repository and dashboard guides for
`src/app/dashboard/_components`. It covers the shared dashboard chrome consumed by
every `/dashboard/*` route: the application sidebar and the site header with
breadcrumb.

Read this before changing navigation, breadcrumbs, or the shared header. For the
shared layout shell, redirect behavior, and dashboard-wide rules, follow
`src/app/dashboard/AGENTS.md`.

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
└── header/
    ├── site-header-with-breadcrumb.tsx  # Server: header + breadcrumb + session user
    ├── header-nav-user.tsx              # Header user chip (real session)
    └── logout-button.tsx                # Sign-out action
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
