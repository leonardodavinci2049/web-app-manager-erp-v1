# Settings Route Agent Guide

This file complements the repository and dashboard guides for
`src/app/dashboard/settings`. It governs the `/dashboard/settings` list and the
`/dashboard/settings/[id]` detail page.

## Route Purpose

The `/dashboard/settings` route lists up to 50 application configurations that
belong to the authenticated system client. It supports server-normalized search
by name or ID plus a browser-persisted grid/list preference. The
`/dashboard/settings/[id]` route follows the shared registration-detail layout.
It edits four basic fields, `NOTES`, and the 14 JSON fields of the selected
configuration. Each field is saved separately. Its `APP` image gallery uses the
Assets API and keeps `PATH_IMAGEM` synchronized with the primary image.

## Page Responsibilities

`page.tsx` and `[id]/page.tsx` are **Server Components**. The list page:

1. Resolves `searchParams` and authentication inside its local `<Suspense>`
   boundary.
2. Sends only the normalized `search` value, a fixed limit of 50, and the
   authenticated API context to `findAllAppConfigs`.
3. Maps API summaries to a minimal presentation DTO before rendering the client
   toolbar.
4. Uses cards in grid mode, horizontal cards below `lg` in list mode, and a
   semantic table from `lg` onward.
5. Distinguishes an empty client, a search without matches, and an API failure.

The detail page:

1. Resolves route `params`, `searchParams`, and authentication inside its local
   `<Suspense>` boundary.
2. Validates `[id]` as a positive safe integer and uses it as the only source of
   the selected configuration ID.
3. Reads the configuration with the authenticated API context, verifies that
   the returned `ID` matches the route ID, and returns `notFound()` for missing
   or unauthorized records.
4. Accepts only a normalized `/dashboard/settings` URL as `returnTo`.
5. Parses each JSON object and passes only the minimal detail data and field data
   needed by the local components.
6. Composes `DetailPageLayout`, keeps the desktop gallery in the left column,
   and provides the mobile gallery through `DetailImageTab`.

## Folder Structure

```text
settings/
├── page.tsx                  # Server: authenticated list orchestration
├── settings-data.ts         # Server: authorized detail lookup and JSON mapping
├── _components/
│   ├── settings-app-image.tsx       # Shared list/detail image with fallback
│   ├── settings-list.tsx            # Server: states, cards, and desktop table
│   ├── settings-list-params.ts      # Search URL, detail link, and safe returnTo
│   ├── settings-list-toolbar.tsx    # Client: search and view preference
│   └── settings-list-types.ts       # Minimal presentation DTO
├── [id]/
│   ├── page.tsx              # Server: route-ID read and page states
│   ├── _actions/
│   │   ├── settings-actions.ts               # Basic, notes, and JSON updates
│   │   └── settings-image-gallery-actions.ts # Gallery mutations + PATH sync
│   └── _components/
│       ├── settings-detail-layout.tsx      # Shared detail-shell composition
│       ├── settings-detail-types.ts        # Minimal detail DTO
│       ├── settings-field-definitions.ts   # Allowed JSON fields/property shapes
│       ├── settings-cards.tsx              # Per-card JSON editing and feedback
│       ├── overview/                        # Heading + basic-field card
│       ├── tabs/                            # Notes, images, disabled deletion
│       └── image-gallery/                   # APP gallery server/client subsystem
```

## Conventions for Changes

- Keep `[id]/page.tsx` a Server Component and request-dependent reads behind its
  `<Suspense>` boundary. Keep client interactivity in the colocated cards.
- Keep the list limit fixed at 50. Do not add filters, pagination, creation,
  total counters, load-more behavior, or image upload without a new contract.
- Keep the search state limited to the `search` query parameter with at most
  100 characters. Grid/list is a client preference and does not belong in the
  URL.
- Use `PATH_IMAGEM` only as the image source and
  `/default-images/app-config.png` as the fallback.
- A Server Action must obtain `getAuthContext()` again, validate the system
  client ID, validate the received configuration ID, reread that configuration,
  verify the returned ID, and use only its server-returned register ID.
- Revalidate both `/dashboard/settings` and the exact detail path after a
  successful update.
- Keep the 14-field allowlist in sync with the API contract. Preserve unknown
  JSON properties when editing structured fields and never replace invalid JSON
  without an explicit edit.
- Use `EntityType: "APP"` and image files only for the gallery. Keep the
  seven-image, 2 MB, JPEG/PNG/GIF/WebP limits enforced on both client and
  server. Gallery actions must reread the authorized configuration and gallery
  before mutating.
- Keep the primary asset original URL synchronized into `PATH_IMAGEM` after the
  first upload, a primary change, or primary-image deletion. Asset mutations
  are not transactional with the app-config API, so surface a safe partial-
  success warning when the asset operation succeeds but `PATH_IMAGEM` fails.
- Keep the primary image first during reordering and reject reordered ID lists
  that do not exactly match the current authorized gallery.
- The deletion tab is intentionally visual-only: its controls remain disabled
  and no delete action exists until an explicit contract is added.
- Keep user-facing text in Brazilian Portuguese and code/comments in US English.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Visual changes: validate `/dashboard/settings` and
  `/dashboard/settings/<id>` in the development server (port set by the `PORT`
  env var), including search, both view modes, safe return, image fallback,
  invalid IDs, and authenticated update isolation between different records.
- This project currently has no automated test command; do not invent one.
