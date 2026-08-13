# Product Detail Route Agent Guide

This file complements the repository, dashboard, and `product/AGENTS.md` guides for
`src/app/dashboard/product/[id]`. It governs the `/dashboard/product/[id]` detail
route: its page composition, the inline/tabbed editing architecture, the category
and brand/type dialogs, and the product image gallery subsystem.

The closest applicable guide specializes broader instructions; repository-level
rules still prevail in case of conflict. For the redirect, the create flow, the
cross-cutting anomalies (action locations and logger aliases), and the shared
services, follow `../AGENTS.md`.

## Detail Page Composition

`page.tsx` is a Server Component. It renders one outer `<Suspense
fallback={<ProductDetailLayoutSkeleton/>}>` wrapping a `ProductDetailsPageContent`
async component, which:

1. Calls `await connection()` once in `page.tsx`; the colocated `loading.tsx`
   protects this request-time access, so the content component does not repeat
   it.
2. `await Promise.all([params, searchParams])`.
3. Validate `id` with the local Zod `ProductPageParamsSchema` (`/^\d+$/` →
   `Number`); on failure `logger.error` + `notFound()`.
4. Resolve `returnTo` with `getSafeProductReturnTo()` (imported from
   `@/app/dashboard/product/_components`). Accepts same-origin `/dashboard/product`,
   `/dashboard/brand/<id>` (regex `/^\/dashboard\/brand\/\d+$/`), or `/dashboard`;
   falls back to `/dashboard/product`. The breadcrumb "Catálogo" crumb uses
   `returnTo` when it starts with `/dashboard/product` (preserving filters).
5. `getAuthContext()` → `apiContext`.
6. Call `getProductManagerById(productId, { ...apiContext, pe_type_business: 1 })`
   with `.catch()` → `undefined` on error (logs via
   `createLogger("ProductDetailsPageV2")`). On `!result` → `logger.warn` +
   `notFound()`. Destructure `{ product, relatedCategories }`.
7. Render `SiteHeaderWithBreadcrumb` (title "Detalhes do Produto") and
   `ProductDetailLayout` (which renders the gallery + `ProductOverview` +
   `ProductDetailTabs`, with the PATH_IMAGEM selector injected as
   `imagePathContent`).

There is **no per-node `<Suspense>`** for the gallery vs. PATH_IMAGEM selector (unlike
customer/brand). The whole content sits under one outer Suspense; the gallery
renders inline inside `ProductDetailLayout` without its own boundary.

## Folder Structure

```text
[id]/
├── AGENTS.md
├── page.tsx                                    # Server: id validation + getProductManagerById + Suspense
├── loading.tsx                                 # Detail skeleton (ProductDetailLayoutSkeleton)
├── not-found.tsx                               # Client: "Produto Não Encontrado" (NO error.tsx)
├── _actions/
│   └── product-image-gallery-actions.ts        # upload/setPrimary/delete (colocated, Zod)
└── _components/
    ├── product-detail-layout.tsx                # Server: route-detail composition
    ├── product-detail-layout-skeleton.tsx       # Loading structure
    ├── overview/                                # First-fold product summary
    │   ├── product-overview.tsx                 # Derives price/stock view data and composes summary
    │   ├── product-identity-section.tsx         # Image, name, ID, SKU, and model
    │   ├── product-name-editor.tsx              # Client -> updateProductName
    │   ├── product-pricing-card.tsx             # Client -> updateProductPrice (reload)
    │   ├── product-stock-card.tsx               # Client -> updateProductStock (reload)
    │   ├── product-categories-card.tsx           # Category relationships
    │   ├── product-category-add-dialog.tsx      # Client -> createTaxonomyRelationship
    │   ├── product-category-remove-button.tsx   # Client -> deleteTaxonomyRelationship
    │   └── product-sales-description-editor.tsx # Client -> updateProductShortDescription
    ├── tabs/                                    # Second-fold tab navigation and content
    │   ├── product-detail-tabs.tsx              # Client: six-tab orchestrator
    │   ├── product-description-tab.tsx          # Client HTML editor
    │   ├── product-images-tab.tsx               # Mobile gallery + PATH_IMAGEM selector slot
    │   ├── product-specifications-tab.tsx       # General, characteristics, and tax cards
    │   ├── product-technical-tab.tsx            # Type, brand, supplier, and flags
    │   ├── product-metadata-tab.tsx             # Read-only SEO and dates
    │   ├── product-deletion-tab.tsx             # Disabled pending-API state
    │   ├── product-general-data-card.tsx
    │   ├── product-characteristics-card.tsx
    │   ├── product-tax-information-card.tsx
    │   ├── product-flags-card.tsx
    │   ├── product-brand-change-dialog.tsx
    │   └── product-type-change-dialog.tsx
    └── image-gallery/                           # Assets API + PATH_IMAGEM subsystem
        ├── index.ts
        ├── image-gallery-constants.ts          # PRODUCT_GALLERY_* constants
        ├── image-gallery-types.ts              # ProductGalleryImage, InitialState, MutationResult
        ├── image-gallery-skeleton.tsx          # ProductImageGallerySkeleton
        ├── product-image-gallery-server.tsx    # getProductGalleryInitialState (cache()) + Server wrapper
        ├── product-image-gallery-refresh.tsx   # Client state holder + router.refresh()
        ├── product-image-gallery.tsx           # Client: upload/grid/primary/delete/zoom
        ├── product-image-path-selector-server.tsx # Cached gallery adapter
        └── product-image-path-selector.tsx     # Client: PATH_IMAGEM viewer and selector
```

Detail-only components stay under `[id]/_components`. Files use kebab-case,
component exports use PascalCase, and folders group components by page region or
subsystem rather than by visual primitive. Keep internal imports explicit in
`overview/` and `tabs/`; `image-gallery/index.ts` is the subsystem public entry.

## Detail Data Flow

```
[id]/page.tsx (Server, one outer <Suspense>)
  └── ProductDetailsPageContent
        ├── validates id -> notFound() on invalid
        ├── getSafeProductReturnTo()            # from @/app/dashboard/product/_components
        ├── getAuthContext()
        ├── getProductManagerById(id, { pe_type_business: 1 })  -> { product, relatedCategories }
        └── <ProductDetailLayout> (Server)
              ├── inline back-to-catalog link (returnTo)
              ├── left aside  -> ProductImageGalleryServer (inline, no own Suspense)
              ├── right column -> ProductOverview
              │     ├── ProductIdentitySection / ProductNameEditor
              │     ├── ProductPricingCard / ProductStockCard
              │     ├── ProductCategoriesCard (+ add/remove controls)
              │     └── ProductSalesDescriptionEditor
              └── <ProductDetailTabs> (Client)
                    ├── description -> ProductDescriptionTab
                    ├── images      -> ProductImagesTab + ProductImagePathSelector
                    ├── specs       -> ProductSpecificationsTab
                    ├── technical   -> ProductTechnicalTab
                    ├── metadata    -> ProductMetadataTab
                    └── deletion    -> ProductDeletionTab
```

Pass only `UIProductManager` and `UIProductManagerRelatedCategory[]` DTOs to the
components; never forward `apiContext`, sessions, tokens, or raw entities.

## Editing Architecture

Editing is a set of **independent inline editors and tab cards**, each submitting
to its own global Server Action (in `src/app/actions/`). There is no single
mega-form and no sectioned form with shared state. `ProductDetailTabs` (Client)
owns `const router = useRouter()` and a `handleDataChange = () => router.refresh()`
passed to the technical card.

### Inline editors

- `ProductNameEditor` — double-click or pencil to edit; `MAX_CHARACTERS = 200`;
  Ctrl+Enter saves, Esc cancels; → `updateProductName`.
- `ProductSalesDescriptionEditor` — `MAX_CHARACTERS = 1000`; → `updateProductShortDescription`.
- `ProductDescriptionTab` — `MAX_CHARACTERS = 10000`; `DOMPurify.sanitize` on
  render and before save; renders via `dangerouslySetInnerHTML` (trusted admin
  content); → `updateProductDescription` in **`action-product-description`**
  (there is a same-named function in `action-product-updates` that this UI does
  **not** use).
- `ProductGeneralDataCard` / `ProductCharacteristicsCard` / `ProductTaxInformationCard`
  — pencil/check/X inline edit; Enter saves, Esc cancels. Characteristics converts
  `warrantyDays → warrantyMonths = Math.floor(days/30)`.

### Flags (`ProductFlagsCard`)

Nine `Switch`es with **optimistic update + rollback**; the rule is `1 → ON`,
`else → OFF`. **Gotcha:** `ProductTechnicalTab` hardcodes most flags to `0`
at the call site — only `destaque`, `promocao`, `servico`, and `importado` are
derived from the product. `controleFisico`, `controlarEstoque`, `consignado`,
`websiteOff`, and `inativo` are always sent as `0`, so the card does not reflect
current values for those. Wire real state before relying on them.

### Pricing and Stock (`window.location.reload()`)

`ProductPricingCard` (Brazilian comma decimal, `MIN_PRICE = 0.1`, max 2 000 000)
and `ProductStockCard` (`MIN_STOCK = 0`, `MAX_STOCK = 1 000 000`) refresh the UI
with **`window.location.reload()`** after success — a deviation from the
`router.refresh()` pattern used elsewhere. Their actions revalidate nothing. If
you switch them to `router.refresh()`, remove the reload and add `revalidatePath`
to the actions.

### Tabs (`ProductDetailTabs`, `defaultValue="description"`)

| Tab | Label | Content | Submits to |
| --- | --- | --- | --- |
| `description` | Descrição | `ProductDescriptionTab` | `updateProductDescription` (`action-product-description`) |
| `images` | Imagens | `ProductImagesTab` + `ProductImagePathSelector` | `updateProductImagePath` ("Usar no PATH_IMAGEM") |
| `specifications` | Especificações | `ProductSpecificationsTab` | `updateProductGeneral` / `…Characteristics` / `…TaxValues` (`action-products`) |
| `technical` | Dados Técnicos | `ProductTechnicalTab` | `updateProductFlags` / `updateProductType` / `updateProductBrand` |
| `metadata` | Metadados | `ProductMetadataTab` (read-only) | none |
| `deletion` | Exclusão | `ProductDeletionTab` (disabled pending state) | none (pending) |

### Dialogs

- `ProductCategoryAddDialog` — calls `loadCategoriesMenuAction()` (from
  `@/app/actions/action-categories`) on open, renders a searchable
  `UITaxonomyMenuItem` list, and on pick calls `createTaxonomyRelationship(categoryId,
  productId)` (from `@/app/actions/action-taxonomy`). It does **not** call
  `router.refresh()`; the UI updates via the action's `revalidatePath`.
- `ProductCategoryRemoveButton` — confirm → `deleteTaxonomyRelationship(taxonomyId,
  productId)`.
- `ProductBrandChangeDialog` — `useBrands()` (from `@/hooks/use-brands`, which
  calls `loadBrandsListAction`) → on pick `updateProductBrand(productId, brandId)`
  (from `@/app/actions/action-product-updates`).
- `ProductTypeChangeDialog` — `usePtypes()` (from `@/hooks/use-ptypes`) → on pick
  `updateProductType(productId, typeId)`.

## Image Gallery Subsystem

The gallery lives under `_components/image-gallery/` and integrates two systems:
the **Assets API** (source of truth for the image set) and the legacy
**`PATH_IMAGEM`** field (denormalized pointer read by the list and detail UI).

- Constants: `PRODUCT_GALLERY_ENTITY_TYPE` (`"PRODUCT"`), `PRODUCT_GALLERY_LIMIT`
  (7), `PRODUCT_GALLERY_MAX_FILE_SIZE` (10 MB), accepted MIME types
  (jpeg/png/gif/webp), `DEFAULT_PRODUCT_IMAGE_URL` (`/images/product/no-image.jpeg`).
- `getProductGalleryInitialState` is wrapped in React `cache()` (the `import { cache }
  from "react"` sits at the **bottom** of `product-image-gallery-server.tsx` —
  unusual placement, works via ES module hoisting). Shared by the gallery node and
  the PATH_IMAGEM selector node so the Assets API is hit once per request.
- `ProductImageGallery` (Client): drag-drop + file picker upload (sequential,
  per-file MIME/size validation, rejects beyond `availableSlots`), thumbnail grid,
  primary promotion (confirm), delete (confirm, blocked when `images.length <= 1`),
  keyboard-navigable zoom dialog (ArrowLeft/Right), per-image error fallback to
  `DEFAULT_PRODUCT_IMAGE_URL`, `aria-live` status region, and `unoptimized` on
  remote `next/image` via `isRemoteImage()`.
- `ProductImagePathSelector` (Client, named export): the "Imagens" tab. Shows the
  current `PATH_IMAGEM` value and the Assets API list side by side, a manual
  "Atualizar" button, and a per-image **"Usar no PATH_IMAGEM"** button — which is
  **ENABLED** here (unlike customer/brand where it is absent or disabled).

### PATH_IMAGEM synchronization — partial (deviation)

Unlike customer/brand (which sync `PATH_IMAGEM` on all three flows), product uses
a **dedicated inline endpoint** and syncs on **two flows only**:

- The write is `productInlineServiceApi.updateProductImagePathInline({ pe_product_id,
  pe_path_imagem, ...apiContext })` (param `pe_path_imagem`, max 300 chars) — **not**
  `generalCallServiceApi.updateTableInlineField`.
- **First upload** (`uploadProductImageAction`): marks primary and writes
  `PATH_IMAGEM`. On URL empty or > 300 chars, skips the write and returns
  `{ success: true, warning }` (partial success; asset not rolled back).
- **Primary change** (`setPrimaryProductImageAction`) and **primary deletion**
  (`deleteProductImageAction`): promote/advance the primary in the Assets API but
  **do NOT write `PATH_IMAGEM`** and do **not** call `revalidatePath`. The intended
  fallback is the manual "Usar no PATH_IMAGEM" button (`updateProductImagePath` in
  `action-product-updates.ts`), which re-reads the product + gallery, enforces the
  300-char limit, detects `alreadyExists`, writes `PATH_IMAGEM`, and
  `revalidatePath("/dashboard/product/${productId}")`.

Keep this partial-sync model in mind: after set-primary/delete, `PATH_IMAGEM` may
be stale until the user (or a future fix) triggers the manual write. Last-image
rejection is enforced both client-side and server-side.

## Server Actions

**Colocated** (`_actions/product-image-gallery-actions.ts`, Zod-validated, strong
ownership via `getAuthorizedProductContext`):

- `uploadProductImageAction(formData)` — Zod `UploadSchema`; MIME/size checks;
  re-reads gallery; first image → primary + `PATH_IMAGEM` write; revalidates the
  detail path + `/dashboard/product` on the PATH_IMAGEM path.
- `setPrimaryProductImageAction(rawProductId, rawAssetId)` — Zod `{ productId,
  assetId: uuid }`; validates asset membership; no `PATH_IMAGEM` write, no
  revalidate.
- `deleteProductImageAction(rawProductId, rawAssetId)` — last-image rejection;
  promotes next candidate; no `PATH_IMAGEM` write, no revalidate.

**Global** (`src/app/actions/`, mostly manual validation, weaker ownership — they
call `getAuthContext()` but generally do **not** re-confirm the product exists):

- `action-product-updates.ts`: `updateProductName`, `updateProductShortDescription`,
  `updateProductImagePath`, `updateProductStock`, `updateProductPrice`,
  `updateProductType`, `updateProductBrand` (and an unused `updateProductDescription`).
- `action-products.ts`: `createProductFromForm`, `updateProductGeneral`,
  `updateProductCharacteristics`, `updateProductTaxValues`, `updateProductFlags`.
- `action-product-description.ts`: the `updateProductDescription` the editor
  actually uses.
- `action-taxonomy.ts`: `createTaxonomyRelationship`, `deleteTaxonomyRelationship`.
- `action-categories.ts`: `loadCategoriesMenuAction`.

There is **no `revalidateProduct()` helper**. Do not trust client-side gating:
direct Server Action calls bypass Client Components, so ownership re-checks and
revalidation must stay server-side. When adding a mutation, prefer Zod + an
ownership re-check (the gallery-action strength) over the manual-`if` global
pattern.

## Cross-Folder Imports

- `@/app/dashboard/product/_components` → `getSafeProductReturnTo` (the detail
  depends on the **catalog** route for back-to-list safety; there is no product
  list of its own).
- `@/app/actions/action-product-updates`, `action-products`,
  `action-product-description`, `action-taxonomy`, `action-categories` for the
  editors/dialogs.
- `@/hooks/use-brands` and `@/hooks/use-ptypes` (which call `action-brands` /
  `action-ptypes`) for the change dialogs.
- `@/services/api-main/product-manager/...`, `product-inline`, `product-update`,
  and `@/services/api-assets/...`.

## Pending API Features

- **Product deletion** — the "deletion" tab renders a disabled "Excluir produto —
  Pendente de API" button. Do not wire until a safe, idempotent delete contract
  exists.
- **"Fornecedor" card** in `ProductTechnicalTab` is a static placeholder
  ("Nenhum fornecedor definido") with no data and no action.
- **Most `ProductFlagsCard` flags are hardcoded to `0`** at the call site — see
  "Editing Architecture".

Do not present these as functional and do not simulate them.

## Conventions for Changes

- Keep `page.tsx`, `ProductDetailLayout`, `ProductOverview`, and
  `ProductIdentitySection` as Server Components. Keep `"use client"` on the
  interactive leaves and on `ProductDetailTabs`, which owns the tabs state.
- Keep route-exclusive components in `[id]/_components`, files in kebab-case,
  and React component exports in PascalCase. Group new components by
  `overview`, `tabs`, or `image-gallery` according to responsibility.
- When adding an editable field, align together: the `UIProductManager` field
  (transformers), the inline/update service method, the global action signature,
  and the editor/tab card. There is **no** route-local Zod schema file for these
  mutations (unlike the gallery actions).
- When changing gallery behavior, keep `getProductGalleryInitialState` cached and
  shared between the gallery node and the PATH_IMAGEM selector node, and keep the
  `PATH_IMAGEM` 300-char guard. Remember set-primary/delete do **not** sync
  `PATH_IMAGEM` today.
- Two `updateProductDescription` actions exist — pick one and delete the other;
  do not add a third.
- After editing prices/stock, the UI does `window.location.reload()`. If you
  switch to `router.refresh()`, remove the reload and add `revalidatePath` to the
  actions.
- Preserve accessibility: `aria-pressed` on gallery thumbnails, `aria-live` status
  in the gallery, keyboard navigation in the zoom dialog, and descriptive labels
  on icon-only buttons.
- Use `createLogger()` for relevant errors (note the `@/lib/logger` vs
  `@/core/logger` alias split) and return generic, safe Brazilian Portuguese
  messages to the client.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Route, Server Action, cache behavior, or integration changes: also run
  `pnpm build` when viable.
- Visual or interactive changes: validate `/dashboard/product/[id]` in the
  development server (port set by the `PORT` env var) on desktop and mobile, including: valid and
  invalid IDs (`not-found.tsx`), the `returnTo` back link (catalog and brand
  variants), each inline editor (name, short desc, full desc, general,
  characteristics, tax), the flags card, pricing and stock (page reload), the
  category add/delete dialogs, the brand/type change dialogs, the gallery
  upload/primary/delete/zoom, the manual "Usar no PATH_IMAGEM" flow, and the
  disabled deletion tab.
- This project currently has no automated test command; do not invent one.
