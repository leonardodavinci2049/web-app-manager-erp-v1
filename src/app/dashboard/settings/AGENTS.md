# Settings Route Agent Guide

This file complements the repository and dashboard guides for
`src/app/dashboard/settings`. It governs the `/dashboard/settings` page.

## Route Purpose — currently a stub

The settings route is a **placeholder**. The page renders only the shared header
and a static "Configurações" title and description. The intended content component
(`SettingsPageContent`) is referenced but **commented out** in `page.tsx`.

Do not assume settings is functional. There is no settings form, no Server
Action, no data fetching, and no `getAuthContext()` call — the page gates itself
with a lightweight session check (`auth.api.getSession` +
`redirect("/sign-in")`).

## Page Responsibilities

`page.tsx` is a **Server Component**. It:

1. Resolves the session with `auth.api.getSession({ headers: await headers() })`
   and redirects to `/sign-in` when unauthenticated (the shared header no longer
   performs this check).
2. Renders `SiteHeaderWithBreadcrumb` (title "Dashboard", breadcrumb
   Dashboard → Configurações).
3. Renders a static `<h1>` "Configurações" and a description paragraph.
4. Leaves the content area empty (`{/* <SettingsPageContent /> */}`).

## Folder Structure

```text
settings/
└── page.tsx          # Server: header + static title (content not implemented)
```

## Conventions for Changes

- If you implement settings, introduce `getAuthContext()`, the settings UI, and
  any Server Actions following the repository conventions (Zod validation,
  authorization checks, `createLogger()`, safe client messages).
- Keep `page.tsx` a Server Component; isolate `"use client"` in colocated
  components for any interactive controls.
- Keep user-facing text in Brazilian Portuguese and code/comments in US English.
- Do not present the page as functional until real content is wired.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Visual changes: validate `/dashboard/settings` in the development server
  (port set by the `PORT` env var) — currently just the header and the static title.
- This project currently has no automated test command; do not invent one.
