# Report Route Agent Guide

This file complements the repository and dashboard guides for
`src/app/dashboard/report`. It governs the four `/dashboard/report/*` sub-routes:
`panel`, `sales`, `customers`, and `products`.

Read this before changing any file in this segment. For shared dashboard rules
(root redirect, layout, sidebar, auth), follow `src/app/dashboard/AGENTS.md`.

## Route Purpose

The report segment is the "Relatórios" area. There is **no** `report/page.tsx` or
`report/layout.tsx` at this level — a request to `/dashboard/report` with no child
segment returns 404. The sidebar links directly to the four children.

| Sub-route | Sidebar label | What it shows | Status |
| --- | --- | --- | --- |
| `report/panel` | Painel geral | KPI cards + area chart + draggable data table | **Real UI, demo data** |
| `report/sales` | Vendas | "Em Desenvolvimento" construction page | **Placeholder** |
| `report/customers` | Clientes | "Em Desenvolvimento" construction page | **Placeholder** |
| `report/products` | Produtos | "Em Desenvolvimento" construction page | **Placeholder** |

Only `panel` renders report UI today. The other three render the shared
`<DevelopmentPage />` (`src/components/common/DevelopmentPage.tsx`).

## Folder Structure

```text
report/                                    # No page.tsx / layout.tsx here
├── AGENTS.md
├── customers/
│   └── page.tsx                           # Placeholder: header + <DevelopmentPage />
├── panel/
│   ├── page.tsx                           # Server: composes cards + chart + table
│   └── _components/
│       ├── chart-area-interactive.tsx     # Client: Recharts area chart + time-range toggle
│       ├── data-table.tsx                 # Client: @dnd-kit + @tanstack/react-table
│       ├── data.json                      # 68 static demo rows for the DataTable
│       └── section-cards.tsx              # Server: 4 hardcoded KPI cards
├── products/
│   └── page.tsx                           # Placeholder: header + <DevelopmentPage />
└── sales/
    └── page.tsx                           # Placeholder: header + <DevelopmentPage />
```

There are no `loading.tsx`, `error.tsx`, `not-found.tsx`, `_actions/`, `_hooks/`,
or `_utils/` anywhere in this tree.

## Placeholder Pages (`customers`, `products`, `sales`)

Each is a **Server Component** that:

1. Resolves the session with `auth.api.getSession({ headers: await headers() })`
   and redirects to `/sign-in` when unauthenticated (the shared header no longer
   performs this check).
2. Renders `SiteHeaderWithBreadcrumb` (title "Dashboard", breadcrumb
   `Dashboard` → active label).
3. Renders `<DevelopmentPage />`.

They do not call `connection()` or `getAuthContext()`. They import the header via
the relative path `../../_components/header/site-header-with-breadcrumb`.

Do not present these as functional reports. To make one real, follow the
"Conventions for Changes" below.

## Panel Page

`panel/page.tsx` is a **Server Component**. It composes, in order, `SectionCards`,
`ChartAreaInteractive`, and `<DataTable data={data} />` (where `data` is the
`data.json` import). It resolves the session for the sign-in redirect gate (no
`connection()` or `getAuthContext()`) and has no services or Server Actions. It
imports the header via the `@/app/dashboard/...`
alias (note: the placeholder pages use a relative path — pick one style and don't
mix within a change).

### Panel internals

- `SectionCards` (Server): four **hardcoded** KPI cards (Total Revenue, New
  Customers, Active Accounts, Growth Rate) with literal numbers and TrendingUp/
  TrendingDown badges. No props, no fetch.
- `ChartAreaInteractive` (Client): a **Recharts** `AreaChart` (via the shadcn
  `@/components/ui/chart` primitives) driven by a **hardcoded module-level
  `chartData`** array. A `timeRange` toggle (`90d` / `30d` / `7d`) filters against
  a **hardcoded `referenceDate = new Date("2024-06-30")`** — so the time windows
  are anchored to June 30, 2024, not a rolling "now". `useIsMobile()` forces
  `"7d"` on small screens. Copy is in English.
- `DataTable` (Client): `@dnd-kit` drag-and-drop row reordering +
  `@tanstack/react-table` (sort/filter/pagination/column visibility). The rows are
  the **stock shadcn `data.json`** (proposal/documentation metadata — it has no
  relationship to ERP customers/products/sales). A local `z.object` `schema` is
  used **only as a TypeScript type**; `data.json` is imported and trusted as-is.
- `data.json`: 68 static demo rows.

### Demo / non-functional behavior to know

- **Fake save**: the row Target/Limit forms `onSubmit` calls
  `toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), …)`. This
  looks like a save but persists nothing. The drawer "Submit" button is inert.
  Do not mistake this for a real mutation.
- **No data layer**: every number, chart series, and table row is a template
  literal or static import. There is no `src/services/api-main/*` dependency
  anywhere in the report tree.
- **English UI strings** ("Total Revenue", "New Customers", "Total Visitors",
  "No results.") deviate from the Brazilian-Portuguese convention. If the panel
  becomes a real report, translate them.
- **Dead breadcrumb**: the first breadcrumb segment uses `href: "#"` on all four
  pages. If you fix it, fix it consistently across all four.

## Authentication and Data Isolation

Every report page resolves the session and redirects to `/sign-in` when
unauthenticated; none calls `connection()` today. Because there is no real data,
there is no organization-scoped isolation concern yet.

**When real data is wired in**, the customer-route rules apply (see
`src/app/dashboard/customer/AGENTS.md`): every page reading org-scoped data must
call `connection()`, resolve `getAuthContext()`, log with `createLogger()`, return
generic Brazilian-Portuguese messages, and pass only serializable DTOs to Client
Components — never `apiContext`, sessions, tokens, or raw entities. Do not put
`"use cache"` on an org-scoped report read without a cache key that isolates
organization/private context.

## Services and Server Actions

**None.** No `src/services/api-main/*` module is imported anywhere in the report
tree, and there are no `"use server"` files or Server Action invocations. The
DataTable "save" is a client-side `setTimeout` + toast, not a mutation.

## Conventions for Changes

- Keep every `page.tsx` a Server Component. Confine `"use client"` to the smallest
  interactive leaf (already the pattern: only the chart and table are Client).
- When wiring real data to a report page: add `connection()` + `getAuthContext()`,
  fetch through a `src/services/api-main/*` module (and read that module's local
  `AGENTS.md` first), define a serializable DTO, and pass only the DTO to Client
  Components.
- Replace the DataTable fake save with a real Server Action (Zod validation +
  `getAuthContext()` + `revalidatePath`) following the customer-actions pattern;
  do not ship the `setTimeout` pseudo-save as real.
- Keep the two-segment breadcrumb pattern (`Dashboard` → active label). Prefer the
  `@/` alias for new imports; don't mix alias and relative styles in one change.
- The sidebar "Relatórios" group (`src/app/dashboard/_components/app-sidebar/app-sidebar.tsx`)
  is the source of truth for the four report URLs. If a route moves or a label
  changes, update the sidebar, the page's `breadcrumbItems`, and any redirects
  together.
- Keep user-facing text in Brazilian Portuguese and code/comments in US English.

## Verification

- Documentation-only changes: review Markdown structure and references.
- TypeScript or React changes: run `pnpm lint`.
- Route, auth, or integration changes: also run `pnpm build` when viable.
- Visual or interactive changes: validate `/dashboard/report/panel` and the three
  placeholder routes in the development server (port set by the `PORT` env var) on desktop and mobile,
  including the chart time-range toggle, the table sort/filter/reorder, and the
  breadcrumb.
- This project currently has no automated test command; do not invent one.
