# Entry Route Agent Guide

This file complements the repository and dashboard guides for
`src/app/dashboard/entry`. It governs the `/dashboard/entry` list route ("Entradas")
and points to the `/dashboard/entry/[id]` detail route, with emphasis on the URL
state contract consumed by the list toolbar, the filter panel, and the entry
reads.

Read this before changing any file in this segment. For shared dashboard rules
(root redirect, layout, sidebar), follow `src/app/dashboard/AGENTS.md`.

## Route Purpose

The entry segment is the registry for merchandise entries ("Entradas"). It
supports:

- Free-text entry search, sorting, and combined filters on the list page.
- Grid, table, and cards presentation (view mode is a browser preference, not
  URL state).
- Zero-based pagination through the `page` query parameter.
- Creation of new entries and navigation to the detail page while preserving the
  current list URL via `returnTo`.
- Entry detail with overview sections, tabs (summary, items, taxes, notes,
  images, deletion), and inline updates (see the `[id]` folder).

## Folder Structure

```text
entry/
├── AGENTS.md
├── page.tsx                              # List: auth context + getEntriesPage read
├── loading.tsx                           # List segment skeleton
├── error.tsx                             # List error boundary (Client)
├── _actions/
│   ├── entry-actions.ts                  # createEntryAction (list-only mutation)
│   └── entry-filter-actions.ts           # searchEntryFilterSuppliers/Carriers (filter + create combobox search)
├── _components/
│   ├── index.ts                          # Public exports
│   ├── entry-dashboard.tsx               # Server: composes toolbar + collection subtrees
│   ├── entry-create/                     # Client: new entry sheet + form + searchable combobox
│   ├── entry-list/                       # Server: cards, table, collection, pagination
│   ├── entry-toolbar/
│   │   ├── entry-toolbar.tsx             # Client orchestrator: URL filters + view + create
│   │   ├── entry-filter-panel.tsx        # Client: filter sheet content (immediate apply)
│   │   ├── entry-filter-combobox.tsx     # Client: async searchable combobox
│   │   └── use-entry-view-mode.ts        # Client: view mode preference hook
│   ├── lib/
│   │   ├── search-params.ts              # Pure URL <-> state helpers (single source of truth)
│   │   └── format.ts                     # Date/money/number pt-BR formatting
│   └── types/
│       └── entry-dashboard-types.ts      # SearchParams, filter option lists, ActionResult
└── [id]/                                 # Detail route (overview, tabs, gallery)
```

## List Page Responsibilities

Keep `page.tsx` as a Server Component. It should:

1. Opt into request-time execution with `await connection()`.
2. Await `searchParams`.
3. Parse URL state with `parseEntrySearchParams(searchParams)`.
4. Obtain authenticated API context through `await getAuthContext()`.
5. Call `getEntriesPage()` mapping UI filters to API params: `columnId`
   (`entry-date` = 1, `id` = 2, `created-at` = 3), `orderId` (`asc` = 1,
   `desc` = 2), plus the supplier/carrier/model/category/period filters below.
6. Isolate the entries read with `.catch()`: log with
   `createLogger("EntryDashboardPage")`, set `hasLoadError`, and fall back to
   `{ items: [], total: 0 }` so the toolbar and filters still render.
7. Load supplier and carrier options in parallel for the create form and the
   filter panel fallback labels, each with isolated failure fallbacks. The
   create category is hardcoded (`ENTRY_CREATE_CATEGORY`, id 1) and the model
   is restricted to `ENTRY_CREATE_MODEL_OPTIONS` (NACIONAL/IMPORTADO), so no
   taxonomy read is needed.
8. Render `SiteHeaderWithBreadcrumb` and `RegistryPageShell` with
   `EntryDashboard`, passing only UI DTOs.

## URL State

`_components/lib/search-params.ts` is the single source of truth for parsing and
building the list URL. Use `parseEntrySearchParams()`, `buildEntryUrl()`,
`buildEntryDetailHref()`, and `getSafeEntryReturnTo()` instead of rebuilding
query strings.

| Parameter | Accepted value | Purpose |
| --- | --- | --- |
| `search` | text, up to 300 characters | Entry free-text search (`pe_search`) |
| `sort` | `entry-date` (default), `id`, `created-at` | Ordering column (`pe_column_id` 1/2/3) |
| `order` | `asc`, `desc` (default `desc`) | Ordering direction (`pe_order_id` 1/2) |
| `page` | non-negative integer (default `0`) | Page index, zero-based (`pe_page_id`) |
| `limit` | `25`, `50`, `100` (default `50` = `ENTRY_PAGE_SIZE`) | Page size (`pe_qt_records`) |
| `accum` | non-negative integer (default `0`, capped by `MAX_REGISTRY_EXTRA_BATCHES`) | Extra batches appended by "Carregar mais" on top of `page`; any filter/search/sort/limit change or page selection resets it |
| `supplier` | positive integer (default `0` = all) | Supplier filter (`pe_supplier_id`) |
| `carrier` | positive integer (default `0` = all) | Carrier filter (`pe_carrier_id`) |
| `model` | `0` (default, all), `1` Nacional, `2` Importado | Model filter (`pe_modelo_id`) |
| `category` | `0` (default, all), `1` Entrada de Produtos | Hardcoded category filter (`pe_category_id`; no API category load) |
| `operation-list` | `0` Ignorar (default), `1` Data de cadastro, `2` Data de lançamento, `3` Data de entrada no estoque | Date column for the period filter (`pe_flag_operation_list`) |
| `start-date` | `YYYY-MM-DD` | Period start (`pe_start_date`); only emitted when `operation-list` is `1`–`3` |
| `end-date` | `YYYY-MM-DD` | Period end (`pe_end_date`); only emitted when `operation-list` is `1`–`3` |

Rules:

- `start-date`/`end-date` are ignored (and omitted from the built URL) when
  `operation-list` is `0`; invalid ISO dates fall back to `""`.
- Invalid enum values (`model`, `category`, `operation-list`, `sort`, `order`,
  `limit`) fall back to their defaults during parsing.
- Detail-only parameter: `returnTo` — same-origin URL whose pathname is exactly
  `/dashboard/entry`, validated by `getSafeEntryReturnTo()`.

The grid/table/cards view mode is **not** URL state. It is a browser preference
kept in `localStorage` under `dashboard:entry-view-mode` and managed by
`EntryToolbar` via `useEntryViewMode()`. Toggling it is instant and never
triggers a refetch.

## Filter Panel Behavior

`EntryFilterPanel` renders inside the shared `RegistryFilterSheet` **without**
`onApply`, so the footer keeps only the "Limpar filtros" action:

- Supplier and carrier are async searchable comboboxes (`EntryFilterCombobox`)
  that merge the server-provided initial options with additional results loaded
  via the `searchEntryFilterSuppliers`/`searchEntryFilterCarriers` Server Actions
  (backed by `searchAllSuppliers`/`searchAllCarriers`, server-only). They always
  offer the "Todos" option (`0`).
- Model and category are simple selects fed by the hardcoded option lists
  `ENTRY_MODEL_OPTIONS` and `ENTRY_CATEGORY_OPTIONS` from
  `entry-dashboard-types.ts`.
- All filters and the ordering apply **immediately** to the URL (through
  `applyFilters`, which resets `page` to `0`) and keep the panel open.
- The period is the only draft-based group: dates are held in draft and applied
  exclusively by the "Aplicar período" button once both dates form a valid
  interval (`start <= end`). Selecting "Ignorar" applies immediately and clears
  the dates. Mode changes to `1`–`3` apply immediately when the draft interval
  is already valid.
- Sort/order and records-per-page remain the **last fields of the scrollable
  area**, never in the fixed footer.
- Active-filter chips (`RegistryActiveFilters` in `EntryToolbar`) include the new
  filters; each chip has a removal case in `removeFilter`, and supplier/carrier
  labels fall back to `ID <n>` when the option is not in the loaded set.

## Server Actions

- `createEntryAction()` (`_actions/entry-actions.ts`): validates the create
  payload (model restricted to `ENTRY_CREATE_MODEL_OPTIONS`; category fixed to
  `ENTRY_CREATE_CATEGORY` id 1), derives the new ID, revalidates
  `/dashboard/entry`.
- `searchEntryFilterSuppliers(search)` / `searchEntryFilterCarriers(search)`
  (`_actions/entry-filter-actions.ts`): read-only searches shared by the filter
  and create comboboxes. They re-resolve `getAuthContext()`, trim/limit the
  term (max 300), return minimal `{ id, label }` DTOs, and fall back to `[]` on
  failure.

## Services

- `entry` (`src/services/api-main/entry`): `getEntriesPage` maps the URL state
  to `pe_supplier_id`, `pe_carrier_id`, `pe_modelo_id`, `pe_category_id`,
  `pe_flag_operation_list`, `pe_start_date`, and `pe_end_date`. The period is
  only sent when `operationList > 0` and both dates are present; otherwise the
  flag is `0` and the dates are `null`.
- `supplier` / `carrier`: `searchAllSuppliers` / `searchAllCarriers` power the
  filter and create combobox searches; `getSuppliersPage` / `getCarriersPage`
  feed the create-form options and filter label fallbacks.

Read the local `AGENTS.md` inside each service module before changing it.

## Conventions for Changes

- Preserve `page.tsx` as a Server Component; keep `"use client"` isolated in the
  smallest possible component.
- When adding or changing a list filter, update together: the type and option
  list in `entry-dashboard-types.ts`, `parseEntrySearchParams()` and
  `buildEntryUrl()` in `lib/search-params.ts`, the filter control in
  `entry-filter-panel.tsx`, the active-filter chips and `removeFilter` logic in
  `entry-toolbar.tsx`, the reset in `getDefaultFilters`, the `getEntriesPage`
  mapping, and the call in `page.tsx`. Any filter change must reset `page` to
  `0`.
- Do not change the public API contract (`EntryFindAllRequest`); new filters map
  onto existing `pe_*` fields.
- Keep user-facing text in Brazilian Portuguese and code, comments, and
  technical documentation in US English.
- Use `createLogger()` for relevant errors and return generic, safe messages to
  the client.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Route, Server Action, cache behavior, or integration changes: also run
  `pnpm build` when viable.
- Visual or interactive changes: validate `/dashboard/entry` in the development
  server (port set by the `PORT` env var), including search, each filter,
  combined filters, the period draft/apply flow, active-filter removal, clear,
  pagination reset on filter change, and the `returnTo` back link.
- This project currently has no automated test command; do not invent one.
