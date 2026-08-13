# Product Catalog Components Agent Guide

This guide governs `src/app/dashboard/product/_components`. It complements the
repository, dashboard, and `product/AGENTS.md` guides. The closest applicable
guide specializes broader instructions; repository-level rules still prevail
in case of conflict.

## Overview

This folder groups **all the components of the product catalog screen**. The
route page (`../page.tsx`) fetches data on the server and renders
[`CatalogShell`](./catalog-shell.tsx). The entire UI — toolbar, filters, grid,
cards, and inline editors — lives here.

The core philosophy is **URL as the single source of truth for data filters** and **Server Components by default, Client Components isolated to the smallest possible scope**. The **view mode** (grid/list) is an exception: it is a display preference stored in `localStorage` (client-side), never in the URL, so toggling it is instant and does not trigger a data refetch.

## File Structure

```
_components/
├── index.ts                          # Public export barrel for the folder
├── catalog-shell.tsx                 # Shell (Server) that composes toolbar + grid
├── category-tags.tsx                 # Category tags/badges (Server)
├── product-image-upload.tsx          # Drag & drop image upload (Client)
├── add-category-inline-dialog.tsx    # Dialog to link category (Client)
├── lib/
│   ├── search-params.ts             # URL <-> filters mapping (pure)
│   └── category-helpers.ts          # Taxonomy flattening + level prefix
├── types/
│   └── catalog-types.ts             # CatalogFilters, CategoryOption, etc.
├── catalog-toolbar/
│   ├── catalog-toolbar.tsx          # Orchestrator (Client): URL filters + view mode (localStorage)
│   ├── catalog-search.tsx           # Search input (Client)
│   ├── view-mode-toggle.tsx         # Grid/list toggle (Client, instant — no URL)
│   └── filter-panel/
│       └── filter-panel.tsx         # Advanced filters sheet (Client)
├── product-grid/
│   ├── product-grid.tsx             # Grid layout + empty state (Server)
│   ├── product-grid-skeleton.tsx    # Loading skeletons (Server)
│   └── load-more-button.tsx         # Pagination via limit searchParam (Client)
└── product-card/
    ├── product-card.tsx             # Card (grid/list variants) (Server)
    ├── product-card-fields.tsx      # SKU/brand/type metadata (Server)
    ├── product-image-section.tsx    # Image + badges + upload fallback (Client)
    └── inline-update/
        ├── inline-name-editor.tsx     # Edit name (Client)
        ├── inline-price-editor.tsx    # Edit retail/wholesale/corporate prices (Client)
        ├── inline-stock-editor.tsx    # Edit stock (Client)
        └── inline-category-editor.tsx # Manage category connections (Client)
```

## Data Flow

```
page.tsx (Server)
  ├── reads searchParams + calls services (api-main/*)
  ├── mapSortToApiParams / buildCatalogReturnTo  (lib/)
  └── <CatalogShell>
        ├── renders <ProductGrid> (Server) twice: grid + list variants
        └── <CatalogToolbar> (Client)
              ├── reads/writes searchParams via router.replace() (data filters only)
              │     ├── <CatalogSearch>      ─> `search` searchParam
              │     ├── <FilterPanel>        ─> category / brand / type / stock / sort
              │     └── <ViewModeToggle>     ─> client state (localStorage) — grid|list, instant
              └── renders grid OR list variant based on client viewMode (no refetch on toggle)
                    ├── <ProductCard> (Server)
                    │     ├── <ProductImageSection> (Client) ─> upload or display
                    │     ├── <InlineNameEditor>    (Client) ─> action-product-updates
                    │     ├── <InlinePriceEditor>   (Client) ─> action-product-updates
                    │     ├── <InlineStockEditor>   (Client) ─> action-product-updates
                    │     └── <InlineCategoryEditor>(Client) ─> action-taxonomy
                    └── <LoadMoreButton> (Client)   ─> `limit` searchParam (+50)
```

The complete query-parameter contract is documented in `../AGENTS.md`. Object
<-> URL mapping is **always** handled in
[`lib/search-params.ts`](./lib/search-params.ts)
(`parseCatalogSearchParams`, `buildCatalogUrl`, `buildCatalogReturnTo`,
`buildProductDetailsHref`, `mapSortToApiParams`, `SORT_OPTIONS`). Do not
reimplement this logic elsewhere.

The `view` preference (`grid` or `list`) is not a search parameter. It remains
in `localStorage` under `catalog:product-view-mode` and is managed by
`CatalogToolbar`.

## Server / Client Boundaries

- **Server Components (default):** `catalog-shell`, `product-grid`, `product-grid-skeleton`, `product-card`, `product-card-fields`, `category-tags`. They only read props and render — no `useState`, no `useRouter`.
- **Client Components (`"use client"`):** reserved for actual interactivity — toolbar (URL/overlay), toggles, inline editors, uploaders. Keep `"use client"` in the **smallest component possible** and receive data via props.
- Why are the grid and list variants both passed to the toolbar? The toolbar (Client) renders only one based on the client-side `viewMode`, so toggling is instant (no URL navigation, no data refetch). Both variants are Server Component subtrees built by `CatalogShell`.

## Inline Editors (Mutations)

Each editor in `product-card/inline-update/` follows the same pattern:

1. Local buffer (`tempX`) + display value (`displayX`).
2. Local validation (size/range) with error `toast`.
3. Calls the appropriate **Server Action** in `@/app/actions/*`.
4. On success: updates `displayX`, exits edit mode, and triggers `router.refresh()` to sync with the server.

Actions consumed: `action-product-updates` (name, price, stock), `action-product-images` (upload), `action-taxonomy` (linkages), `action-categories` (category menu).

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
- **Pagination** is heuristic via `limit` (+50), not via `page`. Although `page` is forwarded to the API, the UI uses the `LoadMoreButton`.
- **Currency/price** use Brazilian formatting (decimal comma) in inputs; `formatCurrency` handles the display.

## Post-change Verification

- TS/React changes: `pnpm lint` (Biome).
- Changes in routes/Server Actions/caching/integrations: `pnpm build` when viable.
- Visual/interactive changes: validate using `pnpm dev` (port set by the `PORT` env var).
