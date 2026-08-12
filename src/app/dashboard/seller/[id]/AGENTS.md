# Seller Detail Route Agent Guide

This file complements the repository, dashboard, and `seller/AGENTS.md` guides for
`src/app/dashboard/seller/[id]`. It governs the `/dashboard/seller/[id]` detail
route: its read-only page composition, the `SellerDetails` Server component, and
the seller image gallery subsystem.

The closest applicable guide specializes broader instructions; repository-level
rules still prevail in case of conflict. For list behavior and URL state, follow
`../AGENTS.md`.

## Detail Page Composition

`page.tsx` is a Server Component that composes the whole detail screen. It stays
free of client state; the detail has no editing at all. See `../AGENTS.md`
("Detail Page Responsibilities") for the full numbered sequence; the key points:

1. `await connection()` then `await Promise.all([params, searchParams])`.
2. Validate `id` with `/^\d+$/` plus safe-integer/positive checks, calling
   `notFound()` on invalid input (rendering `not-found.tsx`).
3. Resolve `returnTo` with `getSafeSellerReturnTo()` (same-origin, pathname
   exactly `/dashboard/seller`).
4. `getAuthContext()`, then fetch the single seller (`getSellerById`).
5. Render `SellerDetails` with the seller DTO, `returnTo`, and two server-owned
   `<Suspense>` nodes: `imageGallery` (`SellerImageGalleryServer`) and
   `imageContent` (`SellerImagesListServer`).

The gallery and image nodes are built on the **page** so the Suspense boundaries
stay server-owned and the cached gallery read is shared by both nodes through
React `cache()`.

## Folder Structure

```text
[id]/
├── page.tsx                                  # Detail composition (Server)
├── loading.tsx                               # Detail skeleton
├── error.tsx                                 # Detail error boundary (Client)
├── not-found.tsx                             # Invalid/inaccessible seller UI
├── _actions/
│   └── seller-image-gallery-actions.ts       # Gallery upload/primary/delete (ONLY actions)
└── _components/
    └── image-gallery/
        ├── index.ts
        ├── image-gallery-constants.ts        # Entity type, limits, MIME, defaults
        ├── image-gallery-types.ts            # Gallery state + mutation result DTO
        ├── image-gallery-skeleton.tsx        # Suspense fallback (Server)
        ├── seller-image-gallery-server.tsx   # Cached gallery read (Server)
        ├── seller-image-gallery-refresh.tsx  # State holder + router.refresh (Client)
        ├── seller-image-gallery.tsx          # Upload + grid + zoom + actions (Client)
        ├── seller-images-list-server.tsx     # Server wrapper for the PATH_IMAGEM viewer
        └── seller-images-list.tsx            # PATH_IMAGEM viewer + gallery list (Client)
```

The top-level detail composition (`SellerDetails`) lives in the **parent**
`_components/`, re-exported from `_components/index.ts`. The detail segment owns
only the gallery subsystem and the gallery actions.

## Detail Data Flow

```
[id]/page.tsx (Server)
  ├── validates id -> notFound() on invalid
  ├── getAuthContext()
  ├── getSellerById() -> UISellerDetail | undefined   (null -> notFound())
  └── <SellerDetails> (Server, from ../_components)
        ├── header (SellerImage, name, status)
        ├── read-only cards (identity, business/personal, contacts)
        ├── "Operações" card (disabled "Pendente de API" buttons)
        ├── "Cadastro" card
        └── <Tabs>
              ├── Imagem   -> imageContent node (<Suspense>, SellerImagesList)
              └── Exclusão -> disabled "Excluir — Pendente de API" button
```

Pass only the `UISellerDetail` DTO to the components; never forward `apiContext`,
raw entities, or errors.

## `SellerDetails` Is a Read-Only Server Component

`SellerDetails` is a **Server Component** — unique among the registry routes
(brand/carriers/suppliers/ptype all use Client detail components). It is read-only:
there is no form, no edit state, no `router.refresh()`/`router.replace()`, and no
create/update/delete/status actions wired. Do not "fix" this by converting it to a
Client Component without re-enabling mutations end-to-end (action + ownership
re-check + revalidation + UI control).

Composition:

- Read-only cards: "Identificação", "Dados empresariais" (when business data is
  present) / "Dados pessoais" (otherwise, conditional on
  `cnpj || legalName || tradeName`), and "Contatos e documentos".
- An "Operações" card with disabled "Editar / Ativar / Inativar — Pendente de
  API" buttons.
- A "Cadastro" card.
- A `<Tabs>` with two tabs: `image` (the `imageContent` node) and `deletion`
  (default) — the deletion tab is a disabled "Excluir — Pendente de API" button
  inside a "Zona de exclusão" card with a "Pendente de API" badge.

## Image Gallery Subsystem

The gallery spans Server and Client components and integrates two systems: the
**Assets API** (source of truth for the image set) and the legacy
**`PATH_IMAGEM`** column on `tbl_pessoa` (denormalized pointer read by the list
and detail UI). Sellers are people records in the shared `tbl_pessoa` table.

### Components and responsibilities

- `seller-image-gallery-server.tsx`: exports `getSellerGalleryInitialState`,
  wrapped in React `cache()`. Reads the Assets API, classifies the result into
  `ready` / `empty` (on `isNotFoundApiError`) / `error` (other), sorts (primary
  first, then `displayOrder`, then `uploadedAt` desc), drops entries without an
  `original` URL, and fills missing URL variants. Shared by the gallery node and
  the images-list node so the Assets API is hit once per request.
- `seller-image-gallery-refresh.tsx`: Client state holder. Owns `images`,
  `totalImages`, and a `selectionRequest` (`{ imageId, version }`). Bumps the
  version on every external change and triggers `router.refresh()` after
  mutations.
- `seller-image-gallery.tsx`: the interactive gallery. Drag-and-drop + file
  picker upload (validates MIME and size up front, slices to `availableSlots`),
  thumbnail grid, primary promotion, deletion (with confirmation), keyboard-
  navigable zoom dialog, per-image error fallback to `DEFAULT_SELLER_IMAGE_URL`,
  `isRemoteImage()` → `unoptimized` on `next/image`, and an `aria-live` status
  region for screen readers.
- `seller-images-list.tsx`: read-only viewer. Shows the current `PATH_IMAGEM`
  value and the Assets API image list side by side, with a manual refresh button.
  There is **no** "Usar no PATH_IMAGEM" button; promotion is automatic via the
  gallery actions.
- `image-gallery-skeleton.tsx`: Suspense fallback shared by both nodes.
- `image-gallery-constants.ts`: `SELLER_GALLERY_ENTITY_TYPE` (`"SELLER"`),
  `SELLER_GALLERY_LIMIT` (7), `SELLER_GALLERY_MAX_FILE_SIZE` (10 MB), accepted
  MIME types, `SELLER_GALLERY_ACCEPT`, and `DEFAULT_SELLER_IMAGE_URL`.
- `image-gallery-types.ts`: `SellerGalleryImage`, the discriminated
  `SellerGalleryInitialState`, and `SellerGalleryMutationResult`.

### Limits, validation, and mutations

- Upload validates MIME type and size on both client and server. Files beyond
  `availableSlots` (`LIMIT - totalImages`) are rejected up front with a per-file
  reason; valid files are uploaded sequentially.
- The last remaining image cannot be deleted; the delete action and the client
  button both enforce this.
- All three mutations (`uploadSellerImageAction`, `setPrimarySellerImageAction`,
  `deleteSellerImageAction`) live in `_actions/seller-image-gallery-actions.ts`,
  re-resolve auth and ownership via `getAuthorizedSellerContext()`, and re-read
  the gallery before mutating.

### PATH_IMAGEM synchronization

`PATH_IMAGEM` is kept in sync with the Assets API primary image on three flows,
writing through `generalCallServiceApi.updateTableInlineField` (table `tbl_pessoa`,
key `ID_TBL_PESSOA`, field `PATH_IMAGEM`, max 300 chars, `FIELD_TYPE.STRING`):

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
(`DEFAULT_SELLER_IMAGE_URL`) when adding new image surfaces.

## Server Actions

- Gallery actions live in `_actions/seller-image-gallery-actions.ts` (this
  folder). They validate with Zod (`SellerIdSchema`, `AssetIdSchema`,
  `UploadSchema`), re-read the gallery to validate limits/ownership, and call
  `revalidatePath` for `/dashboard/seller` and the detail path after `PATH_IMAGEM`
  writes (inside the `updateSellerImagePath` helper).
- There are **no** create/update/delete/status actions — those flows are disabled
  ("Pendente de API"). See `../AGENTS.md`, "Pending API Features".

Do not trust client-side gating. Direct Server Action calls bypass Client
Components, so the re-validation, ownership checks, and limit enforcement must
stay server-side.

## Cross-Folder Imports

This segment intentionally depends on the parent seller feature:

- URL helpers + composition: `[id]/page.tsx` imports `{ SellerDetails,
  getSafeSellerReturnTo }` from `../_components`.
- Service: both pages and all actions import from `@/services/api-main/seller`.

Do not fork these into `[id]/`; keep them pointing at the parent.

## Pending API Features

- **Create / Update / Activate-Inactivate / Delete** are all disabled
  ("Pendente de API"). The detail "Operações" and "Exclusão" zones render
  disabled controls. Only the gallery is mutable today.
- **Manual `PATH_IMAGEM` assignment** (`seller-images-list`): there is no such
  button. Promotion is automatic via gallery mutations only.

Do not present these as functional and do not simulate them. When safe contracts
arrive, wire the action, enable the control, and remove the "Pendente de API"
badges together.

## Conventions for Changes

- Preserve `page.tsx` as a Server Component. Keep `SellerDetails` a Server
  Component and read-only; do not introduce form/edit state without re-enabling
  mutations end-to-end.
- When changing gallery behavior, keep the Assets API as the source of truth for
  the image set and `PATH_IMAGEM` as a denormalized pointer. Any mutation that
  changes the primary image must update `PATH_IMAGEM` through
  `updateSellerImagePath()` with the 300-char guard.
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
- Visual or interactive changes: validate `/dashboard/seller/[id]` in the
  development server (port set by the `PORT` env var) on desktop and mobile, including: valid and
  invalid IDs (`not-found.tsx`), the `returnTo` back link, the read-only detail
  cards, the disabled "Pendente de API" controls, gallery upload (drag-and-drop
  and picker), primary promotion, deletion (including last-image rejection), zoom
  navigation, and the `PATH_IMAGEM` viewer refresh.
- This project currently has no automated test command; do not invent one.
