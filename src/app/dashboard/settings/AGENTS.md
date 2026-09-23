# Settings Route Agent Guide

This file complements the repository and dashboard guides for
`src/app/dashboard/settings`. It governs the `/dashboard/settings` page.

## Route Purpose

The settings route displays and edits the 14 JSON fields of the authenticated
system client's application configuration. Each field is saved separately.

## Page Responsibilities

`page.tsx` is a **Server Component**. It:

1. Resolves authentication with `getAuthContext()` inside the existing
   `<Suspense>` boundary and rejects invalid system client IDs.
2. Renders `SiteHeaderWithBreadcrumb` (title "Dashboard", breadcrumb
   Dashboard → Configurações).
3. Reads the configuration with the server-defined ID and authenticated API
   context, and handles missing configuration and API failures.
4. Parses each JSON object and passes only the field data needed by the cards.

## Folder Structure

```text
settings/
├── page.tsx                  # Server: authenticated read and page states
├── settings-data.ts         # Server: configuration lookup and JSON mapping
├── _actions/
│   └── settings-actions.ts  # Server: one-field update with renewed auth
└── _components/
    ├── settings-field-definitions.ts  # Allowed JSON fields and property shapes
    └── settings-cards.tsx             # Client: per-card editing and feedback
```

## Conventions for Changes

- Keep `page.tsx` a Server Component and request-dependent reads behind its
  `<Suspense>` boundary. Keep client interactivity in the colocated cards.
- A Server Action must obtain `getAuthContext()` again, validate the system
  client ID, reread the configuration, and use its server-returned register ID.
- Keep the 14-field allowlist in sync with the API contract. Preserve unknown
  JSON properties when editing structured fields and never replace invalid JSON
  without an explicit edit.
- Keep user-facing text in Brazilian Portuguese and code/comments in US English.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Visual changes: validate `/dashboard/settings` in the development server
  (port set by the `PORT` env var), with and without an authenticated session.
- This project currently has no automated test command; do not invent one.
