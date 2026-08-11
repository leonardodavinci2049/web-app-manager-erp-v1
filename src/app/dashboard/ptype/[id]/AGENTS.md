# Ptype Detail Route Agent Guide

This file complements the repository, dashboard, and `ptype/AGENTS.md` guides for
`src/app/dashboard/ptype/[id]`. It governs the `/dashboard/ptype/[id]` detail
route: its page composition, the single edit-form model, the status and deletion
flows, and the product-type image gallery subsystem.

The closest applicable guide specializes broader instructions; repository-level
rules still prevail in case of conflict. For list behavior, URL state, and the
create action, follow `../AGENTS.md`.

## Detail Page Composition

`page.tsx` is a Server Component that composes the whole detail screen. It stays
free of client state and delegates all interactions to the colocated Client
Component. See `../AGENTS.md` ("Detail Page Responsibilities") for the full
numbered sequence; the key points:

1. `await connection()` then `await Promise.all([params, searchParams])`.
2. Validate `id` with `/^\d+$/` plus safe-integer/positive checks, calling
   `notFound()` on invalid input. (There is no dedicated `not-found.tsx`; the
   parent default renders.)
3. Resolve `returnTo` with `getSafePtypeReturnTo()` (same-origin, pathname
   exactly `/dashboard/ptype`).
4. `getAuthContext()`, then fetch the single product type (`getPtypeById`).
5. Render `PtypeDetails` (imported from `./_components/ptype-details`) with the
   DTO, `returnTo`, and two server-owned `<Suspense>` nodes: `imageGallery`
   (`PtypeImageGalleryServer`) and `imageContent` (`PtypeImagesListServer`).

The gallery and image nodes are built on the **page** so the Suspense boundaries
stay server-owned and the cached gallery read is shared by both nodes through
React `cache()`.

## Folder Structure

```text
[id]/
├── page.tsx                                # Detail composition (Server)
├── loading.tsx                             # Detail skeleton (NO error.tsx / not-found.tsx)
├── _actions/
│   ├── ptype-detail-actions.ts             # updatePtypeAction, setPtypeStatusAction, deletePtypeAction
│   └── ptype-image-gallery-actions.ts      # Gallery upload/primary/delete
└── _components/
    ├── ptype-details.tsx                   # Top-level detail layout + tabs (Client) — LOCAL
    └── image-gallery/
        ├── index.ts
        ├── image-gallery-constants.ts      # Entity type, limits, MIME, defaults
        ├── image-gallery-types.ts          # Gallery state + mutation result DTO
        ├── image-gallery-skeleton.tsx      # Suspense fallback (Server)
        ├── ptype-image-gallery-server.tsx  # Cached gallery read (Server)
        ├── ptype-image-gallery-refresh.tsx # State holder + router.refresh (Client)
        ├── ptype-image-gallery.tsx         # Upload + grid + zoom + actions (Client)
        ├── ptype-images-list-server.tsx    # Server wrapper for the PATH_IMAGEM viewer
        └── ptype-images-list.tsx           # PATH_IMAGEM viewer + gallery list (Client)
```

The detail segment has **no** `error.tsx` and **no** `not-found.tsx` — `notFound()`
renders the nearest parent not-found UI and unhandled errors bubble to the parent
boundary. `PtypeDetails` lives **locally** here (brand-style placement); it is
imported directly from `./_components/ptype-details`, not re-exported from the
parent `_components/index.ts`.

## Detail Data Flow

```
[id]/page.tsx (Server)
  ├── validates id -> notFound() on invalid
  ├── getAuthContext()
  ├── getPtypeById() -> UIPtype | undefined   (null -> notFound())
  └── <PtypeDetails> (Client, from ./_components)
        ├── header (PtypeImage, name, status Badge)
        ├── "Detalhes do tipo" read-only card (status, registration flag, dates, commission rates)
        ├── edit form (name + notes) -> updatePtypeAction
        ├── "Cadastro" + "Status do cadastro" cards (active status buttons)
        └── <Tabs>
              ├── Imagem   -> imageContent node (<Suspense>, PtypeImagesList)
              └── Exclusão -> delete confirm -> deletePtypeAction
```

Pass only the `UIPtype` DTO to the components; never forward `apiContext`, raw
entities, or errors.

## `PtypeDetails` Is a Client Component

`PtypeDetails` is a **Client Component** living **locally** in
`[id]/_components/ptype-details.tsx` (brand-style placement, unlike carriers/
suppliers/seller whose detail component lives in the parent `_components/`). It
owns form state and drives `router.refresh()` after update/status and
`router.replace(returnTo)` after delete. The detail body does **not** use
`RegistryPageShell`; it uses a custom `max-w-[1400px]` container.

## Single Mega-Form Editing

Editing is a **single mega-form** ("Dados do cadastro": name + notes together),
not sectioned. There are no independent per-section forms and no shared section
machinery.

- The detail form submits name + notes to `updatePtypeAction({ ptypeId, name,
  notes })` and calls `router.refresh()` on success. Notes has a
  `notes.length/2.000` counter (maxLength 2000).
- Around the form, a read-only "Detalhes do tipo" card shows status,
  `productRegistrationFlag` (Habilitado/Não habilitado), `createdAt`, and the
  `retailCommissionRate` / `wholesaleCommissionRate` percentages.

When adding an editable field, extend `updateSchema` in
`ptype-detail-actions.ts` and the single form; do not introduce a sectioned
model.

## Status Change (Enabled)

The "Status do cadastro" card renders active "Marcar como ativo" / "Marcar como
inativo" buttons that submit to `setPtypeStatusAction({ ptypeId, inactive })` and
call `router.refresh()` on success.

## Deletion (Enabled)

The "Excluir tipo de produto" button opens an `AlertDialog` confirm; on success
it calls `deletePtypeAction(item.id)` and then `router.replace(returnTo)`. There
is **no client-side referential guard** — the API validates relations and
rejects the deletion when they exist, surfaced via `getSafeOperationMessage()`.

A single `AlertDialog` handles all three confirmations (activate, deactivate,
delete) via a `Confirmation` union.

## Image Gallery Subsystem

The gallery spans Server and Client components and integrates two systems: the
**Assets API** (source of truth for the image set) and the legacy
**`PATH_IMAGEM`** column on `tbl_produto_tipo` (denormalized pointer read by the
list and detail UI).

### Components and responsibilities

- `ptype-image-gallery-server.tsx`: exports `getPtypeGalleryInitialState`,
  wrapped in React `cache()`. Reads the Assets API, classifies the result into
  `ready` / `empty` (on `isNotFoundApiError`) / `error` (other), sorts (primary
  first, then `displayOrder`, then `uploadedAt` desc), drops entries without an
  `original` URL, and fills missing URL variants. Shared by the gallery node and
  the images-list node so the Assets API is hit once per request.
- `ptype-image-gallery-refresh.tsx`: Client state holder. Owns `images`,
  `totalImages`, and a `selectionRequest` (`{ imageId, version }`). Bumps the
  version on every external change and triggers `router.refresh()` after
  mutations.
- `ptype-image-gallery.tsx`: the interactive gallery. Drag-and-drop + file
  picker upload (validates MIME and size up front, slices to `availableSlots`),
  thumbnail grid, primary promotion, deletion (with confirmation), keyboard-
  navigable zoom dialog, per-image error fallback to `DEFAULT_PTYPE_IMAGE_URL`,
  `isRemoteImage()` → `unoptimized` on `next/image`, and an `aria-live` status
  region for screen readers.
- `ptype-images-list.tsx`: read-only viewer. Shows the current `PATH_IMAGEM`
  value and the Assets API image list side by side, with a manual refresh button.
  There is **no** "Usar no PATH_IMAGEM" button; promotion is automatic via the
  gallery actions.
- `image-gallery-skeleton.tsx`: Suspense fallback shared by both nodes.
- `image-gallery-constants.ts`: `PTYPE_GALLERY_ENTITY_TYPE` (`"PTYPE"`),
  `PTYPE_GALLERY_LIMIT` (7), `PTYPE_GALLERY_MAX_FILE_SIZE` (10 MB), accepted MIME
  types, `PTYPE_GALLERY_ACCEPT`, and `DEFAULT_PTYPE_IMAGE_URL`.
- `image-gallery-types.ts`: `PtypeGalleryImage`, the discriminated
  `PtypeGalleryInitialState`, and `PtypeGalleryMutationResult`.

### Limits, validation, and mutations

- Upload validates MIME type and size on both client and server. Files beyond
  `availableSlots` (`LIMIT - totalImages`) are rejected up front with a per-file
  reason; valid files are uploaded sequentially.
- The last remaining image cannot be deleted; the delete action and the client
  button both enforce this.
- All three mutations (`uploadPtypeImageAction`, `setPrimaryPtypeImageAction`,
  `deletePtypeImageAction`) live in `_actions/ptype-image-gallery-actions.ts`,
  re-resolve auth and ownership via `getAuthorizedPtypeContext()`, and re-read
  the gallery before mutating.

### PATH_IMAGEM synchronization

`PATH_IMAGEM` is kept in sync with the Assets API primary image on three flows,
writing through `generalCallServiceApi.updateTableInlineField` (table
`tbl_produto_tipo`, key `ID_TIPO`, field `PATH_IMAGEM`, max 300 chars):

1. **First upload**: the first image is marked primary and its `original` URL is
   written to `PATH_IMAGEM`.
2. **Primary change**: the newly primary image URL is written to `PATH_IMAGEM`.
   If the image was already primary, the action still repairs `PATH_IMAGEM`.
3. **Primary deletion**: the next candidate (by sort order) is promoted to
   primary and its URL is written to `PATH_IMAGEM`.

If the original URL is empty or exceeds 300 characters, the `PATH_IMAGEM` write
is skipped and the action returns a `warning`. The asset operation is **not**
rolled back; the warning is a partial-success signal surfaced as a toast. Keep
this behavior unless the API gains transactional semantics.

### Remote images and `next/image`

Remote gallery URLs use `unoptimized` on `next/image` because they are served by
the Assets API. Keep the `isRemoteImage()` check and the per-image error fallback
(`DEFAULT_PTYPE_IMAGE_URL`) when adding new image surfaces.

## Server Actions

- Detail actions live in `_actions/ptype-detail-actions.ts` (this folder):
  `updatePtypeAction`, `setPtypeStatusAction`, `deletePtypeAction`. They validate
  with Zod, re-resolve auth and ownership via `getExistingPtype()`, and
  revalidate **only** `/dashboard/ptype` (brand-style). The client calls
  `router.refresh()` to refresh the detail view. If you add server-side caching
  to the detail route, add the detail `revalidatePath` here.
- Gallery actions live in `_actions/ptype-image-gallery-actions.ts` (this
  folder). They validate with Zod (`PtypeIdSchema`, `AssetIdSchema`,
  `UploadSchema`), re-read the gallery to validate limits/ownership, and call
  `revalidatePath` for both `/dashboard/ptype` and the detail path after
  `PATH_IMAGEM` writes (inside the `updatePtypeImagePath` helper).
- `createPtypeAction` lives in the parent `_actions/ptype-actions.ts`.

There is **no** `revalidatePtype()` helper. Do not trust client-side gating:
direct Server Action calls bypass Client Components, so the re-validation,
ownership checks, and limit enforcement must stay server-side. Use
`getSafeOperationMessage()` to surface only safe operation messages from
stored-procedure errors; never leak raw responses or context.

## Cross-Folder Imports

This segment depends on the parent ptype feature for:

- URL helpers: `getSafePtypeReturnTo`, `buildPtypeDetailHref` from
  `../_components` (re-exported via `_components/index.ts`).
- Types: `PtypeActionResult` from `../_components/types/ptype-dashboard-types`.
- List avatar: `PtypeImage` from `../../_components/ptype-image`.

Unlike carriers/suppliers (whose mutations are shared in the parent `_actions`),
ptype keeps its detail mutations **local** to this segment. Only
`createPtypeAction` lives in the parent `_actions/ptype-actions.ts`. Keep this
split; do not move detail actions into the parent or vice versa.

## Conventions for Changes

- Preserve `page.tsx` as a Server Component. Keep `"use client"` limited to the
  interactive components (`PtypeDetails`, `PtypeCreateSheet`, `PtypeImage`, the
  gallery clients, `PtypeImagesList`).
- Keep the single mega-form; do not introduce a shared sectioned context or
  per-section actions.
- When adding a new editable field, align together: `updateSchema` in
  `ptype-detail-actions.ts`, the single `PtypeDetails` form, the `updatePtype`
  payload, and the `UIPtype`/transformer field.
- When changing gallery behavior, keep the Assets API as the source of truth for
  the image set and `PATH_IMAGEM` as a denormalized pointer. Any mutation that
  changes the primary image must update `PATH_IMAGEM` through
  `updatePtypeImagePath()` with the 300-char guard.
- Preserve accessibility: `aria-pressed` on gallery thumbnails, `aria-live`
  status region in the gallery, keyboard navigation in the zoom dialog, and
  descriptive labels on icon-only buttons.
- Use `createLogger()` for relevant errors and return generic, safe Brazilian
  Portuguese messages to the client.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Route, Server Action, cache behavior, or integration changes: also run
  `pnpm build` when viable.
- Visual or interactive changes: validate `/dashboard/ptype/[id]` in the
  development server (port 5581) on desktop and mobile, including: valid and
  invalid IDs (parent `not-found` UI), the `returnTo` back link, the single edit
  form (success, validation errors, network failure), status activate/deactivate,
  delete confirm + redirect to `returnTo`, gallery upload (drag-and-drop and
  picker), primary promotion, deletion (including last-image rejection), zoom
  navigation, and the `PATH_IMAGEM` viewer refresh.
- This project currently has no automated test command; do not invent one.
