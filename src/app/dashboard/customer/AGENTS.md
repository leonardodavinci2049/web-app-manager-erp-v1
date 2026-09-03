# Customer Route Agent Guide

This file complements the repository and dashboard guides for
`src/app/dashboard/customer`. It governs the `/dashboard/customer` list route and
the `/dashboard/customer/[id]` detail route, including their data loading, URL
state, Server Actions, and the customer image gallery.

Read this before changing any file in this segment. For shared dashboard rules
(root redirect, layout, sidebar), follow `src/app/dashboard/AGENTS.md`.

## Route Purpose

The customer segment is the registry for CRM customers. It supports:

- Customer search, sorting, and combined filters on the list page.
- Grid and list presentation, with a desktop table for list mode.
- Pagination through the `page` query parameter.
- Creation of new customers and navigation to the detail page while preserving
  the current list URL.
- Sectioned editing of customer data: general, notes, personal, business,
  address, internet presence, restriction flag, person type, and customer type.
- A customer image gallery backed by the Assets API, synchronized with the
  legacy `PATH_IMAGEM` field.
- Recent product history and the related seller.

Do not move list behavior into `src/app/dashboard/page.tsx`; that page is
reserved for session-aware redirection.

## Folder Structure

```text
customer/
├── AGENTS.md
├── page.tsx                              # List: auth context + data reads
├── loading.tsx                           # List segment skeleton
├── error.tsx                             # List error boundary (Client)
├── _actions/
│   └── customer-actions.ts               # Create + section update Server Actions
├── _components/
│   ├── index.ts                          # Public exports for the list route
│   ├── customer-dashboard.tsx            # Composes toolbar + grid/list subtrees
│   ├── customer-toolbar.tsx              # Client: URL filters + view mode + create
│   ├── customer-collection.tsx           # Grid cards and desktop list table
│   ├── customer-pagination.tsx           # Registry pagination wrapper
│   ├── customer-image.tsx                # Client avatar/image with fallback
│   ├── customer-create-sheet.tsx         # Client: new customer form
│   ├── customer-filter-panel.tsx         # Client: advanced filters sheet
│   ├── lib/
│   │   └── search-params.ts              # URL <-> filters mapping (pure)
│   └── types/
│       └── customer-dashboard-types.ts   # SearchParams, ActionResult, unions
└── [id]/
    ├── page.tsx                          # Detail: auth context + bundle reads
    ├── loading.tsx                       # Detail segment skeleton
    ├── error.tsx                         # Detail error boundary (Client)
    ├── not-found.tsx                     # Invalid/inaccessible customer UI
    ├── _actions/
    │   └── customer-image-gallery-actions.ts  # Gallery upload/primary/delete/PATH sync
    └── _components/
        ├── customer-detail-layout.tsx    # Detail composition (Server)
        ├── overview/                      # First-fold overview sections
        ├── tabs/                          # Second-fold tabs and editors
        ├── purchases/                     # Purchase tabs/search state
        └── image-gallery/
            ├── index.ts
            ├── image-gallery-constants.ts        # Entity type, limits, MIME
            ├── image-gallery-types.ts            # Gallery state + mutation DTO
            ├── image-gallery-skeleton.tsx        # Suspense fallback
            ├── customer-image-gallery-server.tsx # Cached gallery read (Server)
            ├── customer-image-gallery-refresh.tsx# Client: state + router refresh
            ├── customer-image-gallery.tsx        # Client: upload + grid actions
            └── customer-images-list.tsx          # Client: PATH_IMAGEM viewer
```

## List Page Responsibilities

Keep `page.tsx` as a Server Component. It should:

1. Opt into request-time execution with `connection()` because reads depend on
   request and organization context.
2. Await `searchParams`.
3. Parse URL state with `parseCustomerSearchParams()`.
4. Convert filters to API params with `mapCustomerFiltersToApi()`.
5. Obtain authenticated API context through `getAuthContext()`.
6. Call `getCustomersPage()` and isolate failures: on error, log with
   `createLogger("CustomerDashboardPage")`, set `hasLoadError`, and return an
   empty result so the rest of the page still renders.
7. Render the `SiteHeaderWithBreadcrumb` and `RegistryPageShell` with
   `CustomerDashboard`, passing minimal UI DTOs only.

Do not duplicate filter parsing or URL construction in `page.tsx`.

## Detail Page Responsibilities

Keep `[id]/page.tsx` as a Server Component. It should:

1. Opt into request-time execution with `connection()`.
2. Await `params` and `searchParams` together.
3. Validate `id`: reject non-numeric input, non-safe integers, and non-positive
   values with `notFound()`.
4. Resolve `returnTo` with `getSafeCustomerReturnTo()` so the back link only
   accepts same-origin `/dashboard/customer` paths.
5. Obtain authenticated API context through `getAuthContext()`.
6. Fetch the customer bundle with `getCustomerById()`.
7. Convert a `CustomerNotFoundError` into `notFound()`; rethrow other real
   errors so the segment error boundary handles them.
8. Render the image gallery and the image list inside `<Suspense>` using the
   cached `getCustomerGalleryInitialState()`.

The detail page composes `CustomerDetailLayout`, which receives the gallery and image
content as React nodes so the Suspense boundaries stay on the page.

## Authentication and Data Isolation

- `getAuthContext()` is mandatory for both pages and every Server Action.
- Authentication does not replace organization and resource authorization.
  Server Actions must re-resolve the authenticated context and re-confirm the
  customer exists with `getExistingCustomer()` or
  `getAuthorizedCustomerContext()` before mutating.
- Never pass `apiContext`, session objects, tokens, raw integration entities, or
  internal errors to Client Components. Return only the DTOs defined in
  `customer-dashboard-types.ts`, `purchases/customer-purchases-types.ts`,
  `image-gallery-types.ts`, and the `customer-general` transformers.
- Customer reads are organization-dependent. Do not add `"use cache"` unless the
  cache key safely isolates organization and private context.
- Read the closest service-level `AGENTS.md` before modifying any module under
  `src/services/api-main` or `src/services/api-assets`.

## Integration Failures

Both pages intentionally isolate failures per integration:

- List page: a product integration failure falls back to an empty result with
  `hasLoadError`, preserving the toolbar and active filters.
- Detail page: a products failure falls back to an empty list; the customer,
  seller, and gallery remain available.
- Gallery read: errors from the Assets API are classified as `empty` (404) or
  `error` (other) so the gallery renders an actionable state instead of crashing
  the detail page.

Keep client-facing messages generic and in Brazilian Portuguese. Log internal
details with `createLogger()`; do not use `console.error`.

## URL State

`_components/lib/search-params.ts` is the single source of truth for parsing and
building the list URL. Use `parseCustomerSearchParams()`,
`mapCustomerFiltersToApi()`, `buildCustomerUrl()`, `buildCustomerDetailHref()`,
`getSafeCustomerReturnTo()`, and `countCustomerFilters()` instead of rebuilding
query strings.

| Parameter | Accepted value | Purpose |
| --- | --- | --- |
| `search` | text, up to 300 characters | Customer search |
| `category` | non-negative integer | Category filter |
| `client-type` | non-negative integer | Customer-type filter |
| `person-type` | non-negative integer | Person-type filter |
| `no-image` | `1` | Customers without image |
| `approved` | `0`, `1`, `2` | Approval tri-state |
| `gender` | `0`, `1`, `2` | Gender tri-state |
| `restricted` | `0`, `1`, `2` | Restriction tri-state |
| `enabled` | `0`, `1`, `2` | Active/inactive tri-state |
| `status` | non-negative integer | Status filter |
| `operation` | `0`, `1`, `2`, `3`, `6`, `7` | Purchase-window preset |
| `start-date` | `YYYY-MM-DD` | Interval start (only with `operation=7`) |
| `end-date` | `YYYY-MM-DD` | Interval end (only with `operation=7`) |
| `sort` | `id`, `name`, `last-purchase` | Ordering column |
| `order` | `asc`, `desc` | Ordering direction |
| `page` | non-negative integer | Page index (zero-based) |
| `limit` | `25`, `50`, `100` | Page size (default `50`) |

Tri-state filters use `0` for "all", `1` for the first option, and `2` for the
second option; the labels are resolved in `CustomerToolbar`. When `operation` is
`7` but the date interval is missing or inverted, `mapCustomerFiltersToApi()`
drops the operation and dates so the API never receives an invalid interval.

The grid/list view mode is **not** URL state. It is a browser preference kept in
`localStorage` under `dashboard:customer-view-mode` and managed by
`CustomerToolbar` via `useRegistryViewMode()`. Toggling it is instant and never
triggers a refetch.

## List UI

- `CustomerDashboard` builds both `grid` and `list` Server subtrees and passes
  them to the Client `CustomerToolbar`, which renders only the active variant
  based on the client-side `viewMode`.
- `CustomerToolbar` is the only Client orchestrator for the list. It owns the
  search input, the filter sheet trigger, the view-mode toggle, the create
  sheet, the active-filter chips, and the mobile bottom bar.
- All data filters are written to the URL via `router.replace()` inside a
  `useTransition`. Never duplicate this logic in other components.
- `CustomerCollection` renders the grid cards and the desktop table. It depends
  on `CustomerImage` (Client) and `CustomerPagination`.
- `CustomerPagination` is a thin wrapper over the shared `RegistryPagination`.
- After a successful create, the toolbar navigates to the new customer detail
  page with a clean list state and calls `router.refresh()`.

## Detail UI

- `CustomerDetailLayout` is a Server Component that composes the identity summary,
  type sections, personal/business sections, related seller, lazy purchase
  history, registration date, and the "pending API" status/deletion cards.
- `CustomerPurchases` is the Client boundary for the purchase sub-tabs. Each
  sub-tab loads independently through authenticated Server Actions and keeps
  its own debounced search, loading, error, and incremental-limit state.
- `CustomerDetailTabs` is a Client Component with a scrollable tab list. Each
  editable tab owns its local state and submits to a dedicated Server Action;
  keep section editing decoupled and do not create a shared editing context.
- `CustomerTypeSections` handles person type (`1`/`2`) and customer type
  (`1`/`3`) toggles and is reused with `showPersonType`/`showCustomerType` to
  avoid duplicating the section.
- The image gallery is injected as a React node from the page (desktop sticky
  aside) and reused inside the forms (mobile). The PATH_IMAGEM viewer is a
  separate node.
- `RelatedSellerImage` and `CustomerImage` are presentational avatars with safe
  fallbacks.

## Image Gallery

The gallery lives under `[id]/_components/image-gallery` and integrates two
systems: the Assets API (source of truth for the gallery) and the legacy
`PATH_IMAGEM` column on `tbl_pessoa` (read by the list and detail UI).

- Entity type is the constant `CUSTOMER_GALLERY_ENTITY_TYPE`; the entity ID is
  the customer ID stringified.
- The gallery is capped at `CUSTOMER_GALLERY_LIMIT` (7) images and accepts only
  `CUSTOMER_GALLERY_ACCEPTED_MIME_TYPES` up to `CUSTOMER_GALLERY_MAX_FILE_SIZE`
  (2 MB).
- `getCustomerGalleryInitialState()` is wrapped in React `cache()` so the gallery
  server component and the images-list server component share a single read per
  request.
- `PATH_IMAGEM` synchronization is mandatory and happens on four flows:
  1. **First upload**: the first image is marked primary and its original URL is
     written to `PATH_IMAGEM` via `generalCallServiceApi.updateTableInlineField`.
  2. **Primary change** (`setPrimaryCustomerImageAction`): the newly primary
     image URL is written to `PATH_IMAGEM`.
  3. **Primary deletion** (`deleteCustomerImageAction`): the next candidate is
     promoted to primary and its URL is written to `PATH_IMAGEM`.
  4. **Manual update** (`updateCustomerImagePathFromPrimaryAction`): the current
     primary image's original URL is copied from a server-side gallery read; an
     identical `PATH_IMAGEM` value is not written again.
- If the original URL is empty or exceeds `CUSTOMER_IMAGE_PATH_MAX_LENGTH` (300),
  the `PATH_IMAGEM` write is skipped and the action returns a `warning`. The
  asset operation itself is not rolled back; treat the warning as a partial
  success.
- The last remaining image cannot be deleted; the action returns an error
  instead of leaving the gallery empty.
- Client components refresh state locally and call `router.refresh()` so the
  cached gallery read and the detail page re-render with consistent data.

When changing gallery behavior, keep the Assets API as the source of truth for
the list of images and `PATH_IMAGEM` as a denormalized pointer for legacy reads.

## Server Actions and Invariants

List mutations live in `_actions/customer-actions.ts`; gallery mutations live in
`[id]/_actions/customer-image-gallery-actions.ts`. All actions validate input
with Zod, re-resolve the authenticated context, re-confirm the current server
state, call the appropriate services, and run `revalidateCustomer()` (which
revalidates both `/dashboard/customer` and `/dashboard/customer/[id]`) when
needed.

- `createCustomerAction()`: validates the full create payload, derives the new
  ID from the stored procedure result (falling back to `recordId`), and rejects
  non-positive IDs.
- `updateCustomerGeneralAction()`: updates general identity and contact fields.
- `updateCustomerNotesAction()`: updates the free-form notes field.
- `updateCustomerPersonalAction()`: updates personal data (CPF, names, birth
  date) for pessoa física.
- `updateCustomerBusinessAction()`: updates business data (CNPJ, razão social,
  registrations) for pessoa jurídica.
- `updateCustomerAddressAction()`: updates address fields including city/state
  codes.
- `updateCustomerInternetAction()`: updates digital presence links.
- `updateCustomerRestrictionAction()`: toggles the restriction flag.
- `updateCustomerTypePersonAction()` and `updateCustomerTypeCustomerAction()`:
  change the person/customer type via inline endpoints.
- `uploadCustomerImageAction()`, `setPrimaryCustomerImageAction()`,
  `deleteCustomerImageAction()`, `updateCustomerImagePathFromPrimaryAction()`:
  gallery mutations and manual PATH synchronization described above.

Do not trust client-side gating alone. Direct Server Action calls can bypass
Client Components, so preserve the re-validation and authorization checks. Never
expose raw service responses, authenticated context, or internal errors to the
client; use `safeOperationMessage()` to surface only safe operation messages.

## Services

- `customer-general` (`src/services/api-main/customer-general`): list reads,
  detail bundle (`UICustomerDetailsBundle` with `customer` and optional
  `seller`), latest products, and customer creation.
- `customer-inline` (`src/services/api-main/customer-inline`): inline updates
  for notes, person type, and customer type.
- `customer-upd` (`src/services/api-main/customer-upd`): stored-procedure
  updates for general, personal, business, address, internet, and flags.
- `general-call` (`src/services/api-main/general-call`):
  `updateTableInlineField()` used to write `PATH_IMAGEM`, `RESTRICAO`,
  `INATIVO`, and `EMAIL_MKT` on `tbl_pessoa` keyed by `ID_TBL_PESSOA`.
- `api-assets` (`src/services/api-assets`): gallery read, upload, primary
  promotion, and deletion via `assetsApiService`.

Read the local `AGENTS.md` inside each service module before changing it.

## Pending API Features

The detail page intentionally disables flows that lack a safe API contract:

- **Delete**: the deletion zone renders a disabled destructive button. Do not
  implement deletion until the API exposes a secure, idempotent delete contract
  with referential safety.

Do not present these flows as functional and do not simulate them.

## Conventions for Changes

- Preserve `page.tsx` and `[id]/page.tsx` as Server Components. Keep
  `"use client"` limited to interactive state, events, browser APIs, navigation
  hooks, and form submission. Isolate it in the smallest possible component.
- Use the DTOs from `customer-dashboard-types.ts` and `image-gallery-types.ts`;
  do not send raw API entities to Client Components.
- Keep user-facing text in Brazilian Portuguese and code, comments, and
  technical documentation in US English.
- When adding a new list filter, update together: the type union, the parser in
  `search-params.ts`, `mapCustomerFiltersToApi()`, `countCustomerFilters()`,
  `buildCustomerUrl()`, the filter panel control, and the active-filter chips in
  `CustomerToolbar`.
- When adding a new sort option, align the option list, the validation set, and
  the `columnId` mapping in `mapCustomerFiltersToApi()`.
- When adding a new detail section, align the service payload, the Zod schema in
  `customer-actions.ts`, the DTO, and the form section in
  `tabs/customer-detail-tabs.tsx` and its individual tab components.
- Keep `PATH_IMAGEM` synchronization in sync with gallery primary changes; a
  new gallery mutation that changes the primary image must update `PATH_IMAGEM`
  through the existing helper.
- Use `createLogger()` for relevant errors and return generic, safe messages to
  the client.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Route, Server Action, cache behavior, or integration changes: also run
  `pnpm build` when viable.
- Visual or interactive changes: validate `/dashboard/customer` and
  `/dashboard/customer/[id]` in the development server (port set by the `PORT` env var) on desktop
  and mobile, including search, combined filters, active-filter removal,
  grid/list switching, pagination, empty and error states, create flow, section
  edits, gallery upload/primary/delete, and the `returnTo` back link.
- This project currently has no automated test command; do not invent one.
