# Seller Detail Route Agent Guide

This file complements the repository, dashboard, and `seller/AGENTS.md` guides
for `src/app/dashboard/seller/[id]`. It governs the `/dashboard/seller/[id]`
detail route: its sectioned editing composition, the sales tab, the route-local
Server Actions, and the seller image gallery subsystem.

The closest applicable guide specializes broader instructions; repository-level
rules still prevail in case of conflict. For list behavior, URL state, and the
list page, follow `../AGENTS.md`.

## Detail Page Composition

`page.tsx` is a Server Component that composes the whole detail screen. It
should stay free of client state and delegate all interactions to the colocated
Client Components.

1. Opt into request-time execution with `connection()` (Cache Components).
2. Await `params` and `searchParams` together with `Promise.all`.
3. Validate `id`: reject non-numeric (`/^\d+$/`), non-safe-integer, and
   non-positive values with `notFound()`.
4. Resolve `returnTo` with `getSafeSellerReturnTo()` (imported from
   `../_components`). The back link only accepts same-origin paths whose
   pathname is exactly `/dashboard/seller`.
5. Obtain authenticated API context through `getAuthContext()`.
6. Fetch the seller with `getSellerById()`.
7. Map `SellerNotFoundError` to `notFound()` and rethrow other errors so the
   segment `error.tsx` boundary handles them. Guard a null return with
   `if (!seller) notFound()`.
8. Render the image gallery and the image list inside `<Suspense>` (fallback
   `SellerImageGallerySkeleton`), passing them to `SellerDetailLayout` as React
   nodes.

The gallery and image nodes are built on the **page** (not inside
`SellerDetailLayout`) so the Suspense boundaries remain server-owned and the
cached gallery read is shared by both nodes through React `cache()`.

## Folder Structure

```text
[id]/
├── AGENTS.md
├── page.tsx                                  # Detail composition (Server)
├── loading.tsx                               # Detail segment skeleton
├── error.tsx                                 # Detail error boundary (Client)
├── not-found.tsx                             # Invalid/inaccessible seller UI
├── _actions/
│   ├── seller-actions.ts                     # Route-local section update actions
│   ├── seller-sales-actions.ts               # Authenticated lazy order reads
│   └── seller-image-gallery-actions.ts       # Gallery upload/primary/delete
└── _components/
    ├── seller-detail-layout.tsx              # Top-level detail layout (Server)
    ├── overview/                             # First-fold seller overview
    │   ├── seller-head-data-section.tsx      # Heading via shared DetailRecordHeading (image only below lg)
    │   ├── seller-identity-section.tsx       # Client: form nome/telefone/whatsapp/email
    │   ├── seller-person-type-section.tsx    # Client: person type toggle (1/2)
    │   └── seller-person-business-sections.tsx # Client: PF or PJ form
    ├── tabs/                                 # Second-fold tabs/content
    │   ├── seller-detail-tabs.tsx            # Client: <Tabs> with 8 tabs (shared list/trigger/image-tab shells)
    │   ├── seller-address-tab.tsx            # Client: address form + summary
    │   ├── seller-deletion-tab.tsx           # Disabled danger zone (shared DetailDeletionCard frame)
    │   ├── seller-field.tsx                  # Server (presentational): Input+Label+error
    │   ├── seller-internet-tab.tsx           # Client: digital presence form
    │   ├── seller-notes-tab.tsx              # Client: notes textarea + copy
    │   ├── seller-registration-tab.tsx       # Server: read-only dates
    │   ├── seller-section-action.ts          # Client: useSellerSectionAction() hook
    │   ├── seller-section-button.tsx         # Server (presentational): save button
    │   └── seller-status-tab.tsx             # Client: 3 selectors (frete, ativo, mkt)
    ├── sales/                                # Sales tab state
    │   ├── seller-sales.tsx                  # Client: sub-tabs + debounced search + lazy load
    │   ├── seller-sales-lists.tsx            # Client: orders table + mobile cards
    │   ├── seller-sales-types.ts             # Order DTO + result type
    │   └── seller-sold-products-tab.tsx      # Prepared, unavailable products sub-tab
    ├── types/
    │   └── seller-detail-types.ts            # SellerActionResult
    └── image-gallery/                        # Gallery subsystem (unchanged)
```

Structural shells (grid/back link, record heading, tab list/triggers, image
tab composition, deletion frame, detail skeleton) come from
`@/app/dashboard/_components/detail-page` and must not be forked here. Tab
order: **Anotações**, Endereço, Status, **Imagem**, Vendas, Internet, Diversos,
**Exclusão** (always last). The header avatar renders only below `lg`; on
desktop the sticky gallery is the single image surface.

## Detail Data Flow

```
[id]/page.tsx (Server)
  ├── validates id -> notFound() on invalid
  ├── getAuthContext()
  ├── getSellerById()          -> UISellerDetail | undefined
  └── <SellerDetailLayout> (Server)
        ├── identity + person type + person/business sections (Client forms)
        └── <SellerDetailTabs> (Client)
              ├── independent tab editors -> ../_actions/seller-actions
              ├── order reads -> ../_actions/seller-sales-actions
              └── imageContent / mobileImageGallery = <Suspense> nodes from page
```

Pass only the `UISellerDetail` DTO to the components; never forward `apiContext`,
raw entities, or errors.

## Sectioned Editing Architecture

Every editable section is an **independent** Client form with its own local
state, its own Zod-validated Server Action, and a `router.refresh()` on success.
There is no single mega-form and no shared editing context. Keep this
decoupling when adding sections.

The shared pattern:

1. `toValues(seller)` derives local form state from the server DTO (normalizing
   the optional DTO fields with `?? ""`).
2. `setField()` / `clearError()` updates one field and clears its error.
3. `runAction(actionPromise)` (or the `useSellerSectionAction()` hook) sets a
   `saving` flag, submits to the Server Action, maps `fieldErrors` to
   per-field messages, toasts the result, and calls `router.refresh()` on
   success.
4. `SellerSectionButton` shows a spinner while saving; status selectors disable
   all buttons while `savingSection !== null`.

Sections and actions (all actions live in `_actions/seller-actions.ts`, exclusive
to this route — do **not** reuse the customer Server Actions):

| Tab / section | Component | Server Action | Service |
| --- | --- | --- | --- |
| Identity (top) | `overview/seller-identity-section` | `updateSellerGeneralAction` | `customerUpdServiceApi.updateGeneral` |
| Person type | `overview/seller-person-type-section` | `updateSellerTypePersonAction` | `customerInlineServiceApi.updateTypePerson` |
| Personal / business | `overview/seller-person-business-sections` | `updateSellerPersonalAction` / `updateSellerBusinessAction` | `customerUpdServiceApi.updatePersonal` / `updateBusiness` |
| Notes | `tabs/seller-notes-tab` | `updateSellerNotesAction` | `customerInlineServiceApi.updateNotes` |
| Address | `tabs/seller-address-tab` | `updateSellerAddressAction` | `customerUpdServiceApi.updateAddress` |
| Internet | `tabs/seller-internet-tab` | `updateSellerInternetAction` | `customerUpdServiceApi.updateInternet` |
| Status (shipping) | `tabs/seller-status-tab` | `updateSellerFreeShippingAction` | `generalCallServiceApi.updateTableInlineField` (`FLAG_FRETE_GRATIS`) |
| Status (active/inactive) | `tabs/seller-status-tab` | `updateSellerInactiveAction` | `generalCallServiceApi.updateTableInlineField` (`INATIVO`) |
| Status (e-mail marketing) | `tabs/seller-status-tab` | `updateSellerEmailMarketingAction` | `generalCallServiceApi.updateTableInlineField` (`EMAIL_MKT`) |

Sellers are people records in the shared `tbl_pessoa` table, so the section
updates reuse the customer update services with `pe_customer_id` set to the
seller's pessoa ID. The status writes fix `tbl_pessoa`, `ID_TBL_PESSOA`, the
target field, and the `FIELD_TYPE` on the server; the client only sends the
seller ID and the section values.

### Out-of-scope sections

The detail intentionally does **not** render or mutate: customer type, related
seller, customer approval (`APROVADO`), commercial restriction (`RESTRICAO`),
or warranties. Do not add actions for them.

### Type Toggles and Person-Driven Rendering

- Person type values are `1` (física) and `2` (jurídica); keep the union in sync
  with the action Zod schema. Option buttons use `aria-pressed`, disable
  themselves when already selected, and disable all options while saving.
- `SellerPersonBusinessSections` renders exactly one block based on
  `personTypeId`. Switching person type re-renders this block after
  `router.refresh()`; the previously hidden fields are not submitted.

## Sales Tab (Vendas)

`SellerSales` (Client) owns two sub-tabs, mirroring the customer purchases
pattern without coupling to it:

- **Pedidos** (functional): numeric search (order ID) debounced 500 ms,
  incremental limit (initial 20, +20 per "Carregar mais", `hasMore` from the
  result), stale-response protection via a request id ref, and loading / error /
  empty / retry states (`SellerOrdersList`, desktop table + mobile cards). Every
  request goes through `findSellerOrdersAction`, which calls
  `orderReportsServiceApi.orderFindCustomerAll()` with `pe_customer_id: 0` and
  `pe_seller_id` = the seller ID — orders are **always** scoped to the selected
  seller. The date window is the last 2 years (+1 day) and
  `pe_order_status_id` is 14, matching the customer orders read.
- **Produtos vendidos** (prepared): `SellerSoldProductsTab` renders an explicit
  unavailability notice. It performs **no** query and shows **no** product data,
  because the product contract lacks a seller filter; displaying unfiltered
  data would leak other sellers' sales. When the specific contract exists, wire
  a route-local read action and the list here.

There is no warranties sub-tab for sellers.

## Image Gallery Subsystem

The gallery is unchanged and integrates two systems: the **Assets API** (source
of truth for the image set) and the legacy **`PATH_IMAGEM`** column on
`tbl_pessoa` (denormalized pointer read by the list and detail UI). Sellers are
people records in the shared `tbl_pessoa` table.

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
  `SELLER_GALLERY_LIMIT` (7), `SELLER_GALLERY_MAX_FILE_SIZE` (2 MB), accepted
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

### Gallery placement

The gallery renders in the first fold (sticky aside) on `lg+` screens and inside
the **Imagem** tab on smaller screens, without duplicating the Assets API read
(both nodes share the `cache()`-wrapped `getSellerGalleryInitialState()`).

## Server Actions

- Section update actions live in `_actions/seller-actions.ts` (this folder,
  exclusive to the seller route). Every action calls `getExistingSeller()` to
  re-confirm the seller exists, is accessible, and is still flagged as a seller
  (`isSeller`) under the current authenticated context before mutating, then
  `revalidateSeller(id)` to refresh both `/dashboard/seller` and the detail path.
  Use `safeOperationMessage()` to surface only safe stored-procedure messages;
  log internals with `createLogger("SellerDetailActions")`.
- Order reads live in `_actions/seller-sales-actions.ts`
  (`findSellerOrdersAction`), re-confirming the seller on every call.
- Gallery mutations live in `_actions/seller-image-gallery-actions.ts`,
  validating with Zod (`SellerIdSchema`, `AssetIdSchema`, `UploadSchema`),
  re-reading the gallery to validate limits/ownership, and revalidating paths
  inside the `updateSellerImagePath` helper.

Do not trust client-side gating. Direct Server Action calls bypass Client
Components, so the re-validation, ownership checks, and limit enforcement must
stay server-side.

## Cross-Folder Imports

This segment intentionally depends on the parent seller feature:

- URL helpers: `[id]/page.tsx` imports `getSafeSellerReturnTo` from
  `../_components`.
- List avatar: `overview/seller-head-data-section.tsx` reuses `SellerImage`
  from `../_components` for the detail header.
- Service: both pages and all actions import from `@/services/api-main/seller`.

Keep these imports pointing at the parent; do not fork shared helpers into this
folder. Unlike the customer route, the seller section actions are **route-local**
(`[id]/_actions/`), not shared with the list.

## Pending API Features

The detail page deliberately disables flows without a safe API contract:

- **Delete** (`SellerDeletionTab`): disabled destructive button in a danger zone
  with a "Pendente de API" badge.
- **Produtos vendidos** (`SellerSoldProductsTab`): explicitly unavailable until
  a contract with a seller filter exists; no query is performed.
- **Create**: handled on the list route (no create sheet).

Do not present these as functional and do not simulate them. When safe contracts
arrive, wire the action, enable the control, and remove the "Pendente de API"
badges together.

## Conventions for Changes

- Preserve `page.tsx` as a Server Component. Keep `"use client"` limited to the
  interactive components (forms, toggles, gallery, avatar with error state).
- Keep section forms independent: each section owns its state and submits to one
  action. Do not introduce a shared editing context or a single save-all action.
- Status selectors map `INATIVO`, `EMAIL_MKT`, and `FLAG_FRETE_GRATIS` into
  boolean UI state (DTO optional booleans normalized with `?? false`). They
  write one field per Server Action through
  `generalCallServiceApi.updateTableInlineField`, using `FIELD_TYPE.BIGINT`,
  while fixing `tbl_pessoa`, `ID_TBL_PESSOA`, and the target field on the
  server. Each change asks for a `window.confirm()` first.
- When adding a detail section, align together: the `UISellerDetail` field, the
  `transformSellerManagerDetail()` mapping, the Zod schema and action in
  `seller-actions.ts`, the `toValues()` mapping, the form UI, and the tab entry
  (if applicable).
- When changing person-type logic, keep `SellerPersonBusinessSections` rendering
  exactly one block and keep the type union in sync with the action schema.
- When changing gallery behavior, keep the Assets API as the source of truth for
  the image set and `PATH_IMAGEM` as a denormalized pointer. Any mutation that
  changes the primary image must update `PATH_IMAGEM` through the existing
  helper with the 300-char guard.
- Preserve accessibility: `aria-pressed` on toggles and gallery thumbnails,
  `aria-live` status regions, keyboard navigation in the zoom dialog, and
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
  invalid IDs (`not-found.tsx`), the `returnTo` back link, each section edit
  (success, validation errors, network failure), person-type switching, the
  status confirm flows, the "Vendas" sub-tabs (orders scoped to the seller,
  search, load more, empty/error states; sold products unavailable), gallery
  upload (drag-and-drop and picker), primary promotion, deletion (including
  last-image rejection), zoom navigation, and the `PATH_IMAGEM` viewer refresh.
- This project currently has no automated test command; do not invent one.
