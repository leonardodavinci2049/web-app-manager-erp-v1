# Welcome Route Agent Guide

This file complements the repository and dashboard guides for
`src/app/dashboard/welcome`. It governs the `/dashboard/welcome` landing/index
page.

## Route Purpose

The welcome route is a personalized landing page that indexes the main modules.
It supports:

- A personalized greeting built from the authenticated session (first name,
  initials, role, email, avatar).
- An `authWarning` alert when the session carries one (e.g. a soft auth state).
- A module index (`modules`) of quick-access cards and a duplicate quick-access
  list, each linking to a dashboard module.

It is **not** the default authenticated destination: `/dashboard` redirects to
`/dashboard/catalog` (see `src/app/dashboard/AGENTS.md`). Reach `/dashboard/welcome`
through the sidebar projects list.

## Page Responsibilities

`page.tsx` is a **Server Component** with a synchronous route shell. It:

1. Renders the async `WelcomePageContent` inside a route-local `<Suspense>`
   boundary with an accessible loading fallback.
2. Calls `await getAuthContext()` inside that child and destructures
   `{ session, authWarning }`.
3. Derives `firstName`, `userInitials`, and a formatted `userRole` from
   `session.user`.
4. Renders `SiteHeaderWithBreadcrumb` (title "Início") and the greeting card,
   conditionally showing the `authWarning` `Alert`.
5. Renders the `modules` card grid and the quick-access list, plus the
   `quickInfoItems` summary.

There is no data fetching beyond the session. `connection()` is not needed
because `getAuthContext()` already accesses request-time headers; keep that
private runtime access inside `WelcomePageContent` and never cache it.

## Folder Structure

```text
welcome/
└── page.tsx          # Server: greeting + authWarning + module index
```

## Stale Module Links

The `modules` array is **hardcoded** and currently **out of sync** with the real
routes. Treat it as a manual index, not a source of truth:

- "Cadastro de Clientes" links to `/dashboard/customer/customer-list` — the real
  route is `/dashboard/customer`.
- "Marcas", "Fornecedores", "Transportadoras", "Entradas de Produtos", and
  "Compras" link to `/dashboard/development` (the maintenance/stub route), even
  though `brand`, `suppliers`, and `carriers` routes now exist.
- "Catálogo de Produtos", "Cadastro de Categorias", and "Relatórios" link to
  real routes (`/dashboard/catalog`, `/dashboard/category`,
  `/dashboard/report/panel`).

When wiring a module to its real route, update the `href` here. The authoritative
primary navigation lives in `src/app/dashboard/_components/app-sidebar/app-sidebar.tsx`
(`data.navMain`); keep both in sync. See
`src/app/dashboard/_components/AGENTS.md`.

## Conventions for Changes

- Keep `page.tsx` a Server Component and its route shell synchronous. If
  interactive behavior is added later, isolate `"use client"` in a colocated
  component.
- The `modules` and `quickInfoItems` arrays are presentation data; do not put
  secrets, tokens, or server-only context in them.
- Keep user-facing text in Brazilian Portuguese and code/comments in US English.
- Do not present stub modules (those pointing at `/dashboard/development`) as
  functional.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Visual changes: validate `/dashboard/welcome` in the development server
  (port set by the `PORT` env var) on desktop and mobile, including the greeting, the `authWarning`
  state, and the module links (real vs. maintenance).
- This project currently has no automated test command; do not invent one.
