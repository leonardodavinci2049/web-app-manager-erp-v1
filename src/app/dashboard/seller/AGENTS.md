# Seller Route Agent Guide

This file complements the repository and dashboard guides for
`src/app/dashboard/seller`. It governs the `/dashboard/seller` list route and the
`/dashboard/seller/[id]` detail route.

Read this before changing any file in this segment. For shared dashboard rules
(root redirect, layout, sidebar), follow `src/app/dashboard/AGENTS.md`. For
detail-specific architecture (the read-only detail composition and the gallery
subsystem), follow `[id]/AGENTS.md`.

## Route Purpose

The seller segment is the registry for sellers ("Vendedores"). It is
**read-only**: there is no create, update, delete, or activate/inactivate. Those
flows render disabled with a "Pendente de API" badge. It supports:

- Seller search, combined filters (category, no-image, status), and ordering on
  the list page.
- Grid and list presentation, with a desktop table for list mode.
- Pagination through the `page` query parameter (zero-based).
- Navigation to the detail page while preserving the current list URL via
  `returnTo`.
- A read-only detail view (identity, business/personal data, contacts, status).
- A seller image gallery backed by the Assets API, synchronized with the legacy
  `PATH_IMAGEM` column on `tbl_pessoa`.

The **image gallery mutations ARE enabled** (upload/primary/delete) even though
all entity CRUD is disabled. The list empty-state copy states "A criação de
vendedores está pendente de suporte pela API."

Do not move list behavior into `src/app/dashboard/page.tsx`; that page is
reserved for session-aware redirection.

## Folder Structure

```text
seller/
├── AGENTS.md
├── page.tsx                              # List: auth context + getSellersPage read
├── loading.tsx                           # List segment skeleton
├── error.tsx                             # List error boundary (Client)
├── _components/
│   ├── index.ts                          # Public exports (incl. SellerDetails + URL helpers)
│   ├── seller-dashboard.tsx              # Server: composes grid/list subtrees -> toolbar
│   ├── seller-toolbar.tsx                # Client: URL filters + view mode (NO create button)
│   ├── seller-collection.tsx             # Server: grid cards + desktop table + empty/error
│   ├── seller-pagination.tsx             # Server: thin RegistryPagination wrapper
│   ├── seller-image.tsx                  # Client: avatar via shared RegistryEntityImage
│   ├── seller-details.tsx                # Server: read-only detail composition (no form)
│   ├── lib/
│   │   └── search-params.ts              # Pure URL <-> filters mapping (single source of truth)
│   └── types/
│       └── seller-dashboard-types.ts     # SearchParams, unions
└── [id]/
    ├── AGENTS.md                         # Detail route guide
    ├── page.tsx                          # Detail: auth + getSellerById + Suspense nodes
    ├── loading.tsx                       # Detail segment skeleton
    ├── error.tsx                         # Detail error boundary (Client)
    ├── not-found.tsx                     # Invalid/inaccessible seller UI
    ├── _actions/
    │   └── seller-image-gallery-actions.ts   # Gallery upload/primary/delete (ONLY actions)
    └── _components/
        └── image-gallery/                # Gallery subsystem (see [id]/AGENTS.md)
```

There is **no parent `_actions/` folder** and **no create sheet** — seller cannot
be created or mutated from the UI (only its gallery can). This differs from
brand/carriers/suppliers/ptype, which all have a parent `_actions/` for CRUD.

## List Page Responsibilities

Keep `page.tsx` as a Server Component. It should:

1. Opt into request-time execution with `await connection()` (Cache Components).
2. Await `searchParams`.
3. Parse URL state with `parseSellerSearchParams()`.
4. Convert filters to API params with `mapSellerFiltersToApi()`.
5. Obtain authenticated API context through `getAuthContext()`.
6. Call `getSellersPage()` and isolate failures via `.catch()`: on error, log
   with `createLogger("SellerDashboardPage")`, set `hasLoadError`, and return
   `{ items: [], total: 0 }` so the toolbar and active filters still render.
7. Render the `SiteHeaderWithBreadcrumb` (title "Vendedores") and
   `RegistryPageShell` with `SellerDashboard`, passing only UI DTOs.

Do not duplicate filter parsing or URL construction in `page.tsx`.

## Detail Page Responsibilities

Keep `[id]/page.tsx` as a Server Component. It should:

1. Opt into request-time execution with `await connection()`.
2. Await `params` and `searchParams` together with `Promise.all`.
3. Validate `id`: reject non-numeric (`/^\d+$/`), non-safe-integer, and
   non-positive values with `notFound()`.
4. Resolve `returnTo` with `getSafeSellerReturnTo()` (imported from
   `../_components`). The back link only accepts same-origin paths whose pathname
   is exactly `/dashboard/seller`.
5. Obtain authenticated API context through `getAuthContext()`.
6. Fetch the seller with `getSellerById()`; map `SellerNotFoundError` to
   `notFound()` and rethrow other errors so the segment `error.tsx` boundary
   handles them. Guard a null return with `if (!seller) notFound()`.
7. Render `SiteHeaderWithBreadcrumb` (breadcrumb "Vendedores" links to
   `returnTo`; last crumb is `seller.name`) and a custom `max-w-[1400px]`
   container (this route does **not** use `RegistryPageShell`).
8. Compose `SellerDetails` with the seller DTO, `returnTo`, and two
   `<Suspense>` nodes built on the **page**: `imageGallery`
   (`SellerImageGalleryServer`) and `imageContent` (`SellerImagesListServer`).

There is no secondary fetch.

## Authentication and Data Isolation

- `getAuthContext()` is mandatory for both pages and every Server Action.
- Authentication does not replace organization and resource authorization.
  Gallery actions must re-resolve the authenticated context and re-confirm the
  seller exists (`getAuthorizedSellerContext()`) before mutating.
- Never pass `apiContext`, session objects, tokens, raw entities, or internal
  errors to Client Components. Return only the DTOs defined in
  `seller-dashboard-types.ts`, `image-gallery-types.ts`, and the seller
  service's `UISellerListItem` / `UISellerDetail`.
- Seller reads are organization-dependent. Do not add `"use cache"` unless the
  cache key safely isolates organization and private context.
- Read the closest service-level `AGENTS.md` before modifying any module under
  `src/services/api-main` or `src/services/api-assets`.

## URL State

`_components/lib/search-params.ts` is the single source of truth for parsing and
building the list URL. Use `parseSellerSearchParams()`, `mapSellerFiltersToApi()`,
`buildSellerUrl()`, `buildSellerDetailHref()`, and `getSafeSellerReturnTo()`
instead of rebuilding query strings.

There is **no** `countSellerFilters` helper. Active-filter counting is inlined in
`SellerToolbar`.

| Parameter | Accepted value | Purpose |
| --- | --- | --- |
| `search` | text, up to 300 characters | Free-text search |
| `category` | `0` (Todas), `1` (Atacado), `2` (Varejo), `3` (Não informado) | Seller category filter |
| `no-image` | `1` (presence) | Only sellers without image |
| `status` | `all`, `active`, `inactive` | Status filter |
| `sort` | `id`, `name`, `last-purchase` | Ordering column |
| `order` | `asc`, `desc` | Ordering direction |
| `page` | non-negative integer (default `0`) | Page index (zero-based) |
| `limit` | `25`, `50` (default `DEFAULT_SELLER_LIMIT`), `100` | Page size |

The grid/list view mode is **not** URL state. It is a browser preference kept in
`localStorage` under `dashboard:seller-view-mode` and managed by `SellerToolbar`
via the shared `useRegistryViewMode()` hook. Toggling it is instant and never
triggers a refetch.

## List UI

- `SellerDashboard` (Server) builds both `grid` and `list` subtrees and passes
  them to the Client `SellerToolbar`, which renders only the active variant based
  on the client-side `viewMode`.
- `SellerToolbar` is the only Client orchestrator. It owns the shared
  `RegistrySearch` input, the `RegistryFilterSheet`, the `RegistryViewModeToggle`,
  the active-filter chips (`RegistryActiveFilters`), and the mobile bottom bar.
  There is **no create button** (seller creation is pending API).
- All data filters are written to the URL via `router.replace(buildSellerUrl(...))`
  inside a `useTransition`. `removeFilter`/`clearFilters` always reset `page` to
  `0`. Never duplicate this logic in other components.
- `SellerCollection` renders the grid cards, the desktop table, empty/error
  states, and `SellerPagination`. The empty state notes that seller creation is
  pending API.
- `SellerPagination` is a thin wrapper over the shared `RegistryPagination`.

## Detail UI

`SellerDetails` is a **Server Component** (unique among the registry routes,
whose detail components are Client) because the detail is entirely read-only —
there is no form/edit state and no `router.refresh()`/`router.replace()`. It
renders read-only cards: "Identificação", "Dados empresariais" (when business) /
"Dados pessoais" (otherwise, conditional on `cnpj || legalName || tradeName`),
"Contatos e documentos", an "Operações" card with disabled "Editar / Ativar /
Inativar — Pendente de API" buttons, and a "Cadastro" card. A `<Tabs>` has two
tabs: `image` (Imagem) and `deletion` (Exclusão, default) — the deletion tab is a
disabled "Excluir — Pendente de API" button. See `[id]/AGENTS.md`.

## Image Gallery

The gallery lives under `[id]/_components/image-gallery` and integrates two
systems: the Assets API (source of truth for the gallery) and the legacy
`PATH_IMAGEM` column on `tbl_pessoa` (denormalized pointer read by the list and
detail UI).

- Entity type is `SELLER_GALLERY_ENTITY_TYPE` (`"SELLER"`); the entity ID is the
  seller ID stringified.
- The gallery is capped at `SELLER_GALLERY_LIMIT` (7) images and accepts only
  `SELLER_GALLERY_ACCEPTED_MIME_TYPES` up to `SELLER_GALLERY_MAX_FILE_SIZE`
  (10 MB).
- `getSellerGalleryInitialState()` is wrapped in React `cache()` so the gallery
  node and the images-list node share a single Assets API read per request.
- `PATH_IMAGEM` synchronization is mandatory on three flows (first upload,
  primary change, primary deletion) and writes through
  `generalCallServiceApi.updateTableInlineField` (table `tbl_pessoa`, key
  `ID_TBL_PESSOA`, field `PATH_IMAGEM`, max 300 chars) via the local
  `updateSellerImagePath()` helper. If the original URL is empty or exceeds 300
  chars, the write is skipped and the action returns a `warning` (partial
  success; the asset operation is not rolled back).
- The last remaining image cannot be deleted; the action and the client button
  both enforce this.

Sellers are people records in the shared `tbl_pessoa` table (the list item type
carries `ID_CUSTOMER` because sellers are customers flagged as sellers). See
`[id]/AGENTS.md` for the component-by-component breakdown.

## Server Actions and Invariants

There are **no create/update/delete/status actions** — those flows are disabled
("Pendente de API"). The only Server Actions are the gallery mutations in
`[id]/_actions/seller-image-gallery-actions.ts`:

- `uploadSellerImageAction(formData)`, `setPrimarySellerImageAction(rawSellerId,
  rawAssetId)`, `deleteSellerImageAction(rawSellerId, rawAssetId)`.

They validate with Zod (`SellerIdSchema`, `AssetIdSchema`, `UploadSchema`),
re-resolve auth and ownership via `getAuthorizedSellerContext()`, re-read the
gallery before mutating, and call `revalidatePath` directly inside
`updateSellerImagePath()` (there is **no** `revalidateSeller()` helper — there
are no other actions to use one). Do not trust client-side gating; preserve the
server-side re-validation, ownership checks, and limit enforcement.

## Services

- `seller` (`src/services/api-main/seller`): a **read-only** single module. It
  provides `getSellersPage()` (list, via `findManagerAllSellers`) and
  `getSellerById()` (detail, via `findSellerById`), plus `searchAllSellers`, the
  `SellerServiceApi` class / `sellerServiceApi` instance, and errors
  `SellerError`, `SellerNotFoundError`, `SellerValidationError`. There are
  **no** `createSeller`/`updateSeller`/`deleteSeller` methods. Produces
  `UISellerListItem` (list) and `UISellerDetail` (detail).
- `general-call` (`src/services/api-main/general-call`):
  `generalCallServiceApi.updateTableInlineField()` + `FIELD_TYPE`, used by gallery
  actions for `PATH_IMAGEM`.
- `api-assets` (`src/services/api-assets`): gallery read/upload/primary/delete
  via `assetsApiService`, plus `isApiError` / `isNotFoundApiError`.

Read the local `AGENTS.md` inside each service module before changing it.

## Pending API Features

**Create, update, activate/inactivate, and delete are all disabled
("Pendente de API").** The list empty-state and the detail "Operações" and
"Exclusão" cards all surface this. Only gallery mutations are functional. Do not
present these disabled flows as functional and do not simulate them. When safe
contracts arrive, wire the actions (with a `getExistingSeller()` re-check), add
`revalidateSeller()` or direct `revalidatePath` calls, enable the UI controls,
and remove the "Pendente de API" badges together.

## Conventions for Changes

- Preserve `page.tsx` and `[id]/page.tsx` as Server Components. `SellerDetails`
  is intentionally **Server and read-only**; do not add form/edit state or
  convert it to Client without re-enabling mutations end-to-end.
- Use the DTOs from `seller-dashboard-types.ts` and `image-gallery-types.ts`; do
  not send raw API entities to Client Components.
- Keep user-facing text in Brazilian Portuguese and code, comments, and technical
  documentation in US English. Use `createLogger()` for errors and return generic
  safe messages.
- When adding a list filter, update together: the type union in
  `seller-dashboard-types.ts`, the `VALID_*` set + parsing in `search-params.ts`,
  the `mapSellerFiltersToApi()` mapping, the `buildSellerUrl()` omission logic,
  the filter control in the `RegistryFilterSheet`, the `removeFilter` logic, and
  the active-filter chips `useMemo` in `SellerToolbar`. (There is no
  `countSellerFilters`.)
- Keep `PATH_IMAGEM` synchronization in sync with gallery primary changes; a new
  gallery mutation that changes the primary image must call `updateSellerImagePath()`
  with the 300-char guard + `warning` partial-success behavior.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Route, Server Action, cache behavior, or integration changes: also run
  `pnpm build` when viable.
- Visual or interactive changes: validate `/dashboard/seller` and
  `/dashboard/seller/[id]` in the development server (port set by the `PORT` env var) on desktop and
  mobile, including search, combined filters, active-filter removal, grid/list
  switching, pagination, empty and error states, the read-only detail cards, the
  disabled "Pendente de API" controls, gallery upload/primary/delete (including
  last-image rejection), zoom navigation, the PATH_IMAGEM viewer refresh, and the
  `returnTo` back link with valid and invalid `id`.
- This project currently has no automated test command; do not invent one.
