# Suppliers Route Agent Guide

This file complements the repository and dashboard guides for
`src/app/dashboard/suppliers`. It governs the `/dashboard/suppliers` list route and
the `/dashboard/suppliers/[id]` detail route, including their data loading, URL
state, Server Actions, and the supplier image gallery.

Read this before changing any file in this segment. For shared dashboard rules
(root redirect, layout, sidebar), follow `src/app/dashboard/AGENTS.md`. For
detail-specific architecture (the single edit form, the status/deletion flows,
and the gallery subsystem internals), follow `[id]/AGENTS.md`.

## Route Purpose

The suppliers segment is the registry for suppliers ("Fornecedores"). It is the
most feature-complete registry: full CRUD plus status change. It supports:

- Supplier search, a `status` filter, and ordering on the list page.
- Grid and list presentation, with a desktop table for list mode.
- Pagination through the `page` query parameter (zero-based).
- Creation of new suppliers (name only) and navigation to the detail page while
  preserving the current list URL via `returnTo`.
- A single unified edit form (name + notes) backed by one `updateSupplierAction`.
- Activate/inactivate via `setSupplierStatusAction` (enabled).
- Deletion via `deleteSupplierAction` (enabled; the API validates relations).
- A supplier image gallery backed by the Assets API, synchronized with the legacy
  `PATH_IMAGEM` column on `tbl_fornecedor`.

There is no related-products block, no sectioned forms, no person-type/customer-
type toggles, and no restriction flag.

Do not move list behavior into `src/app/dashboard/page.tsx`; that page is
reserved for session-aware redirection.

## Folder Structure

```text
suppliers/
├── AGENTS.md
├── page.tsx                              # List: auth context + getSuppliersPage read
├── loading.tsx                           # List segment skeleton
├── error.tsx                             # List error boundary (Client)
├── _actions/
│   └── supplier-actions.ts               # create/update/status/delete (shared with detail)
├── _components/
│   ├── index.ts                          # Public list exports and URL helpers
│   ├── supplier-dashboard.tsx            # Server: composes grid/list subtrees -> toolbar
│   ├── supplier-toolbar.tsx              # Client: URL filters + view mode + create
│   ├── supplier-collection.tsx           # Server: grid cards + desktop table + empty/error
│   ├── supplier-pagination.tsx           # Server: thin RegistryPagination wrapper
│   ├── supplier-image.tsx                # Client: avatar via shared RegistryEntityImage
│   ├── supplier-create-sheet.tsx         # Client: new supplier sheet + discard dialog (name only)
│   ├── lib/
│   │   └── search-params.ts              # Pure URL <-> filters mapping (single source of truth)
│   └── types/
│       └── supplier-dashboard-types.ts   # SearchParams, ActionResult, unions
└── [id]/
    ├── AGENTS.md                         # Detail route guide
    ├── page.tsx                          # Detail: auth + getSupplierById + Suspense nodes
    ├── loading.tsx                       # Detail segment skeleton
    ├── error.tsx                         # Detail error boundary (Client)
    ├── not-found.tsx                     # Invalid/inaccessible supplier UI
    ├── _actions/
    │   └── supplier-image-gallery-actions.ts  # Gallery upload/primary/delete/PATH sync
    └── _components/
        ├── supplier-detail-layout.tsx    # Server: three-area detail composition
        ├── overview/                     # One component per first-fold card/section
        ├── tabs/                         # Tab composer + one component per tab
        └── image-gallery/                # Gallery subsystem (see [id]/AGENTS.md)
```

This matches the registration-detail pattern used by customers and carriers.
The parent `_actions/supplier-actions.ts` holds CRUD shared with the list, while
the `[id]/` segment owns its layout, overview, tabs, gallery, and gallery actions.

## List Page Responsibilities

Keep `page.tsx` as a Server Component. It should:

1. Opt into request-time execution with `await connection()` (Cache Components).
2. Await `searchParams`.
3. Parse URL state with `parseSupplierSearchParams()`.
4. Convert filters to API params with `mapSupplierFiltersToApi()`.
5. Obtain authenticated API context through `getAuthContext()`.
6. Call `getSuppliersPage()` and isolate failures via `.catch()`: on error, log
   with `createLogger("SupplierDashboardPage")`, set `hasLoadError`, and return
   `{ items: [], total: 0 }` so the toolbar and active filters still render.
7. Render the `SiteHeaderWithBreadcrumb` (title "Fornecedores") and
   `RegistryPageShell` with `SupplierDashboard`, passing only UI DTOs.

Do not duplicate filter parsing or URL construction in `page.tsx`.

## Detail Page Responsibilities

Keep `[id]/page.tsx` as a Server Component. It should:

1. Opt into request-time execution with `await connection()`.
2. Await `params` and `searchParams` together with `Promise.all`.
3. Validate `id`: reject non-numeric (`/^\d+$/`), non-safe-integer, and
   non-positive values with `notFound()`.
4. Resolve `returnTo` with `getSafeSupplierReturnTo()` (imported from
   `../_components`). The back link only accepts same-origin paths whose pathname
   is exactly `/dashboard/suppliers`.
5. Obtain authenticated API context through `getAuthContext()`.
6. Fetch the supplier with `getSupplierById()`; map `SupplierNotFoundError` to
   `notFound()` and rethrow other errors so the segment `error.tsx` boundary
   handles them. Guard a null return with `if (!supplier) notFound()`.
7. Render `SiteHeaderWithBreadcrumb` (breadcrumb "Fornecedores" links to
   `returnTo`; last crumb is `supplier.name`) and a custom `max-w-[1400px]`
   container (this route does **not** use `RegistryPageShell`).
8. Compose `SupplierDetailLayout` with the supplier DTO, `returnTo`, and two
   `<Suspense>` nodes built on the **page**: `imageGallery`
   (`SupplierImageGalleryServer`) and `imageContent` (`SupplierImagesListServer`).

## Authentication and Data Isolation

- `getAuthContext()` is mandatory for both pages and every Server Action.
- Authentication does not replace organization and resource authorization.
  Mutating actions must re-resolve the authenticated context and re-confirm the
  supplier exists (`getExistingSupplier()`, or `getAuthorizedSupplierContext()`
  for gallery actions) before mutating.
- Never pass `apiContext`, session objects, tokens, raw entities, or internal
  errors to Client Components. Return only the DTOs defined in
  `supplier-dashboard-types.ts`, `image-gallery-types.ts`, and the supplier
  service's `UISupplier`.
- Supplier reads are organization-dependent. Do not add `"use cache"` unless the
  cache key safely isolates organization and private context.
- Read the closest service-level `AGENTS.md` before modifying any module under
  `src/services/api-main` or `src/services/api-assets`.

## URL State

`_components/lib/search-params.ts` is the single source of truth for parsing and
building the list URL. Use `parseSupplierSearchParams()`, `mapSupplierFiltersToApi()`,
`buildSupplierUrl()`, `buildSupplierDetailHref()`, and `getSafeSupplierReturnTo()`
instead of rebuilding query strings.

There is **no** `countSupplierFilters` helper. Active-filter counting is inlined
in `SupplierToolbar`.

| Parameter | Accepted value | Purpose |
| --- | --- | --- |
| `search` | text, up to 300 characters | Free-text search |
| `status` | `all`, `active`, `inactive` | Status filter |
| `sort` | `id`, `name`, `last-purchase` | Ordering column |
| `order` | `asc`, `desc` | Ordering direction |
| `page` | non-negative integer (default `0`) | Page index (zero-based) |
| `limit` | `25`, `50` (default `DEFAULT_SUPPLIER_LIMIT`), `100` | Page size |

The grid/list view mode is **not** URL state. It is a browser preference kept in
`localStorage` under `dashboard:supplier-view-mode` and managed by
`SupplierToolbar` via the shared `useRegistryViewMode()` hook. Toggling it is
instant and never triggers a refetch.

## List UI

- `SupplierDashboard` (Server) builds both `grid` and `list` subtrees and passes
  them to the Client `SupplierToolbar`, which renders only the active variant
  based on the client-side `viewMode`.
- `SupplierToolbar` is the only Client orchestrator. It owns the shared
  `RegistrySearch` input, the `RegistryFilterSheet`, the `RegistryViewModeToggle`,
  the create button/sheet, the active-filter chips (`RegistryActiveFilters`), and
  the mobile bottom bar.
- All data filters are written to the URL via
  `router.replace(buildSupplierUrl(...))` inside a `useTransition`.
  `removeFilter`/`clearFilters` always reset `page` to `0`. Never duplicate this
  logic in other components.
- `SupplierCollection` renders the grid cards, the desktop table, empty/error
  states, and `SupplierPagination`.
- `SupplierPagination` is a thin wrapper over the shared `RegistryPagination`.
- After a successful create, the toolbar navigates to the new supplier detail page
  via `buildSupplierDetailHref()` (preserving only the current `limit`) and calls
  `router.refresh()`.

## Detail UI

`SupplierDetailLayout` is a Server Component in `[id]/_components`. It composes
the sticky desktop gallery, route-local `overview/` cards, and full-width
`tabs/`. Client state is limited to the visual person-type coordinator and the
independent editing, status, deletion, and gallery components. Editing remains
one name + notes form in `SupplierEditingTab`; status and deletion keep separate
confirmation flows. See `[id]/AGENTS.md`.

## Image Gallery

The gallery lives under `[id]/_components/image-gallery` and integrates two
systems: the Assets API (source of truth for the gallery) and the legacy
`PATH_IMAGEM` column on `tbl_fornecedor` (denormalized pointer read by the list
and detail UI).

- Entity type is `SUPPLIERS_GALLERY_ENTITY_TYPE` (**`"SUPPLIERS"`** — plural;
  note the inconsistency with the singular service module name `supplier`).
- The gallery is capped at `SUPPLIERS_GALLERY_LIMIT` (7) images and accepts only
  `SUPPLIERS_GALLERY_ACCEPTED_MIME_TYPES` up to `SUPPLIERS_GALLERY_MAX_FILE_SIZE`
  (2 MB).
- `getSupplierGalleryInitialState()` is wrapped in React `cache()` so the gallery
  node and the images-list node share a single Assets API read per request.
- `PATH_IMAGEM` synchronization is mandatory on four flows (first upload,
  primary change, primary deletion, and manual update from the first card) and
  writes through
  `generalCallServiceApi.updateTableInlineField` (table `tbl_fornecedor`, key
  `ID_FORNECEDOR`, field `PATH_IMAGEM`, max 300 chars) via the local
  `updateSupplierImagePath()` helper. If the original URL is empty or exceeds 300
  chars, the write is skipped and the action returns a `warning` (partial
  success; the asset operation is not rolled back).
- The last remaining image cannot be deleted; the action and the client button
  both enforce this.

See `[id]/AGENTS.md` for the component-by-component breakdown.

## Server Actions and Invariants

All CRUD/status actions live in the parent `_actions/supplier-actions.ts` (shared
with the detail, like carriers). Gallery mutations live in `[id]/_actions`.

- `createSupplierAction({ name })`: validates the create payload (name only),
  slugifies the name, derives the new ID from the stored-procedure result
  (falling back to `recordId`), rejects non-positive IDs, and calls
  `revalidateSupplier()`. (There is no two-step notes write.)
- `updateSupplierAction({ supplierId, name, notes })`: re-confirms the supplier
  exists via `getExistingSupplier()`, updates name + notes, and calls
  `revalidateSupplier(supplierId)`.
- `setSupplierStatusAction({ supplierId, inactive })`: re-confirms the supplier,
  toggles `inactive`, and calls `revalidateSupplier(supplierId)`.
- `deleteSupplierAction(supplierId)`: re-confirms the supplier, deletes, and
  calls `revalidateSupplier(supplierId)`. There is **no client-side referential
  guard**; the API validates relations and errors are surfaced via
  `getSafeOperationMessage()`.
- `uploadSupplierImageAction()`, `setPrimarySupplierImageAction()`,
  `deleteSupplierImageAction()`, `updateSupplierImagePathFromPrimaryAction()`
  (`[id]/_actions/supplier-image-gallery-actions.ts`): gallery mutations and
  manual PATH synchronization described above. They call `revalidatePath` directly inside
  `updateSupplierImagePath()` and do **not** reuse `revalidateSupplier()`.

`revalidateSupplier(supplierId?)` revalidates both `/dashboard/suppliers` and
`/dashboard/suppliers/${supplierId}`. Do not trust client-side gating: direct
Server Action calls bypass Client Components, so preserve the re-validation,
ownership checks, and limit enforcement server-side.

## Services

- `supplier` (`src/services/api-main/supplier`): a single module with **full
  CRUD**. It provides `getSuppliersPage()` (list, via `findManagerAllSuppliers`),
  `getSupplierById()` (detail, via `findSupplierById`), and
  `supplierServiceApi.createSupplier`/`updateSupplier`/`deleteSupplier` (stored-
  procedure mutations). It also exposes supplier-product relationship methods
  (`createSupplierRelation`, `deleteSupplierRelation`, `findAllSupplierRelProds`)
  that are **not used by this route's UI**. Errors: `SupplierError` (with
  `SUPPLIER_OPERATION_ERROR` code surfaced via `getSafeOperationMessage`),
  `SupplierNotFoundError`, `SupplierValidationError`. Produces `UISupplier`.
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

- Preserve `page.tsx`, `[id]/page.tsx`, and `SupplierDetailLayout` as Server
  Components. Keep `"use client"` limited to focused interactive components.
- Use the DTOs from `supplier-dashboard-types.ts` and `image-gallery-types.ts`;
  never forward raw API entities or `apiContext`.
- Keep user-facing text in Brazilian Portuguese and code, comments, and technical
  documentation in US English. Use `createLogger()` for errors and return generic
  safe messages.
- When adding a list filter, update together: the type union in
  `supplier-dashboard-types.ts`, the `VALID_*` set + parsing in `search-params.ts`,
  the `mapSupplierFiltersToApi()` mapping, the `buildSupplierUrl()` omission logic,
  the filter control in the `RegistryFilterSheet`, the `removeFilter` switch, and
  the active-filter chips `useMemo` in `SupplierToolbar`. (There is no
  `countSupplierFilters`.)
- When adding a new editable field, align together: `updateSchema`/`createSchema`
  in `supplier-actions.ts`, the single `SupplierEditingTab` form, the
  `updateSupplier`/`createSupplier` payload, and the `UISupplier`/transformer
  field. Keep the single-form model.
- Keep `PATH_IMAGEM` synchronization in step with any gallery primary change; a
  new gallery mutation that changes the primary image must call
  `updateSupplierImagePath()` and keep the 300-char guard + `warning` partial-success
  behavior.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Route, Server Action, cache behavior, or integration changes: also run
  `pnpm build` when viable.
- Visual or interactive changes: validate `/dashboard/suppliers` and
  `/dashboard/suppliers/[id]` in the development server (port set by the `PORT` env var) on desktop and
  mobile, including search, status filter, sort/order, grid/list switching,
  pagination, empty and error states, create flow, the single edit form, status
  activate/deactivate, delete confirm + redirect to `returnTo`, gallery
  upload/primary/delete (including last-image rejection), zoom navigation, the
  first-card PATH_IMAGEM update, and the `returnTo` back link with valid and invalid
  `id`.
- This project currently has no automated test command; do not invent one.
