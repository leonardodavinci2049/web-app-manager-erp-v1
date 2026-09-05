# Product Route Agent Guide

This file complements the repository and dashboard guides for
`src/app/dashboard/product`. It governs the canonical `/dashboard/product`
catalog page, its loading state, and its child routes.

For changes inside `_components`, also read `_components/AGENTS.md`.

## Route Purpose

`/dashboard/product` is the canonical product catalog route. It supports:

- Product search, sorting, and combined catalog filters.
- Grid and list presentation, with a desktop table for list mode.
- Numbered pagination plus "load more" accumulation through the `accum` query parameter.
- Navigation to product details while preserving the current catalog URL.
- Inline updates for product name, prices, stock, and categories.
- Main-image upload when a product has no valid image.

Do not move this functionality back to `src/app/dashboard/page.tsx`; that page
is reserved for session-aware redirection.

## Route Structure

```text
product/
├── AGENTS.md
├── page.tsx                         # Authentication context and data reads
├── loading.tsx                      # Route-specific loading UI
├── error.tsx                        # Route-specific error boundary
├── _actions/                        # Catalog-specific Server Actions
├── _components/
│   ├── AGENTS.md                    # Component-level conventions
│   ├── index.ts                     # Public exports used by the page
│   ├── catalog-shell.tsx
│   ├── catalog-loading-products.tsx
│   ├── catalog-toolbar/
│   ├── product-grid/
│   ├── product-card/
│   ├── lib/
│   └── types/
├── [id]/                            # Product detail route; has its own guide
└── new-product/                     # Standalone product creation route
```

Most mutations consumed by the catalog remain in the global Server Actions
under `src/app/actions`, including product updates, taxonomy relationships, and
category reads. Catalog image upload uses the colocated
`_actions/product-list-image-actions.ts` action so the uploaded asset is made
primary and its original URL is synchronized to `PATH_IMAGEM`.

## Page Responsibilities

Keep `page.tsx` as a Server Component. It should:

1. Execute at request time because the reads depend on request and organization
   context.
2. Await `searchParams`.
3. Obtain authenticated API context through `getAuthContext()`.
4. Parse URL state with `parseCatalogSearchParams()`.
5. Convert UI sorting with `mapSortToApiParams()`.
6. Fetch products, brands, categories, and product types in parallel.
7. Flatten the taxonomy with `flattenCategories()`.
8. Build detail-page return navigation with
   `buildCatalogReturnTo(searchParams, "/dashboard/product")`.
9. Render `CatalogShell` with minimal UI DTOs.

Do not duplicate filter parsing or URL construction in `page.tsx`.

## Authentication and Data Isolation

- `getAuthContext()` is mandatory for catalog data reads.
- Authentication does not replace organization and resource authorization in
  Server Actions or services.
- Never pass `apiContext`, session objects, tokens, raw integration entities, or
  internal errors to Client Components.
- Catalog reads are organization-dependent. Do not add `"use cache"` unless
  the cache key safely isolates organization and any other private context.
- Read the closest service-level `AGENTS.md` before modifying a module under
  `src/services/api-main`.

## Integration Failures

The page intentionally isolates failures from each catalog integration:

- Log relevant failures with `createLogger("CatalogPage")`.
- Product failures fall back to an empty product result and zero total.
- Brand, category, and product-type failures fall back to empty collections.
- Keep client-facing output generic and safe.

Do not replace these isolated fallbacks with one catch that prevents the entire
catalog from rendering unless the product requirement changes.

## URL State

`_components/lib/search-params.ts` is the source of truth for URL parsing and
construction. Use its public helpers instead of rebuilding query strings.

| Parameter | Accepted value | Purpose |
| --- | --- | --- |
| `search` | text, up to 300 characters | Product search |
| `category` | positive integer | Taxonomy filter |
| `brand` | positive integer | Brand filter |
| `type` | positive integer | Product-type filter |
| `supplier` | positive integer | Supplier filter |
| `physical` | positive integer | Physical-product filter |
| `ean` | text | EAN filter |
| `sales-list` | `1`–`3` | Sales presets |
| `stock-list` | `1`–`3` | Stock presets |
| `advanced` | `1`–`2` | Advanced presets |
| `various-list` | `1`–`6` | Product flag presets |
| `registration-period` | `1` | Enables the date interval |
| `start-date` | `YYYY-MM-DD` | Interval start |
| `end-date` | `YYYY-MM-DD` | Interval end |
| `no-image` | `1` | Products without images |
| `no-description` | `1` | Products without descriptions |
| `no-sales-copy` | `1` | Products without sales copy |
| `imported` | `1` or `2` | Imported/national state |
| `inactive` | `0`, `1`, or `2` | Product activity state |
| `premium` | `1` | Premium products |
| `sort` | supported sort identifier | Catalog ordering |
| `limit` | `25`, `50`, `100` (default `50`) | Page size selected in the filter panel |
| `page` | non-negative integer | Current page (zero-based) |
| `accum` | non-negative integer (default `0`, capped by `MAX_REGISTRY_EXTRA_BATCHES`) | Extra batches appended by "Carregar mais" on top of `page`; any filter/search/sort/limit change or page selection resets it |


The grid/list view mode is not URL state. It remains a browser preference in
`localStorage` under `catalog:product-view-mode`.

## Loading and Navigation

- Keep `loading.tsx` colocated with the catalog route.
- Its structure should reflect the catalog header, toolbar, and result
  skeletons without fetching catalog data.
- Canonical catalog links must use `/dashboard/product`.
- Product detail links may include an encoded `returnTo` containing the
  current catalog filters.
- Return navigation must accept only safe same-origin catalog paths.
- New-product success and cancellation flows should return to
  `/dashboard/product`.

## Change Coordination

- A new or changed filter must update the filter type, parser, URL builder,
  toolbar control, active-filter display, and API mapping together.
- A new sort option must align the option list, validation set, and API mapping.
- Preserve query parameters when changing only pagination or building a detail
  link.
- Keep grid, compact-list, and desktop-table behavior functionally aligned.
- Use Brazilian Portuguese for user-facing catalog text and US English for
  code, comments, and documentation.

## Verification

- Documentation-only changes: review Markdown structure and paths.
- TypeScript or React changes: run `pnpm lint`.
- Route data loading, Server Actions, cache behavior, or integrations: also run
  `pnpm build` when viable.
- Visual or interactive changes: validate `/dashboard/product` in the
  development server on desktop and mobile, including search, combined filters,
  active-filter removal, grid/list switching, pagination, empty state, detail
  return, inline edits, and upload.
- This project currently has no automated test command; do not invent one.
