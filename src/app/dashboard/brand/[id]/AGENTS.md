# Brand Detail Route Agent Guide

This file complements the repository, dashboard, and `brand/AGENTS.md` guides for
`src/app/dashboard/brand/[id]`. It governs the `/dashboard/brand/[id]` detail
route: its page composition, the single-form editing model, the related-products
list, and the brand image gallery subsystem.

The closest applicable guide specializes broader instructions; repository-level
rules still prevail in case of conflict. For list behavior, URL state, and the
create flow, follow `../AGENTS.md`.

## Detail Page Composition

`page.tsx` is a Server Component that composes the whole detail screen. It stays
free of client state and delegates all interactions to the colocated Client
Components. See `../AGENTS.md` ("Detail Page Responsibilities") for the full
numbered sequence; the key points:

1. `await connection()` then `await Promise.all([params, searchParams])`.
2. Validate `id` with the local `parsePositiveInt` helper and call `notFound()`
   on invalid input.
3. Resolve `returnTo` with `getSafeBrandReturnTo()` (same-origin, pathname
   exactly `/dashboard/brand`) and `productPage` with `parsePositiveInt`.
4. `getAuthContext()`, then fetch the brand (`getBrandById`) and related products
   (`getProductsManager`) in parallel with isolated failure handling.
5. Render `BrandDetails` with DTOs plus two server-owned `<Suspense>` nodes:
   `imageGallery` (`BrandImageGalleryServer`) and `imageTabContent`
   (`BrandImagesListServer`).

The gallery and image nodes are built on the **page** so the Suspense boundaries
stay server-owned and the cached gallery read is shared by both nodes through
React `cache()`.

## Folder Structure

```text
[id]/
├── page.tsx                                # Detail composition (Server)
├── loading.tsx                             # Detail skeleton (RegistryDetailLoading, variant="brand")
├── _actions/
│   ├── brand-detail-actions.ts             # updateBrandAction, deleteBrandAction
│   └── brand-image-gallery-actions.ts      # Gallery upload/primary/delete
└── _components/
    ├── brand-details.tsx                   # Top-level detail layout + tabs (Client)
    ├── brand-detail-form.tsx               # Single name+notes edit form (Client)
    ├── brand-delete-dialog.tsx             # Delete confirm, blocked by products (Client)
    ├── brand-products-list.tsx             # Related products + sub-pagination (Client)
    └── image-gallery/
        ├── index.ts
        ├── image-gallery-constants.ts      # Entity type, limits, MIME, defaults
        ├── image-gallery-types.ts          # Gallery state + mutation result DTO
        ├── image-gallery-skeleton.tsx      # Suspense fallback (Server)
        ├── brand-image-gallery-server.tsx  # Cached gallery read (Server)
        ├── brand-image-gallery-refresh.tsx # State holder + router.refresh (Client)
        ├── brand-image-gallery.tsx         # Upload + grid + zoom + actions (Client)
        ├── brand-images-list-server.tsx    # Feeds cached gallery into the list (Server)
        └── brand-images-list.tsx           # PATH_IMAGEM viewer + gallery list (Client)
```

There is no `error.tsx` and no `not-found.tsx` in this segment. `notFound()`
renders the nearest parent not-found UI and unhandled errors bubble to the parent
boundary.

## Detail Data Flow

```
[id]/page.tsx (Server)
  ├── validates id -> notFound() on invalid
  ├── getAuthContext()
  ├── getBrandById()       -> UIBrand
  ├── getProductsManager() -> UIProductManager[]   (isolated failure -> hasProductsError)
  └── <BrandDetails> (Client)
        ├── header (name, inactive Badge, id)
        ├── left aside  -> imageGallery node (<Suspense>)
        ├── right column -> BrandDetailForm (name+notes) -> updateBrandAction
        ├── "Cadastro" card (createdAt/updatedAt)
        └── <Tabs>
              ├── products -> BrandProductsList (read-only, sub-paginated)
              ├── image    -> imageTabContent node (<Suspense>, BrandImagesList)
              └── deletion -> BrandDeleteDialog -> deleteBrandAction
```

Pass only `UIBrand` and `BrandProductDto` values to the components; never forward
`apiContext`, raw entities, or errors.

## `BrandDetails` Is a Client Component

Unlike customer's `CustomerDetails` (Server), `BrandDetails` is a **Client
Component** because it owns form/edit state and drives `router.refresh()` after
edits and `router.replace(returnTo)` after deletion. The page stays Server and
hands it DTOs plus the two Suspense nodes. Do not "fix" this asymmetry by moving
it to `[id]/_components` or converting it to a Server Component without a
deliberate decision.

Composition:

- Header: back link (`returnTo`), title with a `Tag` icon, an active/inactive
  `Badge` derived from `brand.inactive`, and the numeric ID.
- Two-column grid: a left aside with the `imageGallery` node, and a right column
  with the "Dados do cadastro" card (`BrandDetailForm`) and a "Cadastro" card
  (`createdAt`/`updatedAt` formatted in `pt-BR`).
- A single `<Tabs>` with `products`, `image`, and `deletion` tabs.

## Single-Form Editing Model

Editing is a **single mega-form** (`BrandDetailForm`), the opposite of customer's
sectioned editing. There are no independent per-section forms, no
`toValues()`/`setField()`/`runAction()` helpers, no tabbed section editors, and
no shared `savingSection` machinery.

- `BrandDetailForm` submits `name` and `notes` together to
  `updateBrandAction({ brandId, name, notes })` and calls `router.refresh()` on
  success via `onSaved`.
- `slug` is rendered read-only; `imagePath` is preserved server-side (never
  editable here). `inactive` is not sent on update.
- There are **no** person-type/customer-type toggles, no related seller, and no
  identity/personal/business/address/internet/restriction sections.

When adding an editable field, extend this single form and the shared Zod
`updateSchema`; do not introduce a sectioned model unless you are intentionally
abandoning the single-form approach.

## Related Products

`BrandProductsList` is a read-only, sub-paginated Client list. Each product links
to `/dashboard/product/<id>?returnTo=<productReturnTo>` via
`buildProductDetailsHref()`, with a `ProductThumb` (initials fallback when the
image is missing or errors). It reuses the parent's `BrandPagination` with
`paramName="productPage"`. When `hasProductsError` is set, an error fallback
renders instead of the list.

## Deletion and the Referential Guard

Deletion is **enabled** (unlike customer, where it is disabled) but dual-gated:

- **Client**: `BrandDeleteDialog` is disabled when `blocked = productTotal > 0 ||
  hasProductsError` and shows an explanatory notice.
- **Server**: `deleteBrandAction` re-queries `getProductsManager({ brandId,
  recordsQuantity: 1 })` before deleting and refuses when `total > 0`. Direct or
  concurrent calls cannot bypass this.

On success, the dialog calls `onSuccess`, which runs `router.replace(returnTo)`.

## Image Gallery Subsystem

The gallery spans Server and Client components and integrates two systems: the
**Assets API** (source of truth for the image set) and the legacy
**`PATH_IMAGEM`** column on `tbl_produto_marca` (denormalized pointer read by the
list and detail UI).

### Components and responsibilities

- `brand-image-gallery-server.tsx`: exports `getBrandGalleryInitialState`,
  wrapped in React `cache()`. Reads the Assets API, classifies the result into
  `ready` / `empty` / `error`, sorts (primary first, then `displayOrder`, then
  `uploadedAt` desc), drops entries without an `original` URL, and fills missing
  URL variants. Shared by the gallery node and the images-list node so the Assets
  API is hit once per request.
- `brand-image-gallery-refresh.tsx`: Client state holder. Owns `images`,
  `totalImages`, `loadError`, and a `selectionRequest` (`{ imageId, version }`).
  Bumps the version on every external change so the inner gallery re-syncs the
  selected image, and triggers `router.refresh()` after mutations.
- `brand-image-gallery.tsx`: the interactive gallery. Drag-and-drop + file picker
  upload, thumbnail grid, primary promotion, deletion (with confirmation),
  keyboard-navigable zoom dialog, per-image error fallback to
  `DEFAULT_BRAND_IMAGE_URL`, and an `aria-live` status region for screen readers.
- `brand-images-list.tsx`: read-only viewer. Shows the current `PATH_IMAGEM`
  value and the Assets API image list side by side, with a manual refresh button.
  There is **no** "Usar no PATH_IMAGEM" button; promotion is automatic through
  the gallery actions.
- `image-gallery-skeleton.tsx`: Suspense fallback shared by both nodes.
- `image-gallery-constants.ts`: `BRAND_GALLERY_ENTITY_TYPE` (`"BRAND"`),
  `BRAND_GALLERY_LIMIT` (7), `BRAND_GALLERY_MAX_FILE_SIZE` (2 MB), accepted MIME
  types, `BRAND_GALLERY_ACCEPT`, and `DEFAULT_BRAND_IMAGE_URL`.
- `image-gallery-types.ts`: `BrandGalleryImage`, the discriminated
  `BrandGalleryInitialState`, and `BrandGalleryMutationResult`.

### Limits, validation, and mutations

- Upload validates MIME type and size on both client and server. Files beyond
  `availableSlots` (`LIMIT - totalImages`) are rejected up front with a per-file
  reason; valid files are uploaded sequentially.
- The last remaining image cannot be deleted; the delete action and the client
  button both enforce this.
- All three mutations (`uploadBrandImageAction`, `setPrimaryBrandImageAction`,
  `deleteBrandImageAction`) live in `_actions/brand-image-gallery-actions.ts`,
  re-resolve auth and ownership via `getAuthorizedBrandContext()`, and re-read the
  gallery before mutating.

### PATH_IMAGEM synchronization

`PATH_IMAGEM` is kept in sync with the Assets API primary image on three flows,
writing through `brandServiceApi.updateBrandInlineField` (table `tbl_produto_marca`,
key `ID_MARCA`, field `PATH_IMAGEM`, max 300 chars, `FIELD_TYPE.STRING`):

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
(`DEFAULT_BRAND_IMAGE_URL`) when adding new image surfaces.

## Server Actions

- Detail actions live in `_actions/brand-detail-actions.ts` (this folder).
  `updateBrandAction` and `deleteBrandAction` validate with Zod, re-resolve auth
  and ownership via `getBrandById()`, and revalidate `/dashboard/brand`.
  `updateBrandAction` does **not** revalidate the detail path — the client form
  calls `router.refresh()` via `onSaved` instead. If you add server-side caching
  to the detail route, add the detail `revalidatePath` to `updateBrandAction`.
- Gallery actions live in `_actions/brand-image-gallery-actions.ts` (this
  folder). They validate with Zod (`BrandIdSchema`, `AssetIdSchema`,
  `UploadSchema`), re-read the gallery to validate limits/ownership, call
  `revalidatePath` for `/dashboard/brand` and the detail path after `PATH_IMAGEM`
  writes.

Do not trust client-side gating. Direct Server Action calls bypass Client
Components, so the re-validation, ownership checks, and limit enforcement must
stay server-side. Use `safeOperationMessage()` to surface only safe operation
messages from stored-procedure errors; never leak raw responses or context.

## Cross-Folder Imports

This segment intentionally depends on the parent brand feature:

- Exports: `BRAND_PRODUCT_PAGE_SIZE` and `getSafeBrandReturnTo` from
  `../_components`.
- Types: `BrandActionResult` and `BrandProductDto` from
  `../_components/types/brand-dashboard-types`.
- URL helpers: `buildProductDetailsHref` from `../_components/lib/search-params`.
- Pagination: `BrandPagination` from `../_components/brand-list/brand-pagination`.

Unlike customer (whose section-update actions are shared in the parent
`_actions`), brand keeps its detail mutations **local** to this segment:
`updateBrandAction` and `deleteBrandAction` live in `_actions/brand-detail-actions.ts`,
and gallery actions in `_actions/brand-image-gallery-actions.ts`. Only
`createBrandAction` lives in the parent `_actions/brand-actions.ts`. Keep this
split; do not move detail actions into the parent or vice versa.

## Conventions for Changes

- Preserve `page.tsx` as a Server Component. Keep `"use client"` limited to the
  interactive components (`BrandDetails`, `BrandDetailForm`, `BrandDeleteDialog`,
  `BrandProductsList`, `BrandImage`, the gallery clients).
- Keep the single-form editing model; do not introduce a shared sectioned context
  or a single save-all action without an explicit decision.
- When adding a new editable field, align together: the `BrandUpdateRequest`
  payload, the Zod `updateSchema`, the `UIBrand`/`BrandDetail` field, the
  `BrandDetailForm` control, and the `transformBrand` mapping.
- When changing gallery behavior, keep the Assets API as the source of truth for
  the image set and `PATH_IMAGEM` as a denormalized pointer. Any mutation that
  changes the primary image must update `PATH_IMAGEM` through
  `brandServiceApi.updateBrandInlineField` with the 300-char guard.
- Preserve accessibility: `aria-pressed` on toggles, `aria-live` status in the
  gallery, keyboard navigation in the zoom dialog, and descriptive labels on
  icon-only buttons.
- Use `createLogger()` for relevant errors and return generic, safe Brazilian
  Portuguese messages to the client.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Route, Server Action, cache behavior, or integration changes: also run
  `pnpm build` when viable.
- Visual or interactive changes: validate `/dashboard/brand/[id]` in the
  development server (port set by the `PORT` env var) on desktop and mobile, including: valid and
  invalid IDs (parent `not-found` UI), the `returnTo` back link, the single edit
  form (success, validation errors, network failure), delete (including the
  products guard and the redirect to `returnTo`), related-products sub-pagination
  and round-trip `productReturnTo`, gallery upload (drag-and-drop and picker),
  primary promotion, deletion (including last-image rejection), zoom navigation,
  and the `PATH_IMAGEM` viewer refresh.
- This project currently has no automated test command; do not invent one.
