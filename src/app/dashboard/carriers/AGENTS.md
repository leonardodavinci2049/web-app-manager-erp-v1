# Carriers Route Agent Guide

This file complements the repository and dashboard guides for
`src/app/dashboard/carriers`. It governs the `/dashboard/carriers` list route and
the `/dashboard/carriers/[id]` detail route, including their data loading, URL
state, Server Actions, and the carrier image gallery.

Read this before changing any file in this segment. For shared dashboard rules
(root redirect, layout, sidebar), follow `src/app/dashboard/AGENTS.md`. For
detail-specific architecture (page composition, the single edit form, and the
gallery subsystem internals), follow `[id]/AGENTS.md`.

## Route Purpose

The carriers segment is the registry for freight carriers ("transportadoras"). It
supports:

- Carrier search and a combined `status` filter on the list page.
- Grid and list presentation, with a desktop table for list mode.
- Pagination through the `page` query parameter (zero-based).
- Creation of new carriers and navigation to the detail page while preserving
  the current list URL via `returnTo`.
- A single unified edit form (identity, documents, contacts, image path, notes)
  backed by one `updateCarrierAction`.
- Carrier deletion via `deleteCarrierAction` (this flow **is** enabled).
- A carrier image gallery backed by the Assets API, synchronized with the legacy
  `PATH_IMAGEM` column on `tbl_transportadora`.

Notable scope differences from customer: there is no seller, no latest-products
block, no sectioned/independent forms, no person-type/customer-type toggles, and
no restriction flag. Status (active/inactive) change is intentionally disabled
("Pendente de API").

Do not move list behavior into `src/app/dashboard/page.tsx`; that page is
reserved for session-aware redirection.

## Folder Structure

```text
carriers/
├── AGENTS.md
├── page.tsx                              # List: auth context + getCarriersPage read
├── loading.tsx                           # List segment skeleton (RegistryLoading)
├── error.tsx                             # List error boundary (Client)
├── _actions/
│   └── carrier-actions.ts                # create/update/delete (shared with detail)
├── _components/
│   ├── index.ts                          # Public list exports and URL helpers
│   ├── carrier-dashboard.tsx             # Server: composes grid/list subtrees -> toolbar
│   ├── carrier-toolbar/                  # Client: URL filters + view mode + create
│   ├── carrier-list/                     # Collection, pagination, image, and upload
│   ├── carrier-create/                   # Client: new carrier form
│   ├── carrier-form-fields.tsx           # Shared form fields (create + detail edit)
│   ├── lib/
│   │   └── search-params.ts              # Pure URL <-> filters mapping (single source of truth)
│   └── types/
│       └── carrier-dashboard-types.ts    # CarrierSearchParams, CarrierFormValues, unions
└── [id]/
    ├── AGENTS.md                         # Detail route guide
    ├── page.tsx                          # Detail: auth + getCarrierById + Suspense nodes
    ├── loading.tsx                       # Detail skeleton (RegistryDetailLoading, variant="extended")
    ├── error.tsx                         # Detail error boundary (Client)
    ├── not-found.tsx                     # Invalid/inaccessible carrier UI
    ├── _actions/
    │   └── carrier-image-gallery-actions.ts  # Gallery upload/primary/delete/PATH sync
    └── _components/
        ├── carrier-detail-layout.tsx     # Server: three-area detail composition
        ├── overview/                     # One component per first-fold card/section
        ├── tabs/                         # Tab composer + one component per tab
        └── image-gallery/                # Gallery subsystem (see [id]/AGENTS.md)
```

The `[id]/` segment owns the route-specific layout, overview, tabs, and gallery.
Only genuinely shared list/detail UI, such as `CarrierFormFields`, remains in
the parent `_components/` directory.

## List Page Responsibilities

Keep `page.tsx` as a Server Component. It should:

1. Opt into request-time execution with `await connection()` (Cache Components).
2. Await `searchParams`.
3. Parse URL state with `parseCarrierSearchParams()`.
4. Convert filters to API params with `mapCarrierFiltersToApi()`.
5. Obtain authenticated API context through `getAuthContext()`.
6. Call `getCarriersPage()` and isolate failures via `.catch()`: on error, log
   with `createLogger("CarrierDashboardPage")`, set `hasLoadError`, and return
   `{ items: [], total: 0 }` so the toolbar and active filters still render.
7. Render the `SiteHeaderWithBreadcrumb` (title "Transportadoras") and
   `RegistryPageShell` with `CarrierDashboard`, passing only UI DTOs.

Do not duplicate filter parsing or URL construction in `page.tsx`.

## Detail Page Responsibilities

Keep `[id]/page.tsx` as a Server Component. It should:

1. Opt into request-time execution with `await connection()`.
2. Await `params` and `searchParams` together with `Promise.all`.
3. Validate `id`: reject non-numeric (`/^\d+$/`), non-safe-integer, and
   non-positive values with `notFound()`.
4. Resolve `returnTo` with `getSafeCarrierReturnTo()` (imported from
   `../_components`). The back link only accepts same-origin paths whose pathname
   is exactly `/dashboard/carriers`.
5. Obtain authenticated API context through `getAuthContext()`.
6. Fetch the carrier with `getCarrierById()`; map `CarrierNotFoundError` to
   `notFound()` and rethrow other errors so the segment `error.tsx` boundary
   handles them. Guard a null return with a final `if (!carrier) notFound()`.
7. Render `SiteHeaderWithBreadcrumb` (breadcrumb "Transportadoras" links to
   `returnTo`; last crumb is `carrier.name`) and a custom `max-w-[1400px]`
   container (this route does **not** use `RegistryPageShell`).
8. Compose `CarrierDetailLayout` with the carrier DTO, `returnTo`, and two
   `<Suspense>` nodes built on the **page**: `imageGallery`
   (`CarrierImageGalleryServer`) and `imageContent` (`CarrierImagesListServer`).

There is no secondary parallel fetch (no seller, no latest products), so there is
no `hasProductsError` isolation. `getCarrierById()` returns `UICarrier | undefined`.

## Authentication and Data Isolation

- `getAuthContext()` is mandatory for both pages and every Server Action.
- Authentication does not replace organization and resource authorization.
  Mutating actions must re-resolve the authenticated context and re-confirm the
  carrier exists (`getExistingCarrier()`, or `getAuthorizedCarrierContext()` for
  gallery actions) before mutating.
- Never pass `apiContext`, session objects, tokens, raw entities, or internal
  errors to Client Components. Return only the DTOs defined in
  `carrier-dashboard-types.ts`, `image-gallery-types.ts`, and the carrier
  service's `UICarrier`.
- Carrier reads are organization-dependent. Do not add `"use cache"` unless the
  cache key safely isolates organization and private context.
- Read the closest service-level `AGENTS.md` before modifying any module under
  `src/services/api-main` or `src/services/api-assets`.

## URL State

`_components/lib/search-params.ts` is the single source of truth for parsing and
building the list URL. Use `parseCarrierSearchParams()`, `mapCarrierFiltersToApi()`,
`buildCarrierUrl()`, `buildCarrierDetailHref()`, and `getSafeCarrierReturnTo()`
instead of rebuilding query strings.

There is **no** `countCarrierFilters` helper (unlike customer). Active-filter
counting is inlined in `CarrierToolbar`.

| Parameter | Accepted value | Purpose |
| --- | --- | --- |
| `search` | text, up to 100 characters (trimmed/sliced) | Carrier name/document search |
| `status` | `all`, `active`, `inactive` (string union) | Status filter |
| `sort` | `id`, `name` | Ordering column |
| `order` | `asc`, `desc` | Ordering direction |
| `page` | non-negative integer (`/^\d+$/`) | Page index (zero-based) |
| `limit` | `25`, `50`, `100` (default `50` = `DEFAULT_CARRIER_LIMIT`) | Page size |
| `accum` | non-negative integer (default `0`, capped by `MAX_REGISTRY_EXTRA_BATCHES`) | Extra batches appended by "Carregar mais" on top of `page`; any filter/search/sort/limit change or page selection resets it |

`mapCarrierFiltersToApi()` mapping: `status` `active`→`2`, `inactive`→`1`,
`all`/other→`0`; `sort` `name`→`1`, `id`/other→`2`; `order` `asc`→`1`,
`desc`/other→`2`. The `status` filter is a **string union**, not a numeric
tri-state like customer's.

The grid/list view mode is **not** URL state. It is a browser preference kept in
`localStorage` under `dashboard:carrier-view-mode` and managed by
`CarrierToolbar` via the shared `useRegistryViewMode()` hook. Toggling it is
instant and never triggers a refetch.

## List UI

- `CarrierDashboard` (Server) builds both `grid` and `list` subtrees and passes
  them to the Client `CarrierToolbar`, which renders only the active variant
  based on the client-side `viewMode`.
- `CarrierToolbar` is the only Client orchestrator for the list. It owns the
  shared `RegistrySearch` input (maxLength 100), the `RegistryFilterSheet`
  (status/sort/order/limit selects), the `RegistryViewModeToggle`, the create
  button/sheet, the active-filter chips (`RegistryActiveFilters`), and the mobile
  bottom bar.
- All data filters are written to the URL via `router.replace(buildCarrierUrl(...))`
  inside a `useTransition`. `removeFilter` and `clearFilters` always reset `page`
  to `0`. Never duplicate this logic in other components.
- `CarrierCollection` renders the error state, empty states (with-filter vs
  no-filter), the grid cards, the mobile list cards, and the desktop table
  (columns: Imagem, ID, Transportadora, Tipo, Documento, Telefone/WhatsApp,
  E-mail, Ações). It depends on `CarrierImage` (Client) and `CarrierPagination`.
- `CarrierPagination` is a thin wrapper over the shared `RegistryPagination`.
- After a successful create, the toolbar navigates to the new carrier detail page
  via `buildCarrierDetailHref()` (preserving only the current `limit`) and calls
  `router.refresh()`.

## Detail UI

`CarrierDetailLayout` is a Server Component in `[id]/_components`. It composes
the sticky desktop gallery, route-local `overview/` cards, and full-width
`tabs/`. Client state is limited to the visual person-type coordinator and the
independent editing, deletion, and gallery components. Editing remains one form
that reuses the parent `CarrierFormFields`. See `[id]/AGENTS.md`.

## Image Gallery

The gallery lives under `[id]/_components/image-gallery` and integrates two
systems: the Assets API (source of truth for the gallery) and the legacy
`PATH_IMAGEM` column on `tbl_transportadora` (denormalized pointer read by the
list and detail UI).

- Entity type is `CARRIER_GALLERY_ENTITY_TYPE` (`"CARRIER"`); the entity ID is
  the carrier ID stringified.
- The gallery is capped at `CARRIER_GALLERY_LIMIT` (7) images and accepts only
  `CARRIER_GALLERY_ACCEPTED_MIME_TYPES` up to `CARRIER_GALLERY_MAX_FILE_SIZE`
  (2 MB).
- `getCarrierGalleryInitialState()` is wrapped in React `cache()` so the gallery
  node and the images-list node share a single Assets API read per request.
- `PATH_IMAGEM` synchronization is mandatory on four flows (first upload,
  primary change, primary deletion, and manual update from the first card) and
  writes through
  `generalCallServiceApi.updateTableInlineField` (table `tbl_transportadora`, key
  `ID_TRANSPORTADORA`, field `PATH_IMAGEM`, max 300 chars, `FIELD_TYPE.STRING`).
  If the original URL is empty or exceeds 300 chars, the write is skipped and the
  action returns `success: true` with a `warning` (partial success; the asset
  operation is not rolled back).
- The last remaining image cannot be deleted; the action and the client button
  both enforce this.

See `[id]/AGENTS.md` for the component-by-component breakdown.

## Server Actions and Invariants

Mutating actions live in two files. List + detail CRUD is shared in the parent;
gallery mutations live in `[id]/_actions`.

- `createCarrierAction()` (`_actions/carrier-actions.ts`): validates the full
  create payload, derives the new ID from the stored-procedure result (falling
  back to `recordId`), rejects non-positive IDs, and runs a **second** update
  call to persist notes only when notes are non-empty (the create schema has no
  notes field). A notes-step failure downgrades the success message to a warning
  but does not roll back the creation. Calls `revalidateCarrier()`.
- `updateCarrierAction()` (`_actions/carrier-actions.ts`): re-confirms the carrier
  exists via `getExistingCarrier()`, updates the full `CarrierFormValues`, and
  calls `revalidateCarrier()`.
- `deleteCarrierAction()` (`_actions/carrier-actions.ts`): re-confirms the
  carrier exists, deletes it, and calls `revalidateCarrier()`. This flow is
  **fully wired** (not pending API).
- `uploadCarrierImageAction()`, `setPrimaryCarrierImageAction()`,
  `deleteCarrierImageAction()`, `updateCarrierImagePathFromPrimaryAction()`
  (`[id]/_actions/carrier-image-gallery-actions.ts`): gallery mutations and
  manual PATH synchronization described above. They call `revalidatePath` directly inside
  the `PATH_IMAGEM` helper (they do not reuse `revalidateCarrier()`).

`revalidateCarrier(carrierId?)` revalidates both `/dashboard/carriers` and
`/dashboard/carriers/${carrierId}`. Do not trust client-side gating: direct
Server Action calls bypass Client Components, so preserve the re-validation,
ownership checks, and limit enforcement server-side. Use `safeOperationMessage()`
to surface only safe operation messages from stored-procedure errors; never leak
raw responses or context.

## Services

- `carrier` (`src/services/api-main/carrier`): the **single** service module for
  all carrier CRUD — list reads (`getCarriersPage` via `findManagerAllCarriers`),
  detail read (`getCarrierById`), and stored-procedure mutations (`createCarrier`,
  `updateCarrier`, `deleteCarrier`). There is no separate `-inline` or `-upd`
  module (unlike customer). Produces `UICarrier`.
- `general-call` (`src/services/api-main/general-call`):
  `generalCallServiceApi.updateTableInlineField()` + `FIELD_TYPE`, used by gallery
  actions to write `PATH_IMAGEM` on `tbl_transportadora` keyed by
  `ID_TRANSPORTADORA`.
- `api-assets` (`src/services/api-assets`): gallery read, upload, primary
  promotion, and deletion via `assetsApiService`, plus the `isApiError` /
  `isNotFoundApiError` guards.

Read the local `AGENTS.md` inside each service module before changing it.

## Pending API Features

- **Status change (Activate/Inactivate)**: the "Status do cadastro" card renders
  a disabled button labeled "Alterar status — Pendente de API". The list accepts
  a status filter, but the update endpoint cannot activate/inactivate a carrier.
  Do not wire this until a safe contract exists.

Flows that **are** enabled (do not mark as pending): carrier creation, full-field
update, deletion, and all gallery mutations. In particular, `deleteCarrierAction`
is wired and the deletion confirm dialog navigates back to `returnTo` on success
— this is the inverse of the customer route, where delete is disabled.

Do not present disabled flows as functional and do not simulate them.

## Conventions for Changes

- Preserve `page.tsx`, `[id]/page.tsx`, and `CarrierDetailLayout` as Server
  Components. Keep `"use client"` limited to focused interactive components.
- Use the DTOs from `carrier-dashboard-types.ts` and `image-gallery-types.ts`;
  never forward raw API entities or `apiContext`.
- Keep user-facing text in Brazilian Portuguese and code, comments, and technical
  documentation in US English. Use `createLogger()` for errors and return generic
  safe messages.
- When adding a new list filter, update together: the type union in
  `carrier-dashboard-types.ts`, the `VALID_*` set + parsing in `search-params.ts`,
  the `mapCarrierFiltersToApi()` mapping, the `buildCarrierUrl()` omission logic,
  the filter control in the `RegistryFilterSheet`, the `removeFilter` switch, and
  the active-filter chips `useMemo` in `CarrierToolbar`. (There is no
  `countCarrierFilters`.)
- When adding a new sort option, align the `VALID_SORTS` set, the `<select>`
  options in the toolbar, and the `columnId` mapping in `mapCarrierFiltersToApi()`.
- When adding a new editable field, align together: `CarrierFormValues`, the
  shared `CarrierFormFields` UI (both create and detail use it), the
  `formSchema`/`updateSchema` in `carrier-actions.ts`, the `toPayload()` mapping,
  the `UICarrier`/`transformCarrierDetail` field, and (if read-only) the relevant
  detail section component. Because editing is a single
  mega-form, there are no per-section actions to add.
- Keep `PATH_IMAGEM` synchronization in step with any gallery primary change; a
  new gallery mutation that changes the primary image must call
  `updateCarrierImagePath()` and keep the 300-char guard + `warning` partial-success
  behavior.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Route, Server Action, cache behavior, or integration changes: also run
  `pnpm build` when viable.
- Visual or interactive changes: validate `/dashboard/carriers` and
  `/dashboard/carriers/[id]` in the development server (port set by the `PORT` env var) on desktop and
  mobile, including search, status filter, sort/order, grid/list switching,
  pagination, empty and error states, create flow (including the notes two-step),
  edit save, delete confirm + redirect to `returnTo`, gallery upload/primary/delete
  (including last-image rejection), zoom navigation, the first-card PATH_IMAGEM
  update, and the `returnTo` back link with valid and invalid `id`.
- This project currently has no automated test command; do not invent one.
