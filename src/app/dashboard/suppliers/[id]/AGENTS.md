# Supplier Detail Route Agent Guide

This file complements the repository, dashboard, and `suppliers/AGENTS.md` guides
for `src/app/dashboard/suppliers/[id]`. It governs the `/dashboard/suppliers/[id]`
detail route: its page composition, the single edit-form model, the status and
deletion flows, and the supplier image gallery subsystem.

The closest applicable guide specializes broader instructions; repository-level
rules still prevail in case of conflict. For list behavior, URL state, and the
shared create/update/status/delete actions, follow `../AGENTS.md`.

## Detail Page Composition

`page.tsx` is a Server Component that composes the whole detail screen. It stays
free of client state and delegates all interactions to the parent Client
Component. See `../AGENTS.md` ("Detail Page Responsibilities") for the full
numbered sequence; the key points:

1. `await connection()` then `await Promise.all([params, searchParams])`.
2. Validate `id` with `/^\d+$/` plus safe-integer/positive checks, calling
   `notFound()` on invalid input (rendering `not-found.tsx`).
3. Resolve `returnTo` with `getSafeSupplierReturnTo()` (same-origin, pathname
   exactly `/dashboard/suppliers`).
4. `getAuthContext()`, then fetch the single supplier (`getSupplierById`).
5. Render `SupplierDetails` with the supplier DTO, `returnTo`, and two
   server-owned `<Suspense>` nodes: `imageGallery`
   (`SupplierImageGalleryServer`) and `imageContent` (`SupplierImagesListServer`).

The gallery and image nodes are built on the **page** so the Suspense boundaries
stay server-owned and the cached gallery read is shared by both nodes through
React `cache()`.

## Folder Structure

```text
[id]/
├── page.tsx                                  # Detail composition (Server)
├── loading.tsx                               # Detail skeleton
├── error.tsx                                 # Detail error boundary (Client)
├── not-found.tsx                             # Invalid/inaccessible supplier UI
├── _actions/
│   └── supplier-image-gallery-actions.ts     # Gallery upload/primary/delete
└── _components/
    └── image-gallery/
        ├── index.ts
        ├── image-gallery-constants.ts        # Entity type, limits, MIME, defaults
        ├── image-gallery-types.ts            # Gallery state + mutation result DTO
        ├── image-gallery-skeleton.tsx        # Suspense fallback (Server)
        ├── supplier-image-gallery-server.tsx # Cached gallery read (Server)
        ├── supplier-image-gallery-refresh.tsx# State holder + router.refresh (Client)
        ├── supplier-image-gallery.tsx        # Upload + grid + zoom + actions (Client)
        ├── supplier-images-list-server.tsx   # Server wrapper for the PATH_IMAGEM viewer
        └── supplier-images-list.tsx          # PATH_IMAGEM viewer + gallery list (Client)
```

The top-level detail composition (`SupplierDetails`) and the create sheet live in
the **parent** `_components/`, not here. The detail segment owns only the gallery
subsystem and the gallery actions.

## Detail Data Flow

```
[id]/page.tsx (Server)
  ├── validates id -> notFound() on invalid
  ├── getAuthContext()
  ├── getSupplierById() -> UISupplier | undefined   (null -> notFound())
  └── <SupplierDetails> (Client, from ../_components)
        ├── header (SupplierImage, name, status Badge)
        ├── read-only cards (identity, contact, digital, address, PJ, PF)
        ├── edit form (name + notes) -> updateSupplierAction
        ├── "Cadastro" + "Status do cadastro" cards (active status buttons)
        └── <Tabs>
              ├── Imagem   -> imageContent node (<Suspense>, SupplierImagesList)
              └── Exclusão -> delete confirm -> deleteSupplierAction
```

Pass only the `UISupplier` DTO to the components; never forward `apiContext`,
raw entities, or errors.

## `SupplierDetails` Is a Client Component

`SupplierDetails` is a **Client Component** and lives in the **parent**
`_components/`, re-exported from `_components/index.ts`. It owns form/edit state
and drives `router.refresh()` after edits/status changes and
`router.replace(returnTo)` after deletion. The detail body does **not** use
`RegistryPageShell`; it uses a custom `max-w-[1400px]` container.

## Single Mega-Form Editing

Editing is a **single mega-form** (name + notes together), not sectioned. There
are no independent per-section forms and no shared section machinery.

- The detail form renders an "Editar dados do fornecedor" card with a single
  `<form>` submitting name + notes to `updateSupplierAction({ supplierId, name,
  notes })` and calling `router.refresh()` on success. Notes has a
  `notes.length/2.000` counter (maxLength 2000).
- Around the form, read-only cards render: "Conta e identificação" (includes
  `freightForwarder`, `createdAt`, `lastPurchaseAt`, status), "Contato",
  "Presença digital", "Endereço", "Pessoa jurídica", "Pessoa física", and a
  "Cadastro" card.

When adding an editable field, extend `updateSchema`/`createSchema` and the
single form; do not introduce a sectioned model.

## Status Change (Enabled)

Unlike the carriers route (where status is "Pendente de API"), supplier status
change is **enabled**. The "Status do cadastro" card renders active "Marcar como
ativo" / "Marcar como inativo" buttons that submit to
`setSupplierStatusAction({ supplierId, inactive })` and call `router.refresh()`
on success.

## Deletion (Enabled)

The "Excluir fornecedor" button opens an `AlertDialog` confirm; on success it
calls `deleteSupplierAction(supplier.id)` and then `router.replace(returnTo)`.
There is **no client-side referential guard** — the API validates relations and
rejects the deletion when they exist, surfaced via `getSafeOperationMessage()`.

A single `AlertDialog` handles all three confirmations (activate, deactivate,
delete) via a `Confirmation` union.

## Image Gallery Subsystem

The gallery spans Server and Client components and integrates two systems: the
**Assets API** (source of truth for the image set) and the legacy
**`PATH_IMAGEM`** column on `tbl_fornecedor` (denormalized pointer read by the
list and detail UI).

### Components and responsibilities

- `supplier-image-gallery-server.tsx`: exports `getSupplierGalleryInitialState`,
  wrapped in React `cache()`. Reads the Assets API, classifies the result into
  `ready` / `empty` (on `isNotFoundApiError`) / `error` (other), sorts (primary
  first, then `displayOrder`, then `uploadedAt` desc), drops entries without an
  `original` URL, and fills missing URL variants. Shared by the gallery node and
  the images-list node so the Assets API is hit once per request.
- `supplier-image-gallery-refresh.tsx`: Client state holder. Owns `images`,
  `totalImages`, and a `selectionRequest` (`{ imageId, version }`). Bumps the
  version on every external change and triggers `router.refresh()` after
  mutations.
- `supplier-image-gallery.tsx`: the interactive gallery. Drag-and-drop + file
  picker upload (validates MIME and size up front, slices to `availableSlots`),
  thumbnail grid, primary promotion, deletion (with confirmation), keyboard-
  navigable zoom dialog, per-image error fallback to `DEFAULT_SUPPLIERS_IMAGE_URL`,
  `isRemoteImage()` → `unoptimized` on `next/image`, and an `aria-live` status
  region for screen readers.
- `supplier-images-list.tsx`: read-only viewer. Shows the current `PATH_IMAGEM`
  value and the Assets API image list side by side, with a manual refresh button.
  There is **no** "Usar no PATH_IMAGEM" button; promotion is automatic via the
  gallery actions.
- `image-gallery-skeleton.tsx`: Suspense fallback shared by both nodes.
- `image-gallery-constants.ts`: `SUPPLIERS_GALLERY_ENTITY_TYPE` (`"SUPPLIERS"` —
  plural), `SUPPLIERS_GALLERY_LIMIT` (7), `SUPPLIERS_GALLERY_MAX_FILE_SIZE`
  (2 MB), accepted MIME types, `SUPPLIERS_GALLERY_ACCEPT`, and
  `DEFAULT_SUPPLIERS_IMAGE_URL`.
- `image-gallery-types.ts`: `SupplierGalleryImage`, the discriminated
  `SupplierGalleryInitialState`, and `SupplierGalleryMutationResult`.

### Limits, validation, and mutations

- Upload validates MIME type and size on both client and server. Files beyond
  `availableSlots` (`LIMIT - totalImages`) are rejected up front with a per-file
  reason; valid files are uploaded sequentially.
- The last remaining image cannot be deleted; the delete action and the client
  button both enforce this.
- All three mutations (`uploadSupplierImageAction`, `setPrimarySupplierImageAction`,
  `deleteSupplierImageAction`) live in `_actions/supplier-image-gallery-actions.ts`,
  re-resolve auth and ownership via `getAuthorizedSupplierContext()`, and re-read
  the gallery before mutating.

### PATH_IMAGEM synchronization

`PATH_IMAGEM` is kept in sync with the Assets API primary image on three flows,
writing through `generalCallServiceApi.updateTableInlineField` (table
`tbl_fornecedor`, key `ID_FORNECEDOR`, field `PATH_IMAGEM`, max 300 chars):

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
(`DEFAULT_SUPPLIERS_IMAGE_URL`) when adding new image surfaces.

## Server Actions

- Gallery actions live in `_actions/supplier-image-gallery-actions.ts` (this
  folder). They validate with Zod (`SupplierIdSchema`, `AssetIdSchema`,
  `UploadSchema`), re-read the gallery to validate limits/ownership, and call
  `revalidatePath` for both `/dashboard/suppliers` and the detail path after
  `PATH_IMAGEM` writes (inside the `updateSupplierImagePath` helper).
- Create/update/status/delete actions live in `../_actions/supplier-actions.ts`
  (shared with the list route). They re-confirm the supplier exists via
  `getExistingSupplier()` before mutating, then call `revalidateSupplier(id)` to
  refresh both routes.

Do not trust client-side gating. Direct Server Action calls bypass Client
Components, so the re-validation, ownership checks, and limit enforcement must
stay server-side. Use `getSafeOperationMessage()` to surface only safe operation
messages from stored-procedure errors; never leak raw responses or context.

## Cross-Folder Imports

This segment intentionally depends on the parent supplier feature:

- Actions (create/update/status/delete): imported via the absolute alias
  `@/app/dashboard/suppliers/_actions/supplier-actions` by `SupplierDetails`. The
  gallery actions in `_actions/` here are local.
- URL helpers + composition: `[id]/page.tsx` imports `{ SupplierDetails,
  getSafeSupplierReturnTo }` from `../_components`.
- Service: both pages and all actions import from `@/services/api-main/supplier`.

Do not fork these into `[id]/`; keep them pointing at the parent.

## Conventions for Changes

- Preserve `page.tsx` as a Server Component. Keep `"use client"` limited to the
  interactive components (`SupplierDetails`, `SupplierCreateSheet`,
  `SupplierImage`, the gallery clients, `SupplierImagesList`).
- Keep the single mega-form; do not introduce a shared sectioned context or
  per-section actions.
- When adding a new editable field, align together: `updateSchema`/`createSchema`
  in `supplier-actions.ts`, the single `SupplierDetails` form, the
  `updateSupplier`/`createSupplier` payload, and the `UISupplier`/transformer
  field.
- When changing gallery behavior, keep the Assets API as the source of truth for
  the image set and `PATH_IMAGEM` as a denormalized pointer. Any mutation that
  changes the primary image must update `PATH_IMAGEM` through
  `updateSupplierImagePath()` with the 300-char guard.
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
- Visual or interactive changes: validate `/dashboard/suppliers/[id]` in the
  development server (port set by the `PORT` env var) on desktop and mobile, including: valid and
  invalid IDs (`not-found.tsx`), the `returnTo` back link, the single edit form
  (success, validation errors, network failure), status activate/deactivate,
  delete confirm + redirect to `returnTo`, gallery upload (drag-and-drop and
  picker), primary promotion, deletion (including last-image rejection), zoom
  navigation, and the `PATH_IMAGEM` viewer refresh.
- This project currently has no automated test command; do not invent one.
