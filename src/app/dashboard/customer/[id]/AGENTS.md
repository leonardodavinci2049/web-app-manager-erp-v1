# Customer Detail Route Agent Guide

This file complements the repository, dashboard, and `customer/AGENTS.md` guides
for `src/app/dashboard/customer/[id]`. It governs the `/dashboard/customer/[id]`
detail route: its page composition, the sectioned editing architecture, and the
customer image gallery subsystem.

The closest applicable guide specializes broader instructions; repository-level
rules still prevail in case of conflict. For list behavior, URL state, and
shared Server Actions, follow `../AGENTS.md`.

## Detail Page Composition

`page.tsx` is a Server Component that composes the whole detail screen. It
should stay free of client state and delegate all interactions to the colocated
Client Components.

1. Opt into request-time execution with `connection()` (Cache Components).
2. Await `params` and `searchParams` together with `Promise.all`.
3. Validate `id`: reject non-numeric (`/^\d+$/`), non-safe-integer, and
   non-positive values with `notFound()`.
4. Resolve `returnTo` with `getSafeCustomerReturnTo()` (imported from
   `../_components`). The back link only accepts same-origin paths whose
   pathname is exactly `/dashboard/customer`.
5. Obtain authenticated API context through `getAuthContext()`.
6. Fetch the customer bundle (`getCustomerById`).
7. Map `CustomerNotFoundError` to `notFound()`; rethrow other errors so the
   segment `error.tsx` boundary handles them.
8. Render the image gallery and the image list inside `<Suspense>` (fallback
   `CustomerImageGallerySkeleton`), passing them to `CustomerDetails` as React
   nodes.

The gallery and image nodes are built on the **page** (not inside
`CustomerDetails`) so the Suspense boundaries remain server-owned and the cached
gallery read is shared by both nodes through React `cache()`.

## Folder Structure

```text
[id]/
├── page.tsx                                  # Detail composition (Server)
├── loading.tsx                               # Detail segment skeleton
├── error.tsx                                 # Detail error boundary (Client)
├── not-found.tsx                             # Invalid/inaccessible customer
├── _actions/
│   ├── customer-image-gallery-actions.ts     # Gallery upload/primary/delete
│   └── customer-purchases-actions.ts         # Authenticated lazy purchase reads
└── _components/
    ├── customer-details.tsx                  # Top-level detail layout (Server)
    ├── customer-detail-forms.tsx             # Tabbed section editors (Client)
    ├── customer-identity-section.tsx         # General identity form (Client)
    ├── customer-person-business-sections.tsx # Person/business forms (Client)
    ├── customer-purchases.tsx                # Purchase tabs/search state (Client)
    ├── customer-purchases-lists.tsx          # Responsive tables/cards (Client)
    ├── customer-purchases-types.ts           # Minimal purchase DTOs/results
    ├── customer-type-sections.tsx            # Person/customer type toggles (Client)
    ├── related-seller-image.tsx              # Seller avatar (Client)
    └── image-gallery/
        ├── index.ts
        ├── image-gallery-constants.ts        # Entity type, limits, MIME, defaults
        ├── image-gallery-types.ts            # Gallery state + mutation result DTO
        ├── image-gallery-skeleton.tsx        # Suspense fallback (Server)
        ├── customer-image-gallery-server.tsx # Cached gallery read (Server)
        ├── customer-image-gallery-refresh.tsx# State holder + router.refresh (Client)
        ├── customer-image-gallery.tsx        # Upload + grid + zoom + actions (Client)
        └── customer-images-list.tsx          # PATH_IMAGEM viewer + gallery list (Client)
```

## Detail Data Flow

```
[id]/page.tsx (Server)
  ├── validates id -> notFound() on invalid
  ├── getAuthContext()
  ├── getCustomerById()          -> UICustomerDetailsBundle { customer, seller? }
  └── <CustomerDetails> (Server)
        ├── identity + type + person/business sections (Client forms)
        ├── related seller block
        ├── productsContent -> <CustomerPurchases customerId>
        └── <CustomerDetailForms> (Client)
              ├── tabbed section editors -> ../../_actions/customer-actions
              ├── purchase reads -> ../_actions/customer-purchases-actions
              └── imageContent / mobileImageGallery = <Suspense> nodes from page
```

The customer bundle (`UICustomerDetailsBundle`) carries `customer`
(`UICustomerDetail`) and an optional `seller` (`UISellerInfo`). Pass only these
UI DTOs to the components; never forward `apiContext`, raw entities, or errors.

## Sectioned Editing Architecture

Every editable section is an **independent** Client form with its own local
state, its own Zod-validated Server Action, and a `router.refresh()` on success.
There is no single mega-form and no shared editing context. Keep this
decoupling when adding sections.

The shared pattern (see `customer-detail-forms.tsx`, `customer-identity-section.tsx`,
`customer-person-business-sections.tsx`):

1. `toValues(customer)` derives local form state from the server DTO.
2. `setField()` updates one field and clears its error.
3. `runAction(section, actionPromise)` sets a `savingSection` flag, submits to
   the Server Action, maps `fieldErrors` to per-field messages, toasts the
   result, and calls `router.refresh()` on success.
4. A `SectionButton` shows a spinner while `saving` is true and disables all
   fields when any section is saving (`disabled={savingSection !== null}`).

Sections are spread across two components and two visual zones:

- **Top identity zone** (`CustomerDetails`, rendered above the tabs):
  - `CustomerIdentitySection`: name, phone, WhatsApp, email →
    `updateCustomerGeneralAction`.
  - `CustomerTypeSections` (first instance, `showCustomerType: false`): person
    type toggle → `updateCustomerTypePersonAction`.
  - `CustomerPersonBusinessSections`: renders **only** the section matching the
    current `personTypeId` (1 = pessoa física → personal; 2 = pessoa jurídica →
    business). Switching person type re-renders this block.
  - `CustomerTypeSections` (second instance, `showPersonType: false`): customer
    type toggle → `updateCustomerTypeCustomerAction`.
- **Tabbed zone** (`CustomerDetailForms`): notes, address, status (restriction),
  image, products (purchases), internet, miscellaneous (registration date),
  deletion.

Section-to-action mapping:

| Tab / section | Component | Server Action |
| --- | --- | --- |
| Identity (top) | `customer-identity-section` | `updateCustomerGeneralAction` |
| Person type | `customer-type-sections` | `updateCustomerTypePersonAction` |
| Personal / business | `customer-person-business-sections` | `updateCustomerPersonalAction` / `updateCustomerBusinessAction` |
| Customer type | `customer-type-sections` | `updateCustomerTypeCustomerAction` |
| Notes | `customer-detail-forms` | `updateCustomerNotesAction` |
| Address | `customer-detail-forms` | `updateCustomerAddressAction` |
| Internet | `customer-detail-forms` | `updateCustomerInternetAction` |
| Status (restriction) | `customer-detail-forms` | `updateCustomerRestrictionAction` |
| Status (active/inactive) | `customer-detail-forms` | `updateCustomerInactiveAction` |
| Status (email advertising) | `customer-detail-forms` | `updateCustomerEmailMarketingAction` |

Note: all these actions live in `../_actions/customer-actions.ts` (shared with
the list's create flow), not in this folder. Reuse them; do not duplicate
section logic here.

## Type Toggles and Person-Driven Rendering

- `CustomerTypeSections` is reused twice (once per toggle) via `showPersonType`
  and `showCustomerType` props. Each option button uses `aria-pressed`, disables
  itself when already selected, and disables all options while any toggle is
  saving.
- Person type values are `1` (física) and `2` (jurídica); customer type values
  are `1`–`3`. Keep these unions in sync with the action Zod schemas.
- `CustomerPersonBusinessSections` renders exactly one block based on
  `personTypeId`. When the user switches person type via the toggle, the
  `router.refresh()` causes the correct block to appear; the previously hidden
  fields are not submitted.

## Restriction Flow

The restriction tab reads `UICustomerDetail.restricted`, mapped from
`RESTRICAO === 1`, and presents "Sem restrição" / "Com restrição" as an
accessible two-option selector. The current option uses `aria-pressed`, is
visually highlighted and disabled, while selecting the other option asks for a
`window.confirm()` before sending only the boolean flag. After success,
`router.refresh()` reloads the persisted state.

## Image Gallery Subsystem

The gallery is the most complex part of this segment. It spans Server and Client
components and integrates two systems: the **Assets API** (source of truth for
the image set) and the legacy **`PATH_IMAGEM`** column on `tbl_pessoa`
(denormalized pointer read by the list and detail avatars).

### Components and responsibilities

- `customer-image-gallery-server.tsx`: exports `getCustomerGalleryInitialState`,
  wrapped in React `cache()`. Reads the Assets API, classifies the result into
  `ready` / `empty` / `error`, sorts images (primary first, then `displayOrder`,
  then `uploadedAt` desc), and drops entries without an original URL. This
  cached function is shared by the gallery node and the images-list node so the
  Assets API is hit once per request.
- `customer-image-gallery-refresh.tsx`: Client state holder. Owns `images`,
  `totalImages`, and a `selectionRequest` (`{ imageId, version }`). Bumps the
  version on every external change so the inner gallery re-syncs the selected
  image, and triggers `router.refresh()` after mutations.
- `customer-image-gallery.tsx`: the interactive gallery. Drag-and-drop + file
  picker upload, thumbnail grid, primary promotion, deletion (with confirmation),
  zoom dialog (keyboard-navigable), per-image error fallback to
  `DEFAULT_CUSTOMER_IMAGE_URL`, and an `aria-live` status region for screen
  readers.
- `customer-images-list.tsx`: read-only viewer. Shows the current `PATH_IMAGEM`
  value and the Assets API image list side by side, with a manual refresh
  button. The "Usar no PATH_IMAGEM" action is **disabled** here (pending a
  dedicated client API method); promotion happens automatically through the
  gallery actions instead.
- `image-gallery-skeleton.tsx`: Suspense fallback shared by both nodes.
- `image-gallery-constants.ts`: `CUSTOMER_GALLERY_ENTITY_TYPE` (`"CUSTOMER"`),
  `CUSTOMER_GALLERY_LIMIT` (7), `CUSTOMER_GALLERY_MAX_FILE_SIZE` (10 MB),
  accepted MIME types, `CUSTOMER_GALLERY_ACCEPT`, and
  `DEFAULT_CUSTOMER_IMAGE_URL`.
- `image-gallery-types.ts`: `CustomerGalleryImage`, the discriminated
  `CustomerGalleryInitialState`, and `CustomerGalleryMutationResult` (success
  with optional `preferredImageId`/`warning`, or failure with `error`).

### Limits, validation, and mutations

- Upload validates MIME type and size on both client and server. Files beyond
  `availableSlots` (`LIMIT - totalImages`) are rejected up front with a per-file
  reason; valid files are uploaded sequentially.
- The last remaining image cannot be deleted; the delete action and the client
  button both enforce this.
- All three mutations (`uploadCustomerImageAction`,
  `setPrimaryCustomerImageAction`, `deleteCustomerImageAction`) live in
  `_actions/customer-image-gallery-actions.ts`, re-resolve auth and ownership via
  `getAuthorizedCustomerContext()`, and re-read the gallery before mutating.

### PATH_IMAGEM synchronization

`PATH_IMAGEM` is kept in sync with the Assets API primary image on three flows,
using `generalCallServiceApi.updateTableInlineField` on `tbl_pessoa` keyed by
`ID_TBL_PESSOA` (field `PATH_IMAGEM`, max length 300):

1. **First upload**: the first image is marked primary and its original URL is
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
the Assets API. Keep the `isRemoteImage()` check and the per-image error
fallback (`DEFAULT_CUSTOMER_IMAGE_URL`) when adding new image surfaces.

## Server Actions

- Gallery actions live in `_actions/customer-image-gallery-actions.ts` (this
  folder). They validate with Zod (`CustomerIdSchema`, `AssetIdSchema`,
  `UploadSchema`), re-read the gallery to validate limits/ownership, and call
  `revalidatePath` for both `/dashboard/customer` and the detail path after
  `PATH_IMAGEM` writes.
- Section update actions live in `../_actions/customer-actions.ts` (shared with
  the list route). Every action calls `getExistingCustomer()` to re-confirm the
  customer exists under the current authenticated context before mutating, then
  `revalidateCustomer(id)` to refresh both routes.

Do not trust client-side gating. Direct Server Action calls bypass Client
Components, so the re-validation, ownership checks, and limit enforcement must
stay server-side. Use `safeOperationMessage()` to surface only safe operation
messages from stored-procedure errors; never leak raw responses or context.

## Cross-Folder Imports

This segment intentionally depends on the parent customer feature:

- Actions: `../_actions/customer-actions` for all section updates.
- Types: `../_components/types/customer-dashboard-types` for
  `CustomerActionResult` and shared unions.
- URL helpers: `../_components` (`getSafeCustomerReturnTo`,
  `buildCustomerUrl`, `buildCustomerDetailHref`).
- List avatar: `../_components/customer-image` is reused on the detail header.

Keep these imports pointing at the parent; do not fork shared types or actions
into this folder.

## Pending API Features

The detail page deliberately disables flows without a safe API contract:

- **Delete** (`deletionContent`): disabled destructive button in a danger zone.
- **Manual `PATH_IMAGEM` assignment** (`customer-images-list`): the per-image
  "Usar no PATH_IMAGEM" button is disabled. Promotion is automatic via gallery
  mutations only.

Do not present these as functional and do not simulate them. When a safe
contract arrives, wire the action, enable the control, and remove the
"Pendente de API" badge together.

## Conventions for Changes

- Preserve `page.tsx` as a Server Component. Keep `"use client"` limited to the
  interactive components (forms, toggles, gallery, avatars with error state).
- Keep section forms independent: each section owns its state and submits to one
  action. Do not introduce a shared editing context or a single save-all action.
- Status selectors map `RESTRICAO`, `INATIVO`, and `EMAIL_MKT` into boolean UI
  state. They write one field per Server Action through
  `generalCallServiceApi.updateTableInlineField`, using `FIELD_TYPE.BIGINT`,
  while fixing `tbl_pessoa`, `ID_TBL_PESSOA`, and the target field on the
  server.
- When adding a detail section, align together: the service payload, the Zod
  schema in `customer-actions.ts`, the `UICustomerDetail` field, the
  `toValues()` mapping, the form UI, and the tab entry (if applicable).
- When changing person-type logic, keep `CustomerPersonBusinessSections`
  rendering exactly one block and keep the type unions in sync with the action
  schemas.
- When changing gallery behavior, keep the Assets API as the source of truth for
  the image set and `PATH_IMAGEM` as a denormalized pointer. Any mutation that
  changes the primary image must update `PATH_IMAGEM` through the existing
  helper.
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
- Visual or interactive changes: validate `/dashboard/customer/[id]` in the
  development server (port set by the `PORT` env var) on desktop and mobile, including: valid and
  invalid IDs (`not-found.tsx`), the `returnTo` back link, each section edit
  (success, validation errors, network failure), person-type switching, type
  toggles, restriction confirm flows, gallery upload (drag-and-drop and
  picker), primary promotion, deletion (including last-image rejection), zoom
  navigation, and the `PATH_IMAGEM` viewer refresh.
- This project currently has no automated test command; do not invent one.
