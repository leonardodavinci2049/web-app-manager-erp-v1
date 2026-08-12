# Product Route Agent Guide

This file complements the repository and dashboard guides for
`src/app/dashboard/product`. It covers the `product/` redirect, the
`product/new-product/` create flow, and the `product/import-products/` placeholder,
plus the cross-cutting conventions and anomalies that apply to the whole segment.

The product **detail** route (`[id]`) has its own guide: `[id]/AGENTS.md`. Read it
before changing the detail page or any of its editors, dialogs, or gallery.

## Important: there is no product list here

`product/page.tsx` is a **redirect to `/dashboard/catalog`**. Product listing,
search, URL state, grid/list view mode, pagination, and the create sheet all live
in `src/app/dashboard/catalog` — document and change list behavior there, not
here. The bare `/dashboard/product` path redirects so it never 404s.

## Folder Structure

```text
product/
├── AGENTS.md
├── page.tsx                             # redirect("/dashboard/catalog")
├── [id]/                                # Detail route (see [id]/AGENTS.md)
│   └── AGENTS.md
├── new-product/                         # Create flow
│   ├── page.tsx                         # Server: header + <Suspense> form
│   ├── validation.ts                    # DEAD CODE — not imported by the route
│   └── components/
│       ├── new-product-header.tsx       # Server: SiteHeaderWithBreadcrumb
│       ├── new-product-form.tsx         # Client: next/form + inline validate -> createProductFromForm
│       └── forms/
│           ├── form-inputs.tsx          # Client: FormInput/Textarea/Currency/Integer inputs
│           └── submit-button.tsx        # Client: SubmitButton (useFormStatus)
└── import-products/
    └── page.tsx                         # Placeholder: <UnderDevelopment title="Importar Produtos" />
```

## new-product (create)

`new-product/page.tsx` is a **Server Component** shell: it renders
`NewProductHeader` (breadcrumb Início / Produtos (`/dashboard/catalog`) / Adicionar
Novo Produto), a `PageTitleSection`, and `<NewProductForm/>` inside `<Suspense>`.
It does **not** call `connection()` or `getAuthContext()` and fetches nothing —
auth happens inside the Server Action.

`NewProductForm` (Client) uses `next/form` with `action={handleFormSubmit}`:

1. `validateForm(formData)` runs **client-side** rules (name ≥ 3 chars; each price
   valid, non-zero, ≤ 2 000 000; `wholesalePrice <= retailPrice`; stock rules;
   `brandId`/`typeId` positive integers). On error it toasts, sets validation
   errors, and focuses the first invalid field.
2. On success it `await createProductFromForm(formData)` (from
   `@/app/actions/action-products`). On `success && productId` it toasts, calls
   `router.refresh()`, and `router.push("/dashboard/catalog")`.
3. Cancel navigates to `/dashboard/catalog`.

Form cards: Informações Básicas (name, reference), Preços (wholesale/retail/
corporate via `FormCurrencyInput`, which keeps a comma display + dot hidden
input), Estoque (`FormIntegerInput`), Marca e Tipo (`FormPositiveIntegerInput`),
Informações Adicionais (`FormTextarea`). `SubmitButton` uses `useFormStatus()`.

`createProductFromForm` (in `src/app/actions/action-products.ts`) validates with
Zod `createProductFormSchema` (name 6–300, finite positive prices ≤ 2 000 000,
`.refine(wholesalePrice <= retailPrice)`), auto-slugs via
`generateSlugFromName`, optionally validates the taxonomy hierarchy via
`getTaxonomyMenuManager`, and calls `productBaseServiceApi.createProduct`. It
derives the new ID from `extractStoredProcedureResult(response)?.sp_return_id`
and does **not** call `revalidatePath` (the form does `router.refresh()` +
`router.push`).

### new-product gotchas

- `validation.ts` (`CreateProductFormSchema`, `formatPrice`/`formatStock`/
  `formatTags`) is **dead code** — not imported by this route. The form uses
  inline `validateForm`; the server uses `createProductFormSchema` from
  `action-products.ts`. Do not treat `validation.ts` as the source of truth.
- A hidden `<input name="businessType" value="1">` is sent but **not consumed**
  by the server schema.
- `page.tsx` has an import-path typo: `import { NewProductForm } from
  ".//components/new-product-form"` (double slash). It resolves today; fix when
  touching the file.
- `slug`, `model`, `description`, `tags`, and family/group/subgroup IDs exist in
  `CreateProductData` / `createProductFormSchema` but are **not rendered** — the
  form collects a subset only.

## import-products (placeholder)

`import-products/page.tsx` renders `<UnderDevelopment title="Importar Produtos" />`
(from `@/components/common/under-development`). No data, no auth, no actions. This
is a stub — do not document behavior beyond "placeholder".

## Cross-Cutting Conventions and Anomalies

The product route diverges from the customer/brand conventions in several ways.
Read this section before assuming the usual pattern.

### Server Actions live in two places

Unlike customer/brand (which colocate actions in `_actions/` inside the route),
product splits mutations across two locations:

1. **Colocated gallery actions**: `[id]/_actions/product-image-gallery-actions.ts`
   — Zod-validated, ownership re-checked via `getAuthorizedProductContext`,
   `createLogger`, `revalidatePath`. Strong pattern (matches customer/brand).
2. **Global actions** under `src/app/actions/`: `action-products.ts`,
   `action-product-updates.ts`, `action-product-description.ts`,
   `action-taxonomy.ts`, `action-categories.ts`. These power the detail editors
   and dialogs. Most use **manual `if` validation (not Zod)**, most do **not
   re-confirm the product exists** before mutating, and revalidation is
   inconsistent (many actions revalidate nothing and rely on the client calling
   `router.refresh()` or `window.location.reload()`).

When adding a product mutation, decide where it belongs: gallery mutations stay
colocated; everything else currently goes in `src/app/actions/`. Prefer Zod and an
ownership re-check to match the gallery-action strength.

### `components/` vs `_components/`

The `[id]` segment uses **both** conventions: `components/` (PascalCase, NOT
underscore-prefixed) holds the detail editors/dialogs/cards, while
`_components/image-gallery/` (underscore, kebab-case) holds the gallery. Files
inside `components/` are PascalCase (`ProductNameEditor.tsx`); gallery files are
kebab-case. This is a deviation from customer/brand (which use `_components/`
exclusively). Do not "normalize" one into the other without a deliberate decision.

### No `error.tsx` anywhere in this route

There is no `error.tsx` at the product list or detail level. `notFound()` in the
detail falls through to the local `[id]/not-found.tsx`; other unhandled errors
bubble to the nearest ancestor boundary.

### Logger and helper import inconsistency

- `createLogger` is imported from **`@/lib/logger`** in the detail page and from
  **`@/core/logger`** in all `src/app/actions/*` and the gallery actions. Both
  define `createLogger`; pick one project-wide when you touch these files.
- `isApiError` is imported from `@/services/api-assets/types/api-assets` in the
  gallery actions and from **`@/types/api-assets`** in
  `action-product-updates.ts`. Two aliases for the same concept.
- There is **no `revalidateProduct()` helper** — every action calls
  `revalidatePath` with literal path strings.

### Two `updateProductDescription` functions

`updateProductDescription` exists in both `action-product-updates.ts` and
`action-product-description.ts`. The description editor imports the **latter**;
the former is unused for this UI. Do not add a third; pick one and remove the
other.

### Hardcoded values and mocked data

- `pe_type_business: 1` is hardcoded in every `getProductManagerById` call
  (detail page, `getAuthorizedProductContext`, `updateProductImagePath`).
- The detail shows a **mocked** star rating ("4.0 de 5 - 23 avaliações") and a
  static "Fornecedor" placeholder card — neither is wired to an API.
- Most `ProductFlagsCard` flags are hardcoded to `0` at the call site. See
  `[id]/AGENTS.md`.

## Services

- `product-manager` (`src/services/api-main/product-manager`): detail read
  `getProductManagerById` (returns `{ product: UIProductManager, relatedCategories:
  UIProductManagerRelatedCategory[] } | undefined`) and list/search helpers used by
  the catalog route.
- `product-inline` (`src/services/api-main/product-inline`): `productInlineServiceApi`
  inline updates — name, short description, description, image path
  (`updateProductImagePathInline`, the PATH_IMAGEM write), stock, stock-min, type,
  brand.
- `product-update` (`src/services/api-main/product-update`): `productUpdateServiceApi`
  stored-procedure-style updates — price, general, characteristics, tax values,
  flags.
- `product-base` (`src/services/api-main/product-base`): `productBaseServiceApi`
  used by `createProductFromForm` (`createProduct`, `extractStoredProcedureResult`).
- `taxonomy-rel` and `taxonomy-base` (`src/services/api-main`): category-relationship
  create/delete and the taxonomy menu used by the category dialogs and create
  validation.
- `api-assets` (`src/services/api-assets`): `assetsApiService` gallery operations.

Read the local `AGENTS.md` inside each service module before changing it.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Route, Server Action, cache behavior, or integration changes: also run
  `pnpm build` when viable.
- Visual or interactive changes: validate `/dashboard/product/new-product`,
  `/dashboard/product/import-products`, and the detail route (see `[id]/AGENTS.md`)
  in the development server (port set by the `PORT` env var) on desktop and mobile, including the
  create flow (valid and invalid input, price/stock rules, success redirect to
  `/dashboard/catalog`) and the redirect behavior of `/dashboard/product`.
- This project currently has no automated test command; do not invent one.
