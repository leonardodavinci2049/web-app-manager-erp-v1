# Product Catalog Components Agent Guide

This guide governs `src/app/dashboard/product/_components`. It complements the
repository, dashboard, and `product/AGENTS.md` guides. The closest applicable
guide specializes broader instructions; repository-level rules still prevail
in case of conflict.

## Overview

This folder groups **all the components of the product catalog screen**. The
route page (`../page.tsx`) fetches data on the server and renders
[`ProductDashboard`](./product-dashboard.tsx). The entire UI — toolbar, filters, grid,
cards, and inline editors — lives here.

The core philosophy is **URL as the single source of truth for data filters** and **Server Components by default, Client Components isolated to the smallest possible scope**. The **view mode** (grid/list) is an exception: it is a display preference stored in `localStorage` (client-side), never in the URL, so toggling it is instant and does not trigger a data refetch.

## File Structure

```
_components/
├── index.ts                          # Public export barrel for the folder
├── product-dashboard.tsx             # Server composition of toolbar + results
├── lib/
│   ├── search-params.ts             # URL <-> filters mapping (pure)
│   └── category-helpers.ts          # Taxonomy flattening + level prefix
├── types/
│   └── product-dashboard-types.ts   # ProductFilters, CategoryOption, etc.
├── product-toolbar/
│   ├── product-toolbar.tsx          # Orchestrator (Client): URL filters + view mode
│   ├── product-search.tsx           # Search input (Client)
│   ├── product-view-mode-toggle.tsx # Grid/list toggle (Client, instant — no URL)
│   ├── product-active-filters-panel.tsx
│   └── filter-panel/
│       ├── product-filter-panel.tsx # Advanced filters sheet (Client)
│       └── category-menu.tsx
├── product-list/
│   ├── product-grid/                # Results composition + skeleton
│   ├── product-card/                # Cards and inline editors
│   ├── product-table.tsx
│   ├── product-image-upload.tsx
│   ├── product-sales-information.tsx
│   ├── category-tags.tsx
│   └── add-category-inline-dialog.tsx
└── product-create/
    ├── product-create-sheet.tsx
    ├── product-create-form.tsx
    └── product-create-form-fields.tsx
```

## Data Flow

```
page.tsx (Server)
  ├── reads searchParams + calls services (api-main/*)
  ├── mapSortToApiParams / buildCatalogReturnTo  (lib/)
  └── <ProductDashboard>
        ├── renders <ProductGrid> (Server) twice: grid + list variants
        └── <ProductToolbar> (Client)
              ├── reads/writes searchParams via router.replace() (data filters only)
              │     ├── <RegistrySearch>      ─> `search` searchParam
              │     ├── <ProductFilterPanel>  ─> category / brand / type / stock / sort
              │     └── <RegistryViewModeToggle> ─> client state (localStorage)
              └── renders grid OR list variant based on client viewMode (no refetch on toggle)
                    ├── <ProductCard> (Server)
                    │     ├── <ProductImageSection> (Client) ─> upload or display
                    │     ├── <InlineNameEditor>    (Client) ─> action-product-updates
                    │     ├── <InlinePriceEditor>   (Client) ─> action-product-updates
                    │     ├── <InlineStockEditor>   (Client) ─> action-product-updates
                    │     └── <InlineCategoryEditor>(Client) ─> action-taxonomy
                    └── <RegistryPagination>/<RegistryLoadMore> (Client) ─> `page`/`accum` searchParams
```

The complete query-parameter contract is documented in `../AGENTS.md`. Object
<-> URL mapping is **always** handled in
[`lib/search-params.ts`](./lib/search-params.ts)
(`parseCatalogSearchParams`, `buildCatalogUrl`, `buildCatalogReturnTo`,
`buildProductDetailsHref`, `mapSortToApiParams`, `SORT_OPTIONS`). Do not
reimplement this logic elsewhere.

The `view` preference (`grid` or `list`) is not a search parameter. It remains
in `localStorage` under `catalog:product-view-mode` and is managed by
`ProductToolbar`.

## Server / Client Boundaries

- **Server Components (default):** `product-dashboard`, `product-grid`, `product-grid-skeleton`, `product-card`, `product-card-fields`, `category-tags`. They only read props and render — no `useState`, no `useRouter`.
- **Client Components (`"use client"`):** reserved for actual interactivity — toolbar (URL/overlay), toggles, inline editors, uploaders. Keep `"use client"` in the **smallest component possible** and receive data via props.
- Why are the grid and list variants both passed to the toolbar? The toolbar (Client) renders only one based on the client-side `viewMode`, so toggling is instant (no URL navigation, no data refetch). Both variants are Server Component subtrees built by `ProductDashboard`.

## Inline Editors (Mutations)

Each editor in `product-card/inline-update/` follows the same pattern:

1. Local buffer (`tempX`) + display value (`displayX`).
2. Local validation (size/range) with error `toast`.
3. Calls the appropriate **Server Action**.
4. On success: updates `displayX`, exits edit mode, and triggers `router.refresh()` to sync with the server.

Actions consumed: `action-product-updates` (name, price, stock),
`../_actions/product-list-image-actions` (upload plus `PATH_IMAGEM` sync),
`action-taxonomy` (linkages), `action-categories` (category menu).

## Relevant External Dependencies

- **UI Types:** `@/services/api-main/{brand,product-manager,ptype,taxonomy-base,taxonomy-rel}/transformers/transformers` (`UIProductManager`, `UIBrand`, `UIPtype`, `UITaxonomyMenuItem`, `UITaxonomyRelProduct`).
- **Shared Types:** `@/types/types` (`SortOption`, `ViewMode`, `ProductCategory`).
- **Utils:** `@/utils/common-utils` (`formatCurrency`) and `@/utils/image-utils` (`getValidImageUrl`, `createImageErrorHandler`).
- **UI (shadcn/ui):** `@/components/ui/*` (`Button`, `Card`, `Input`, `Sheet`, `Dialog`, `Select`, `Badge`, `Switch`, `Table`, `Skeleton`, etc.).

## Local Conventions

- **Public exports** from the folder are exposed via the [`index.ts`](./index.ts) barrel. Internal components can import each other directly.
- **Naming:** Files in kebab-case; components in PascalCase; pure functions in camelCase.
- **Component comments** use US English and explain the Server/Client role and
  component responsibility.
- **No global state**: All **data filters** are managed via the URL (`searchParams`). Do not introduce React contexts or state stores for filters. The **view mode** (grid|list) is the only exception: it is a display preference kept in `localStorage`, not a filter, so it stays client-side and never triggers a refetch.
- **Pagination** combines the shared `RegistryPagination` (`page` searchParam) with `RegistryLoadMore` (`accum` searchParam, fixed-size batches fetched in parallel by `fetchAccumulatedPages`). Page size comes from the filter panel's "Registros por página" select (`limit`, 25/50/100). Any filter change or page selection resets `accum`.
- **Currency/price** use Brazilian formatting (decimal comma) in inputs; `formatCurrency` handles the display.

## Post-change Verification

- TS/React changes: `pnpm lint` (Biome).
- Changes in routes/Server Actions/caching/integrations: `pnpm build` when viable.
- Visual/interactive changes: validate using `pnpm dev` (port set by the `PORT` env var).
