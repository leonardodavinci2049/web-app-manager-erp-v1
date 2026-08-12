# Carrier Detail Route Agent Guide

This file complements the repository, dashboard, and `carriers/AGENTS.md` guides
for `src/app/dashboard/carriers/[id]`. It governs the `/dashboard/carriers/[id]`
detail route: its page composition, the single edit-form model, the deletion
flow, and the carrier image gallery subsystem.

The closest applicable guide specializes broader instructions; repository-level
rules still prevail in case of conflict. For list behavior, URL state, and the
shared create/update/delete actions, follow `../AGENTS.md`.

## Detail Page Composition

`page.tsx` is a Server Component that composes the whole detail screen. It stays
free of client state and delegates all interactions to the colocated and parent
Client Components. See `../AGENTS.md` ("Detail Page Responsibilities") for the
full numbered sequence; the key points:

1. `await connection()` then `await Promise.all([params, searchParams])`.
2. Validate `id` with `/^\d+$/` plus safe-integer/positive checks, calling
   `notFound()` on invalid input (rendering `not-found.tsx`).
3. Resolve `returnTo` with `getSafeCarrierReturnTo()` (same-origin, pathname
   exactly `/dashboard/carriers`).
4. `getAuthContext()`, then fetch the single carrier (`getCarrierById`).
5. Render `CarrierDetails` with the carrier DTO, `returnTo`, and two
   server-owned `<Suspense>` nodes: `imageGallery`
   (`CarrierImageGalleryServer`) and `imageContent` (`CarrierImagesListServer`).

The gallery and image nodes are built on the **page** so the Suspense boundaries
stay server-owned and the cached gallery read is shared by both nodes through
React `cache()`.

## Folder Structure

```text
[id]/
├── page.tsx                                  # Detail composition (Server)
├── loading.tsx                               # Detail skeleton (RegistryDetailLoading, variant="extended")
├── error.tsx                                 # Detail error boundary (Client)
├── not-found.tsx                             # Invalid/inaccessible carrier UI
├── _actions/
│   └── carrier-image-gallery-actions.ts      # Gallery upload/primary/delete
└── _components/
    └── image-gallery/
        ├── index.ts
        ├── image-gallery-constants.ts        # Entity type, limits, MIME, defaults
        ├── image-gallery-types.ts            # Gallery state + mutation result DTO
        ├── image-gallery-skeleton.tsx        # Suspense fallback (Server)
        ├── carrier-image-gallery-server.tsx  # Cached gallery read (Server)
        ├── carrier-image-gallery-refresh.tsx # State holder + router.refresh (Client)
        ├── carrier-image-gallery.tsx         # Upload + grid + zoom + actions (Client)
        ├── carrier-images-list-server.tsx    # Server wrapper for the PATH_IMAGEM viewer
        └── carrier-images-list.tsx           # PATH_IMAGEM viewer + gallery list (Client)
```

The top-level detail composition (`CarrierDetails`) and the shared form fields
(`CarrierFormFields`) live in the **parent** `_components/`, not here. The detail
segment owns only the gallery subsystem and the gallery actions.

## Detail Data Flow

```
[id]/page.tsx (Server)
  ├── validates id -> notFound() on invalid
  ├── getAuthContext()
  ├── getCarrierById() -> UICarrier | undefined   (null -> notFound())
  └── <CarrierDetails> (Client, from ../_components)
        ├── header (CarrierImage, name, status Badge, id, typePerson)
        ├── read-only cards (identity, contact, digital, address, PJ, PF)
        ├── edit form (CarrierFormFields) -> updateCarrierAction
        ├── "Cadastro" + "Status do cadastro" cards
        └── <Tabs>
              ├── Imagem   -> imageContent node (<Suspense>, CarrierImagesList)
              └── Exclusão -> delete confirm -> deleteCarrierAction
```

Pass only the `UICarrier` DTO to the components; never forward `apiContext`, raw
entities, or errors.

## `CarrierDetails` Is a Client Component

`CarrierDetails` is a **Client Component** and lives in the **parent**
`_components/`, re-exported from `_components/index.ts`. (The customer equivalent
is a Server Component in `[id]/_components`.) It owns form/edit state and drives
`router.refresh()` after edits and `router.replace(returnTo)` after deletion. The
page stays Server and hands it DTOs plus the two Suspense nodes. Do not "fix"
this asymmetry by moving it into `[id]/_components` or converting it to a Server
Component without a deliberate decision.

The detail body does **not** use `RegistryPageShell`; it uses a custom
`max-w-[1400px]` container. `loading.tsx` uses `RegistryDetailLoading` with
`variant="extended"` and a two-crumb breadcrumb.

## Single Mega-Form Editing

Editing is a **single mega-form**, the opposite of customer's sectioned editing.
There are no independent per-section forms, no `toValues()`/`setField()`/`runAction()`
helpers, no tabbed section editors, and no shared `savingSection` machinery.

- The detail form renders `<CarrierFormFields ... notesAreWriteOnly={false} />`
  inside one `<form>` with a single submit button. `handleSubmit` calls
  `updateCarrierAction({ carrierId, ...values })` and `router.refresh()` on
  success.
- `CarrierFormFields` is shared by both the create sheet and the detail edit
  form. It accepts `idPrefix` and `notesAreWriteOnly` (the detail form passes
  `false` because the API returns notes; the create sheet leaves the default).
  Sections: Identificação (name*, `typePersonId` select 0/1/2, responsibleName),
  Documentos e empresa (companyName, cpf, cnpj), Contatos e presença digital
  (phone, whatsapp, email, website), Imagem e observações (imagePath, notes with
  a 2000-char counter).
- `CarrierImage` is reused on the detail header with `viewMode="list"` and
  `key={carrier.imagePath}` so it swaps when the path changes.
- There are **no** person-type/customer-type toggles. `typePersonId` `0` is
  converted to `undefined` by `toPayload()` before sending, and both PJ and PF
  detail cards always render read-only regardless of type.

When adding an editable field, extend `CarrierFormValues`, the shared
`CarrierFormFields`, the `formSchema`/`updateSchema`, and `toPayload()`; do not
introduce a sectioned model.

## Deletion

Deletion is **enabled** (the inverse of the customer route, where it is
disabled). The "Excluir transportadora" button opens an `AlertDialog` confirm;
`handleDelete` calls `deleteCarrierAction(carrier.id)` and, on success, calls
`router.replace(returnTo)`. This flow is fully wired — not pending API.

## Image Gallery Subsystem

The gallery spans Server and Client components and integrates two systems: the
**Assets API** (source of truth for the image set) and the legacy
**`PATH_IMAGEM`** column on `tbl_transportadora` (denormalized pointer read by
the list and detail UI).

### Components and responsibilities

- `carrier-image-gallery-server.tsx`: exports `getCarrierGalleryInitialState`,
  wrapped in React `cache()`. Reads the Assets API, classifies the result into
  `ready` / `empty` (on `isNotFoundApiError`) / `error` (other), sorts (primary
  first, then `displayOrder`, then `uploadedAt` desc), drops entries without an
  `original` URL, and fills missing URL variants. Shared by the gallery node and
  the images-list node so the Assets API is hit once per request.
- `carrier-image-gallery-refresh.tsx`: Client state holder. Owns `images`,
  `totalImages`, and a `selectionRequest` (`{ imageId, version }`). Bumps the
  version on every external change and triggers `router.refresh()` after
  mutations.
- `carrier-image-gallery.tsx`: the interactive gallery. Drag-and-drop + file
  picker upload (validates MIME and size up front, slices to `availableSlots`),
  thumbnail grid, primary promotion, deletion (with confirmation), keyboard-
  navigable zoom dialog, per-image error fallback to `DEFAULT_CARRIER_IMAGE_URL`,
  `isRemoteImage()` → `unoptimized` on `next/image`, and an `aria-live` status
  region for screen readers.
- `carrier-images-list.tsx`: read-only viewer. Shows the current `PATH_IMAGEM`
  value (with "Abrir imagem em nova aba") and the Assets API image list side by
  side, with a manual "Atualizar" button that calls `router.refresh()` via a
  `useTransition`. There is **no** "Usar no PATH_IMAGEM" button at all;
  promotion is automatic via gallery actions only.
- `image-gallery-skeleton.tsx`: Suspense fallback shared by both nodes.
- `image-gallery-constants.ts`: `CARRIER_GALLERY_ENTITY_TYPE` (`"CARRIER"`),
  `CARRIER_GALLERY_LIMIT` (7), `CARRIER_GALLERY_MAX_FILE_SIZE` (10 MB), accepted
  MIME types, `CARRIER_GALLERY_ACCEPT`, and `DEFAULT_CARRIER_IMAGE_URL`.
- `image-gallery-types.ts`: `CarrierGalleryImage`, the discriminated
  `CarrierGalleryInitialState`, and `CarrierGalleryMutationResult`.

### Limits, validation, and mutations

- Upload validates MIME type and size on both client and server. Files beyond
  `availableSlots` (`LIMIT - totalImages`) are rejected up front with a per-file
  reason; valid files are uploaded sequentially.
- The last remaining image cannot be deleted; the delete action and the client
  button both enforce this.
- All three mutations (`uploadCarrierImageAction`, `setPrimaryCarrierImageAction`,
  `deleteCarrierImageAction`) live in `_actions/carrier-image-gallery-actions.ts`,
  re-resolve auth and ownership via `getAuthorizedCarrierContext()`, and re-read
  the gallery before mutating.

### PATH_IMAGEM synchronization

`PATH_IMAGEM` is kept in sync with the Assets API primary image on three flows,
writing through `generalCallServiceApi.updateTableInlineField` (table
`tbl_transportadora`, key `ID_TRANSPORTADORA`, field `PATH_IMAGEM`, max 300 chars,
`FIELD_TYPE.STRING`):

1. **First upload**: the first image is uploaded with `isPrimary: true` and
   `displayOrder: 1`, and its `original` URL is written to `PATH_IMAGEM`.
2. **Primary change**: the newly primary image URL is written to `PATH_IMAGEM`.
   If the image was already primary, the action still repairs `PATH_IMAGEM`.
3. **Primary deletion**: the next candidate (by sort order) is promoted via
   `assetsApiService.setPrimaryImage` and its URL is written to `PATH_IMAGEM`.

If the original URL is empty or exceeds 300 characters, the `PATH_IMAGEM` write
is skipped and the action returns `success: true` with a `warning`. The asset
operation is **not** rolled back; the warning is a partial-success signal
surfaced as a toast. Keep this behavior unless the API gains transactional
semantics.

### Remote images and `next/image`

Remote gallery URLs use `unoptimized` on `next/image` because they are served by
the Assets API. Keep the `isRemoteImage()` check and the per-image error fallback
(`DEFAULT_CARRIER_IMAGE_URL`) when adding new image surfaces.

## Server Actions

- Gallery actions live in `_actions/carrier-image-gallery-actions.ts` (this
  folder). They validate with Zod (`CarrierIdSchema`, `AssetIdSchema`,
  `UploadSchema`), re-read the gallery to validate limits/ownership, and call
  `revalidatePath` for both `/dashboard/carriers` and the detail path after
  `PATH_IMAGEM` writes (inside the `updateCarrierImagePath` helper).
- Section update and delete actions live in `../_actions/carrier-actions.ts`
  (shared with the list route). `updateCarrierAction` and `deleteCarrierAction`
  re-confirm the carrier exists via `getExistingCarrier()` before mutating, then
  call `revalidateCarrier(carrierId)` to refresh both routes.

Do not trust client-side gating. Direct Server Action calls bypass Client
Components, so the re-validation, ownership checks, and limit enforcement must
stay server-side. Use `safeOperationMessage()` to surface only safe operation
messages from stored-procedure errors; never leak raw responses or context.

## Cross-Folder Imports

This segment intentionally depends on the parent carrier feature:

- Actions (create/update/delete): imported via the absolute alias
  `@/app/dashboard/carriers/_actions/carrier-actions` by `CarrierDetails`. The
  gallery actions in `_actions/` here are local.
- URL helpers + composition: `[id]/page.tsx` imports `{ CarrierDetails,
  getSafeCarrierReturnTo }` from `../_components`.
- Types: `CarrierFormValues`, `CarrierActionResult` come from
  `../_components/types/carrier-dashboard-types` (re-exported via
  `_components/index.ts`).
- Service: both pages and all actions import from `@/services/api-main/carrier`.

Do not fork these into `[id]/`; keep them pointing at the parent.

## Pending API Features

- **Status change (Activate/Inactivate)** (`"Status do cadastro"` card): a
  disabled button labeled "Alterar status — Pendente de API". Only the gallery
  and the unified edit form are mutable today. Do not wire status mutation until
  a safe contract exists.
- **Manual `PATH_IMAGEM` assignment** (`CarrierImagesList`): there is no such
  button at all. Promotion is automatic via gallery mutations only.

Do not present these as functional and do not simulate them. When a safe status
contract arrives, wire the action, enable the control, and remove the "Pendente
de API" badge together.

## Conventions for Changes

- Preserve `page.tsx` as a Server Component. Keep `"use client"` limited to the
  interactive components (`CarrierDetails`, `CarrierCreateSheet`,
  `CarrierFormFields`, `CarrierImage`, the gallery clients, `CarrierImagesList`).
- Keep the single mega-form; do not introduce a shared sectioned context or
  per-section actions.
- When adding a new editable field, align together: `CarrierFormValues`, the
  shared `CarrierFormFields`, the `formSchema`/`updateSchema` in
  `carrier-actions.ts`, the `toPayload()` mapping, the `UICarrier` field and
  `transformCarrierDetail`, and (if read-only) the relevant `DetailField` entries
  in `CarrierDetails`.
- When changing gallery behavior, keep the Assets API as the source of truth for
  the image set and `PATH_IMAGEM` as a denormalized pointer. Any mutation that
  changes the primary image must update `PATH_IMAGEM` through
  `updateCarrierImagePath()` with the 300-char guard.
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
- Visual or interactive changes: validate `/dashboard/carriers/[id]` in the
  development server (port set by the `PORT` env var) on desktop and mobile, including: valid and
  invalid IDs (`not-found.tsx`), the `returnTo` back link, the single edit form
  (success, validation errors, network failure), delete confirm + redirect to
  `returnTo`, gallery upload (drag-and-drop and picker), primary promotion,
  deletion (including last-image rejection), zoom navigation, and the
  `PATH_IMAGEM` viewer refresh.
- This project currently has no automated test command; do not invent one.
