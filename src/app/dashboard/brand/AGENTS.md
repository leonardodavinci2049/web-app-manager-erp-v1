# Brand Route Agent Guide

This file complements the repository and dashboard guides for
`src/app/dashboard/brand`. It governs the `/dashboard/brand` list route and the
`/dashboard/brand/[id]` detail route, including their data loading, URL state,
Server Actions, the related-products list, and the brand image gallery.

Read this before changing any file in this segment. For shared dashboard rules
(root redirect, layout, sidebar), follow `src/app/dashboard/AGENTS.md`. For
detail-specific architecture (page composition, the single-form editing model,
and the gallery subsystem internals), follow `[id]/AGENTS.md`.

## Route Purpose

The brand segment is the registry for product brands ("Marcas"). It supports:

- Brand free-text search and ordering (sort by ID or name) on the list page.
- Grid and list presentation, with a desktop table for list mode.
- Pagination through the `page` query parameter (zero-based).
- Creation of new brands and navigation to the detail page while preserving the
  current list URL via `returnTo`.
- Single-form editing of a brand's `name` and `notes` (`slug` and `imagePath`
  are read-only on this form).
- A read-only related-products list with sub-pagination via `productPage`.
- A brand image gallery backed by the Assets API, synchronized with the legacy
  `PATH_IMAGEM` column on `tbl_produto_marca`.
- Deletion with a referential-safety guard (blocked while related products
  exist or cannot be verified).

Do not move list behavior into `src/app/dashboard/page.tsx`; that page is
reserved for session-aware redirection.

## Folder Structure

```text
brand/
├── AGENTS.md
├── page.tsx                              # List: auth context + getBrandsPage read
├── loading.tsx                           # List segment skeleton (RegistryLoading)
├── error.tsx                             # List error boundary (Client)
├── _actions/
│   └── brand-actions.ts                  # createBrandAction (list-only mutation)
├── _components/
│   ├── index.ts                          # Public exports for both routes
│   ├── brand-dashboard.tsx               # Server: composes toolbar + grid/list subtrees
│   ├── brand-create/
│   │   ├── brand-create-sheet.tsx        # Client: new brand sheet + discard dialog
│   │   └── brand-create-form.tsx         # Client: new brand form (name only)
│   ├── brand-list/
│   │   ├── brand-collection.tsx          # Server: grid cards + desktop table + empty/error
│   │   ├── brand-card.tsx                # Server: grid/list card
│   │   ├── brand-table.tsx               # Server: desktop list table
│   │   ├── brand-image.tsx               # Client: avatar via shared RegistryEntityImage
│   │   └── brand-pagination.tsx          # Server: thin RegistryPagination wrapper
│   ├── brand-toolbar/
│   │   ├── brand-toolbar.tsx             # Client orchestrator: URL filters + view + create
│   │   ├── brand-search.tsx              # UNUSED — toolbar uses shared RegistrySearch
│   │   └── brand-view-mode-toggle.tsx    # UNUSED — toolbar uses shared RegistryViewModeToggle
│   ├── lib/
│   │   └── search-params.ts              # Pure URL <-> state helpers (single source of truth)
│   └── types/
│       └── brand-dashboard-types.ts      # SearchParams, ActionResult, BrandProductDto, unions
└── [id]/
    ├── AGENTS.md                         # Detail route guide
    ├── page.tsx                          # Detail: auth + brand + products reads + Suspense
    ├── loading.tsx                       # Detail skeleton (RegistryDetailLoading, variant="brand")
    ├── error.tsx                         # Detail error boundary (Client)
    ├── not-found.tsx                     # Invalid/inaccessible brand UI
    ├── _actions/
    │   ├── brand-detail-actions.ts       # updateBrandAction, deleteBrandAction
    │   └── brand-image-gallery-actions.ts# Gallery upload/primary/delete/PATH sync
    └── _components/
        ├── brand-detail-layout.tsx       # Server: detail composition via shared shells
        ├── brand-detail-form.tsx         # Client: single name+notes edit form
        ├── brand-delete-dialog.tsx       # Client: delete confirm (blocked by products)
        ├── brand-products-list.tsx       # Client: related products + sub-pagination
        ├── overview/                     # Heading + "Dados do cadastro" card
        ├── tabs/                         # Tab orchestrator + one component per tab
        └── image-gallery/                # Gallery subsystem (see [id]/AGENTS.md)
```

The detail segment owns dedicated `error.tsx` and `not-found.tsx` files. There
is no `_hooks/` or `_utils/` folder in either segment.

## List Page Responsibilities

Keep `page.tsx` as a Server Component. It should:

1. Opt into request-time execution with `await connection()` (Cache Components).
2. Await `searchParams`.
3. Parse URL state with `parseBrandSearchParams(searchParams)`.
4. Obtain authenticated API context through `await getAuthContext()`.
5. Map filters to API params **inline** (there is no `mapBrandFiltersToApi`
   helper): `columnId = sort === "name" ? 1 : 2` and
   `orderId = order === "asc" ? 1 : 2`.
6. Call `getBrandsPage()` and isolate failures with `.catch()`: on error, log
   with `createLogger("BrandDashboardPage")`, set `hasLoadError`, and return
   `{ brands: [], total: 0 }` so the toolbar and active filters still render.
7. Render the `SiteHeaderWithBreadcrumb` (title "Marcas") and `RegistryPageShell`
   with `BrandDashboard`, passing only UI DTOs.

Do not duplicate filter parsing, URL construction, or filter-to-API mapping in
`page.tsx` beyond the inline `columnId`/`orderId` ternaries.

## Detail Page Responsibilities

Keep `[id]/page.tsx` as a Server Component. It should:

1. Opt into request-time execution with `await connection()`.
2. Await `params` and `searchParams` together with `Promise.all`.
3. Validate `id` with the local `parsePositiveInt` helper: reject non-numeric
   (`/^\d+$/`), non-safe-integer, and non-positive values with `notFound()`.
   (There is no dedicated `not-found.tsx`; the parent default renders.)
4. Resolve `returnTo` with `getSafeBrandReturnTo()` (imported from
   `../_components`). The back link only accepts same-origin paths whose
   pathname is exactly `/dashboard/brand`.
5. Parse `productPage` with `parsePositiveInt` (default `0`) for related-products
   sub-pagination.
6. Obtain authenticated API context through `getAuthContext()`.
7. Fetch the brand with `getBrandById()` and isolate failures: map
   `BrandNotFoundError` to `notFound()` and rethrow other errors so the
   ancestor error boundary handles them.
8. Fetch related products in parallel with `getProductsManager()` (capped at
   `BRAND_PRODUCT_PAGE_SIZE`) and isolate failures: log with
   `createLogger("BrandDetailsPage")`, set `hasProductsError`, and fall back to
   `{ products: [], total: 0 }`.
9. Guard a null brand return with a final `if (!brand) notFound()`.
10. Build `productReturnTo` so product detail can round-trip back to the same
    brand/products page.
11. Render `BrandDetailLayout`, passing the brand DTO, the products DTO, and two
    `<Suspense>` nodes built on the **page**: `imageGallery`
    (`BrandImageGalleryServer`) and `imageContent` (`BrandImagesListServer`).

The gallery and image nodes are built on the page (not inside
`BrandDetailLayout`) so the Suspense boundaries remain server-owned and the
cached gallery read is shared by both nodes through React `cache()`.
`BrandDetailLayout` is a Server Component composing the shared shells from
`@/app/dashboard/_components/detail-page`; see `[id]/AGENTS.md`.

## Authentication and Data Isolation

- `getAuthContext()` is mandatory for both pages and every Server Action.
- Authentication does not replace organization and resource authorization.
  Mutating actions must re-resolve the authenticated context and re-confirm the
  brand exists (`getBrandById()`, or `getAuthorizedBrandContext()` for gallery
  actions) before mutating. `deleteBrandAction` additionally re-queries related
  products before deleting.
- Never pass `apiContext`, session objects, tokens, raw entities, or internal
  errors to Client Components. Return only the DTOs defined in
  `brand-dashboard-types.ts`, `image-gallery-types.ts`, and the brand service's
  `UIBrand`.
- Brand reads are organization-dependent. Do not add `"use cache"` unless the
  cache key safely isolates organization and private context.
- Read the closest service-level `AGENTS.md` before modifying any module under
  `src/services/api-main` or `src/services/api-assets`.

## URL State

`_components/lib/search-params.ts` is the single source of truth for parsing and
building the list URL. Use `parseBrandSearchParams()`, `buildBrandUrl()`,
`buildBrandReturnTo()`, `buildBrandDetailHref()`, `buildProductDetailsHref()`,
and `getSafeBrandReturnTo()` instead of rebuilding query strings.

There is **no** `mapBrandFiltersToApi` and **no** `countBrandFilters` helper in
this route (unlike customer). Filter-to-API mapping is inlined in `page.tsx`,
and active-filter counting is inlined in `BrandToolbar`.

| Parameter | Accepted value | Purpose |
| --- | --- | --- |
| `search` | text, up to 300 characters | Brand free-text search |
| `sort` | `id`, `name` (default `id`) | Ordering column |
| `order` | `asc`, `desc` (default `desc`) | Ordering direction |
| `page` | non-negative integer (default `0`) | Page index (zero-based) |
| `limit` | `25`, `50`, `100` (default `50` = `BRAND_PAGE_SIZE`) | Page size |
| `accum` | non-negative integer (default `0`, capped by `MAX_REGISTRY_EXTRA_BATCHES`) | Extra batches appended by "Carregar mais" on top of `page`; any filter/search/sort/limit change or page selection resets it |

Detail-only parameters:

| Parameter | Accepted value | Purpose |
| --- | --- | --- |
| `returnTo` | same-origin URL whose pathname is exactly `/dashboard/brand` | Back-to-list safety |
| `productPage` | non-negative integer (default `0`) | Related-products sub-pagination |

The grid/list view mode is **not** URL state. It is a browser preference kept in
`localStorage` under `dashboard:brand-view-mode` and managed by `BrandToolbar`
via the shared `useRegistryViewMode()` hook. Toggling it is instant and never
triggers a refetch.

## List UI

- `BrandDashboard` (Server) builds both `grid` and `list` subtrees and passes
  them to the Client `BrandToolbar`, which renders only the active variant based
  on the client-side `viewMode`.
- `BrandToolbar` is the only Client orchestrator for the list. It owns the
  shared `RegistrySearch` input, the `RegistryFilterSheet` (sort/order/limit
  selects), the `RegistryViewModeToggle`, the create button/sheet, the
  active-filter chips (`RegistryActiveFilters`), and the mobile bottom bar.
- All data filters are written to the URL via `router.replace(buildBrandUrl(...))`
  inside a `useTransition`. Never duplicate this logic in other components.
- `BrandCollection` renders the grid cards (`BrandCard`), the desktop
  (`BrandTable`), empty/error states, the range summary, and `BrandPagination`.
  It depends on `BrandImage` (Client) and `BrandPagination`.
- `BrandPagination` is a thin wrapper over the shared `RegistryPagination`.
- After a successful create, the toolbar navigates to the new brand detail page
  via `buildBrandDetailHref()` (preserving only the current `limit`) and calls
  `router.refresh()`.
- `brand-search.tsx` (`BrandSearch`) and `brand-view-mode-toggle.tsx`
  (`BrandViewModeToggle`) are **dead code** — exported but never imported. The
  toolbar uses the shared registry primitives. Do not re-wire them; delete them
  if consolidating.

## Detail UI

`BrandDetailLayout` is a **Server Component** that composes the shared detail
shells from `@/app/dashboard/_components/detail-page`: a sticky left aside with
the gallery, the record heading (`overview/brand-head-data-section.tsx`, image
only below `lg`), a right column with the "Dados do cadastro" card
(`overview/brand-detail-form-section.tsx` wrapping `BrandDetailForm`), followed
by `BrandDetailTabs`. The Client tab orchestrator delegates the `annotations`,
`image`, `products`, `miscellaneous`, and `deletion` content to dedicated
components under `_components/tabs` and drives `router.replace(returnTo)` after
deletion. `annotations` is the default first tab. The `miscellaneous` tab holds
the read-only inactive status and the registration dates cards.

Editing is a **single mega-form** (`BrandDetailForm`: name + notes together),
not sectioned. See `[id]/AGENTS.md` for the full editing model, the type/read-only
fields, and the deletion guard.

## Image Gallery

The gallery lives under `[id]/_components/image-gallery` and integrates two
systems: the Assets API (source of truth for the gallery) and the legacy
`PATH_IMAGEM` column on `tbl_produto_marca` (denormalized pointer read by the
list and detail UI).

- Entity type is `BRAND_GALLERY_ENTITY_TYPE` (`"BRAND"`); the entity ID is the
  brand ID stringified.
- The gallery is capped at `BRAND_GALLERY_LIMIT` (7) images and accepts only
  `BRAND_GALLERY_ACCEPTED_MIME_TYPES` up to `BRAND_GALLERY_MAX_FILE_SIZE`
  (2 MB).
- `getBrandGalleryInitialState()` is wrapped in React `cache()` so the gallery
  node and the images-list node share a single Assets API read per request.
- `PATH_IMAGEM` synchronization is mandatory on four flows (first upload,
  primary change, primary deletion, and manual update from the first card) and
  writes through
  `brandServiceApi.updateBrandInlineField` (table `tbl_produto_marca`, key
  `ID_MARCA`, field `PATH_IMAGEM`, max 300 chars). If the original URL is empty
  or exceeds 300 chars, the write is skipped and the action returns a `warning`
  (partial success; the asset operation is not rolled back).
- The last remaining image cannot be deleted; the action and the client button
  both enforce this.

See `[id]/AGENTS.md` for the component-by-component breakdown.

## Server Actions and Invariants

Mutating actions are split across two folders — keep the split. Only the create
action lives in the parent; update/delete and gallery actions live in `[id]/_actions`.

- `createBrandAction()` (`_actions/brand-actions.ts`): validates the create
  payload (name only), derives the new ID from the stored-procedure result
  (falling back to `recordId`), rejects non-positive IDs, and revalidates
  `/dashboard/brand`.
- `updateBrandAction()` (`[id]/_actions/brand-detail-actions.ts`): re-confirms
  the brand exists, updates name and notes (preserving the current `imagePath`;
  `slug` is not editable), and revalidates `/dashboard/brand` only — the detail
  view is refreshed by the client calling `router.refresh()` via `onSaved`.
- `deleteBrandAction()` (`[id]/_actions/brand-detail-actions.ts`): re-confirms
  the brand exists, re-queries related products and refuses when `total > 0`,
  then deletes and revalidates `/dashboard/brand`.
- `uploadBrandImageAction()`, `setPrimaryBrandImageAction()`,
  `deleteBrandImageAction()` (`[id]/_actions/brand-image-gallery-actions.ts`):
  gallery mutations described above.

There is **no** `revalidateBrand()` helper. Actions call `revalidatePath`
directly with the literal path strings. Do not trust client-side gating: direct
Server Action calls bypass Client Components, so preserve the re-validation,
ownership checks, and limit enforcement server-side. Use `safeOperationMessage()`
to surface only safe operation messages; never leak raw responses or context.

## Services

- `brand` (`src/services/api-main/brand`): list reads (`getBrandsPage` via
  `findManagerAllBrands`), detail read (`getBrandById`), and stored-procedure
  mutations (`createBrand`, `updateBrand`, `deleteBrand`). Also exposes
  `updateBrandInlineField`, the PATH_IMAGEM wrapper. Produces `UIBrand`.
- `product-manager` (`src/services/api-main/product-manager`): `getProductsManager`
  for the related-products list and the delete referential guard. Produces
  `UIProductManager`.
- `general-call` (`src/services/api-main/general-call`):
  `generalCallServiceApi.updateTableInlineField()` + `FIELD_TYPE`, invoked
  indirectly through `brandServiceApi.updateBrandInlineField`.
- `api-assets` (`src/services/api-assets`): gallery read, upload, primary
  promotion, and deletion via `assetsApiService`.

Read the local `AGENTS.md` inside each service module before changing it.

## Pending API Features

None in the disabled-flow sense. Brand has functional create, update, delete
(with a referential guard), and gallery mutations.

- The brand status (`inactive`) is **display-only** via the `Badge` in the
  record heading. There is no activate/inactivate control and no "Pendente de
  API" placeholder. If a safe status-mutation contract arrives, add the control,
  wire a new action, and surface it explicitly.
- `BrandImagesList` has no manual PATH_IMAGEM assignment button. Promotion is
  automatic via gallery actions only.

Do not present these flows as functional and do not simulate them.

## Conventions for Changes

- Preserve `page.tsx` and `[id]/page.tsx` as Server Components. Keep
  `"use client"` limited to interactive state, events, browser APIs, navigation
  hooks, and form submission. Isolate it in the smallest possible component.
- Use the DTOs from `brand-dashboard-types.ts` and `image-gallery-types.ts`; do
  not send raw API entities to Client Components.
- Keep user-facing text in Brazilian Portuguese and code, comments, and
  technical documentation in US English.
- When adding a new list filter, update together: the type union in
  `brand-dashboard-types.ts`, `parseBrandSearchParams()`, `buildBrandUrl()`, the
  inline `columnId`/`orderId` mapping in `page.tsx`, the filter control in the
  `RegistryFilterSheet`, the `removeFilter` logic, and the active-filter chips in
  `BrandToolbar`. (There is no `mapBrandFiltersToApi`/`countBrandFilters` today.)
- When adding a new sort option, align the `BrandSort` union, the `VALID_SORTS`
  set in `search-params.ts`, the select options in `BrandToolbar`, and the
  `columnId` ternary in `page.tsx`.
- When adding a new editable field, align together: the `BrandUpdateRequest`
  payload, the Zod `updateSchema`, the `UIBrand`/`BrandDetail` field, the single
  `BrandDetailForm` control, and the `transformBrand` mapping. Keep the
  single-form model; do not fork into per-section forms unless intentionally
  abandoning it.
- Keep `PATH_IMAGEM` synchronization in sync with gallery primary changes; a new
  gallery mutation that changes the primary image must update `PATH_IMAGEM`
  through `brandServiceApi.updateBrandInlineField` with the 300-char guard.
- Use `createLogger()` for relevant errors and return generic, safe messages to
  the client.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Route, Server Action, cache behavior, or integration changes: also run
  `pnpm build` when viable.
- Visual or interactive changes: validate `/dashboard/brand` and
  `/dashboard/brand/[id]` in the development server (port set by the `PORT` env var) on desktop and
  mobile, including search, sort/order, grid/list switching, pagination, empty
  and error states, create flow, the single edit form, delete (including the
  products guard), related-products sub-pagination, gallery upload/primary/delete
  (including last-image rejection), zoom navigation, the first-card PATH_IMAGEM
  update, and the `returnTo` back link with valid and invalid `id`.
- This project currently has no automated test command; do not invent one.
