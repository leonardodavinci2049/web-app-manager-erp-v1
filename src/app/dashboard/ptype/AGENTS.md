# Ptype Route Agent Guide

This file complements the repository and dashboard guides for
`src/app/dashboard/ptype`. It governs the `/dashboard/ptype` list route and the
`/dashboard/ptype/[id]` detail route, including their data loading, URL state,
Server Actions, and the product-type image gallery.

Read this before changing any file in this segment. For shared dashboard rules
(root redirect, layout, sidebar), follow `src/app/dashboard/AGENTS.md`. For
detail-specific architecture (the single edit form, the status/deletion flows,
and the gallery subsystem internals), follow `[id]/AGENTS.md`.

## Route Purpose

The ptype segment is the registry for product types ("Tipos de produtos"). It
supports full CRUD plus status change:

- Product-type search, a `status` filter, and ordering on the list page.
- Grid and list presentation, with a desktop table for list mode.
- Pagination through the `page` query parameter (zero-based).
- Creation of new product types (name only) and navigation to the detail page
  while preserving the current list URL via `returnTo`.
- A single unified edit form (name + notes) backed by one `updatePtypeAction`.
- Activate/inactivate via `setPtypeStatusAction` (enabled).
- Deletion via `deletePtypeAction` (enabled; the API validates relations).
- A product-type image gallery backed by the Assets API, synchronized with the
  legacy `PATH_IMAGEM` column on `tbl_produto_tipo`.

There is no related-products block, no sectioned forms, no type toggles, and no
restriction flag.

Do not move list behavior into `src/app/dashboard/page.tsx`; that page is
reserved for session-aware redirection.

## Folder Structure

```text
ptype/
├── AGENTS.md
├── page.tsx                              # List: auth context + getPtypesPage read
├── loading.tsx                           # List segment skeleton
├── error.tsx                             # List error boundary (Client)
├── _actions/
│   └── ptype-actions.ts                  # createPtypeAction (list-only mutation)
├── _components/
│   ├── index.ts                          # Public exports (URL helpers + types; NOT PtypeDetails)
│   ├── ptype-dashboard.tsx               # Server: composes grid/list subtrees -> toolbar
│   ├── ptype-toolbar.tsx                 # Client: URL filters + view mode + create
│   ├── ptype-collection.tsx             # Server: grid cards + desktop table + empty/error
│   ├── ptype-pagination.tsx             # Server: thin RegistryPagination wrapper
│   ├── ptype-image.tsx                  # Client: avatar via shared RegistryEntityImage
│   ├── ptype-create-sheet.tsx           # Client: new ptype sheet + discard dialog (name only)
│   ├── lib/
│   │   └── search-params.ts             # Pure URL <-> filters mapping (single source of truth)
│   └── types/
│       └── ptype-dashboard-types.ts     # SearchParams, ActionResult, unions
└── [id]/
    ├── AGENTS.md                         # Detail route guide
    ├── page.tsx                          # Detail: auth + getPtypeById + Suspense nodes
    ├── loading.tsx                       # Detail skeleton (NO error.tsx / not-found.tsx here)
    ├── _actions/
    │   ├── ptype-detail-actions.ts       # updatePtypeAction, setPtypeStatusAction, deletePtypeAction
    │   └── ptype-image-gallery-actions.ts# Gallery upload/primary/delete
    └── _components/
        ├── ptype-details.tsx             # Detail composition (Client, single mega-form) — LOCAL
        └── image-gallery/                # Gallery subsystem (see [id]/AGENTS.md)
```

This follows the **brand** layout, not the carriers layout: only the create
action lives in the parent `_actions/`; update/status/delete live **locally** in
`[id]/_actions/ptype-detail-actions.ts`; `PtypeDetails` lives **locally** in
`[id]/_components`. The detail segment has **no** `error.tsx` and **no**
`not-found.tsx` (only `loading.tsx`) — `notFound()` renders the nearest parent
not-found UI and unhandled errors bubble to the parent boundary.

## List Page Responsibilities

Keep `page.tsx` as a Server Component. It should:

1. Opt into request-time execution with `await connection()` (Cache Components).
2. Await `searchParams`.
3. Parse URL state with `parsePtypeSearchParams()`.
4. Convert filters to API params with `mapPtypeFiltersToApi()`.
5. Obtain authenticated API context through `getAuthContext()`.
6. Call `getPtypesPage()` and isolate failures via `.catch()`: on error, log
   with `createLogger("PtypeDashboardPage")`, set `hasLoadError`, and return
   `{ items: [], total: 0 }` so the toolbar and active filters still render.
7. Render the `SiteHeaderWithBreadcrumb` (title "Tipos de produtos") and
   `RegistryPageShell` with `PtypeDashboard`, passing only UI DTOs.

Do not duplicate filter parsing or URL construction in `page.tsx`.

## Detail Page Responsibilities

Keep `[id]/page.tsx` as a Server Component. It should:

1. Opt into request-time execution with `await connection()`.
2. Await `params` and `searchParams` together with `Promise.all`.
3. Validate `id`: reject non-numeric (`/^\d+$/`), non-safe-integer, and
   non-positive values with `notFound()`.
4. Resolve `returnTo` with `getSafePtypeReturnTo()` (imported from
   `../_components`). The back link only accepts same-origin paths whose pathname
   is exactly `/dashboard/ptype`.
5. Obtain authenticated API context through `getAuthContext()`.
6. Fetch the product type with `getPtypeById()`; map `PtypeNotFoundError` to
   `notFound()` and rethrow other errors so the ancestor error boundary handles
   them. Guard a null return with `if (!item) notFound()`.
7. Render `SiteHeaderWithBreadcrumb` (breadcrumb "Tipos de produtos" links to
   `returnTo`; last crumb is `item.name`) and a custom `max-w-[1400px]`
   container (this route does **not** use `RegistryPageShell`).
8. Compose `PtypeDetails` (imported from `./_components/ptype-details`) with the
   DTO, `returnTo`, and two `<Suspense>` nodes built on the **page**:
   `imageGallery` (`PtypeImageGalleryServer`) and `imageContent`
   (`PtypeImagesListServer`).

## Authentication and Data Isolation

- `getAuthContext()` is mandatory for both pages and every Server Action.
- Authentication does not replace organization and resource authorization.
  Mutating actions must re-resolve the authenticated context and re-confirm the
  product type exists (`getExistingPtype()`, or `getAuthorizedPtypeContext()` for
  gallery actions) before mutating.
- Never pass `apiContext`, session objects, tokens, raw entities, or internal
  errors to Client Components. Return only the DTOs defined in
  `ptype-dashboard-types.ts`, `image-gallery-types.ts`, and the ptype service's
  `UIPtype`.
- Reads are organization-dependent. Do not add `"use cache"` unless the cache key
  safely isolates organization and private context.
- Read the closest service-level `AGENTS.md` before modifying any module under
  `src/services/api-main` or `src/services/api-assets`.

## URL State

`_components/lib/search-params.ts` is the single source of truth for parsing and
building the list URL. Use `parsePtypeSearchParams()`, `mapPtypeFiltersToApi()`,
`buildPtypeUrl()`, `buildPtypeDetailHref()`, and `getSafePtypeReturnTo()` instead
of rebuilding query strings.

There is **no** `countPtypeFilters` helper. Active-filter counting is inlined in
`PtypeToolbar`.

| Parameter | Accepted value | Purpose |
| --- | --- | --- |
| `search` | text, up to **100** characters | Free-text search ("Buscar por nome ou ID...") |
| `status` | `all`, `active`, `inactive` | Status filter |
| `sort` | `id`, `name` (**no `last-purchase`**) | Ordering column |
| `order` | `asc`, `desc` | Ordering direction |
| `page` | non-negative integer (default `0`) | Page index (zero-based) |
| `limit` | `25`, `50` (default `DEFAULT_PTYPE_LIMIT`), `100` | Page size |

Note: ptype's `search` is capped at **100 chars** (shorter than seller/suppliers'
300), and `sort` has **no `last-purchase`** option.

The grid/list view mode is **not** URL state. It is a browser preference kept in
`localStorage` under `dashboard:ptype-view-mode` and managed by `PtypeToolbar`
via the shared `useRegistryViewMode()` hook. Toggling it is instant and never
triggers a refetch.

## List UI

- `PtypeDashboard` (Server) builds both `grid` and `list` subtrees and passes
  them to the Client `PtypeToolbar`, which renders only the active variant based
  on the client-side `viewMode`.
- `PtypeToolbar` is the only Client orchestrator. It owns the shared
  `RegistrySearch` input (maxLength 100), the `RegistryFilterSheet`, the
  `RegistryViewModeToggle`, the create button/sheet, the active-filter chips
  (`RegistryActiveFilters`), and the mobile bottom bar.
- All data filters are written to the URL via `router.replace(buildPtypeUrl(...))`
  inside a `useTransition`. `removeFilter`/`clearFilters` always reset `page` to
  `0`. Never duplicate this logic in other components.
- `PtypeCollection` renders the grid cards, the desktop table, empty/error
  states, and `PtypePagination`.
- `PtypePagination` is a thin wrapper over the shared `RegistryPagination`.
- After a successful create, the toolbar navigates to the new detail page via
  `buildPtypeDetailHref()` (preserving only the current `limit`) and calls
  `router.refresh()`.

## Detail UI

`PtypeDetails` is a **Client Component** living **locally** in
`[id]/_components/ptype-details.tsx` (brand-style placement, not re-exported from
the parent `_components/index.ts`). It owns form state and drives
`router.refresh()` after update/status and `router.replace(returnTo)` after
delete. Editing is a **single mega-form** (name + notes). The layout includes a
read-only "Detalhes do tipo" card (status, `productRegistrationFlag`,
`createdAt`, commission rates), a "Cadastro" card, a **"Status do cadastro" card
with active status buttons**, and a `<Tabs>` with `image` and `deletion` (default)
tabs. Activate/deactivate/delete share a single `AlertDialog` via a
`Confirmation` union. See `[id]/AGENTS.md`.

## Image Gallery

The gallery lives under `[id]/_components/image-gallery` and integrates two
systems: the Assets API (source of truth for the gallery) and the legacy
`PATH_IMAGEM` column on `tbl_produto_tipo` (denormalized pointer read by the list
and detail UI).

- Entity type is `PTYPE_GALLERY_ENTITY_TYPE` (`"PTYPE"`); the entity ID is the
  product-type ID stringified.
- The gallery is capped at `PTYPE_GALLERY_LIMIT` (7) images and accepts only
  `PTYPE_GALLERY_ACCEPTED_MIME_TYPES` up to `PTYPE_GALLERY_MAX_FILE_SIZE`
  (10 MB).
- `getPtypeGalleryInitialState()` is wrapped in React `cache()` so the gallery
  node and the images-list node share a single Assets API read per request.
- `PATH_IMAGEM` synchronization is mandatory on three flows (first upload,
  primary change, primary deletion) and writes through
  `generalCallServiceApi.updateTableInlineField` (table `tbl_produto_tipo`, key
  `ID_TIPO`, field `PATH_IMAGEM`, max 300 chars) via the local
  `updatePtypeImagePath()` helper. If the original URL is empty or exceeds 300
  chars, the write is skipped and the action returns a `warning` (partial
  success; the asset operation is not rolled back).
- The last remaining image cannot be deleted; the action and the client button
  both enforce this.

See `[id]/AGENTS.md` for the component-by-component breakdown.

## Server Actions and Invariants

The action split is **brand-style**. Keep it.

- `createPtypeAction({ name })` (`_actions/ptype-actions.ts`): validates the
  create payload (name only), slugifies, derives the new ID from the stored-
  procedure result (falling back to `recordId`), rejects non-positive IDs, and
  revalidates `/dashboard/ptype` directly.
- `updatePtypeAction({ ptypeId, name, notes })` (`[id]/_actions/ptype-detail-actions.ts`):
  re-confirms the product type exists via `getExistingPtype()`, updates name +
  notes, and revalidates **only** `/dashboard/ptype` — the detail view is
  refreshed by the client calling `router.refresh()`.
- `setPtypeStatusAction({ ptypeId, inactive })` (`[id]/_actions/ptype-detail-actions.ts`):
  re-confirms the product type, toggles `inactive`, and revalidates
  `/dashboard/ptype` only.
- `deletePtypeAction(ptypeId)` (`[id]/_actions/ptype-detail-actions.ts`):
  re-confirms the product type, deletes, and revalidates `/dashboard/ptype` only.
  There is **no client-side referential guard**; the API validates relations.
- `uploadPtypeImageAction()`, `setPrimaryPtypeImageAction()`,
  `deletePtypeImageAction()` (`[id]/_actions/ptype-image-gallery-actions.ts`):
  gallery mutations described above. They revalidate both paths inside
  `updatePtypeImagePath()`.

There is **no** `revalidatePtype()` helper — every action calls `revalidatePath`
directly with the `PTYPE_PATH` literal. Detail actions revalidate **only the list
path**, relying on the client's `router.refresh()` for the detail view. If you
add server-side caching to the detail route, add the detail `revalidatePath` to
`updatePtypeAction` and `setPtypeStatusAction`. Do not trust client-side gating;
preserve the server-side re-validation, ownership checks, and limit enforcement.

## Services

- `ptype` (`src/services/api-main/ptype`): a single module with **full CRUD**. It
  provides `getPtypesPage()` (paginated list, via `findManagerAllPtypes`),
  `getPtypeById()` (detail, via `findPtypeById`), `getPtypes()` (a non-paginated
  list via `findAllPtypes`, exported but **not used by the list page**), and
  `ptypeServiceApi.createPtype`/`updatePtype`/`deletePtype` (stored-procedure
  mutations). Errors: `PtypeError` (with `PTYPE_OPERATION_ERROR` code surfaced
  via `getSafeOperationMessage`), `PtypeNotFoundError`, `PtypeValidationError`.
  Produces `UIPtype`.
- `general-call` (`src/services/api-main/general-call`):
  `generalCallServiceApi.updateTableInlineField()` + `FIELD_TYPE`, used by gallery
  actions for `PATH_IMAGEM`.
- `api-assets` (`src/services/api-assets`): gallery read/upload/primary/delete
  via `assetsApiService`, plus `isApiError` / `isNotFoundApiError`.

Read the local `AGENTS.md` inside each service module before changing it.

## Pending API Features

**None.** Create, update, status (activate/inactivate), delete, and all gallery
mutations are enabled and wired. Do not mark any flow as pending.

## Conventions for Changes

- Preserve `page.tsx` and `[id]/page.tsx` as Server Components. Keep `PtypeDetails`
  Client and local to `[id]/_components/`.
- Keep the brand-style action split: create in parent `_actions/`; update/status/
  delete in `[id]/_actions/ptype-detail-actions.ts`. Do not move detail actions
  into the parent or vice versa.
- Use the DTOs from `ptype-dashboard-types.ts` and `image-gallery-types.ts`; do
  not send raw API entities to Client Components.
- Keep user-facing text in Brazilian Portuguese and code, comments, and technical
  documentation in US English. Use `createLogger()` for errors and return generic
  safe messages.
- When adding a list filter, update together: the type union in
  `ptype-dashboard-types.ts`, the `VALID_*` set + parsing in `search-params.ts`,
  the `mapPtypeFiltersToApi()` mapping, the `buildPtypeUrl()` omission logic, the
  filter control in the `RegistryFilterSheet`, the `removeFilter` switch, and the
  active-filter chips `useMemo` in `PtypeToolbar`. (There is no `countPtypeFilters`.)
- When adding a sort option, align the `VALID_SORTS` set, the `<select>` options
  in `PtypeToolbar`, and the `columnId` mapping in `mapPtypeFiltersToApi()`.
- When adding a new editable field, align together: `updateSchema` in
  `ptype-detail-actions.ts`, the single `PtypeDetails` form, the `updatePtype`
  payload, and the `UIPtype`/transformer field. Keep the single-form model.
- Keep `PATH_IMAGEM` synchronization in step with any gallery primary change; a
  new gallery mutation that changes the primary image must call
  `updatePtypeImagePath()` and keep the 300-char guard + `warning` partial-success
  behavior.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Route, Server Action, cache behavior, or integration changes: also run
  `pnpm build` when viable.
- Visual or interactive changes: validate `/dashboard/ptype` and
  `/dashboard/ptype/[id]` in the development server (port 5581) on desktop and
  mobile, including search, status filter, sort/order, grid/list switching,
  pagination, empty and error states, create flow, the single edit form, status
  activate/deactivate, delete confirm + redirect to `returnTo`, gallery
  upload/primary/delete (including last-image rejection), zoom navigation, the
  PATH_IMAGEM viewer refresh, and the `returnTo` back link with valid and invalid
  `id`.
- This project currently has no automated test command; do not invent one.
