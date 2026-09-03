# Supplier Detail Route Agent Guide

This guide complements the repository, dashboard, `suppliers/AGENTS.md`, and
`docs/architectural-patterns/registration-details-page/registration-details-page.md`
guides for `/dashboard/suppliers/[id]`.

## Composition

`page.tsx` is a Server Component and owns request-dependent orchestration:

1. Call `connection()` and resolve `params` plus `searchParams`.
2. Validate the ID as a positive safe integer; use `notFound()` otherwise.
3. Resolve `returnTo` with `getSafeSupplierReturnTo()`.
4. Resolve `getAuthContext()` and fetch `getSupplierById()`.
5. Map `SupplierNotFoundError` to `notFound()` and rethrow unexpected failures.
6. Build the gallery and image-list nodes under page-owned `Suspense` boundaries.
7. Pass the `UISupplier` DTO and composed nodes to `SupplierDetailLayout`.

The page must not own client state. Never pass `apiContext`, raw API entities,
tokens, or internal errors to components.

## Folder Structure

```text
[id]/
├── page.tsx
├── loading.tsx
├── error.tsx
├── not-found.tsx
├── _actions/
│   └── supplier-image-gallery-actions.ts
└── _components/
    ├── supplier-detail-layout.tsx
    ├── supplier-detail-field.tsx
    ├── supplier-detail-utils.ts
    ├── overview/
    │   ├── supplier-head-data-section.tsx
    │   ├── supplier-general-section.tsx
    │   ├── supplier-person-overview.tsx
    │   ├── supplier-person-type-section.tsx
    │   ├── supplier-personal-section.tsx
    │   └── supplier-business-section.tsx
    ├── tabs/
    │   ├── supplier-detail-tabs.tsx
    │   ├── supplier-notes-tab.tsx
    │   ├── supplier-address-tab.tsx
    │   ├── supplier-status-tab.tsx
    │   ├── supplier-internet-tab.tsx
    │   ├── supplier-miscellaneous-tab.tsx
    │   ├── supplier-editing-tab.tsx
    │   └── supplier-deletion-tab.tsx
    └── image-gallery/
        ├── index.ts
        ├── image-gallery-constants.ts
        ├── image-gallery-types.ts
        ├── image-gallery-skeleton.tsx
        ├── supplier-image-gallery-server.tsx
        ├── supplier-image-gallery-refresh.tsx
        ├── supplier-image-gallery.tsx
        ├── supplier-images-list-server.tsx
        └── supplier-images-list.tsx
```

Structural shells (grid/back link, record heading, tab list/triggers, image
tab composition, deletion frame, detail skeleton) come from
`@/app/dashboard/_components/detail-page` and must not be forked here. Tab
order: **Anotações**, Endereço, Status, **Imagem**, Internet, Diversos, Edição,
**Exclusão** (always last). The header avatar renders only below `lg`; on
desktop the sticky gallery is the single image surface.

## Layout and Responsive Behavior

`SupplierDetailLayout` is a Server Component. It renders:

- A safe back-to-suppliers link.
- A two-column desktop grid with a sticky gallery on the left and overview on
  the right.
- A compact heading with name, ID, status, and person type; the avatar renders
  only below `lg` (on desktop the sticky gallery is the single image surface).
- Independent overview cards.
- Full-width detail tabs below the grid.

Below `lg`, hide the left gallery and render the same gallery node inside the
image tab. The tabs scroll horizontally with complete labels on small screens
and use an eight-column grid on desktop.

## Overview

Every independent card lives in its own file. `SupplierPersonOverview` is the
only presentation-state coordinator: it selects which of the physical-person or
legal-entity cards is visible. The selection is intentionally visual only and
must not persist a person-type change.

Resolve the current type from `typePersonId`, then the legacy
`legalPhysicalType` value (`F` or `J`). Keep this compatibility until the API
contract removes the legacy fallback.

## Tabs and Editing

`SupplierDetailTabs` composes triggers and panels only. Common sections follow
the standard order: notes, address, status, images, internet, miscellaneous,
editing, and deletion.

Editing remains one form for `name` and `notes`, implemented only in
`SupplierEditingTab`. It calls `updateSupplierAction`, displays field errors,
and runs `router.refresh()` on success. Do not introduce page-wide form state.

Supplier status mutation is enabled in `SupplierStatusTab`. Activation and
deactivation require confirmation and call `setSupplierStatusAction`.

Deletion is enabled in `SupplierDeletionTab`. It requires confirmation, calls
`deleteSupplierAction`, and navigates to the sanitized `returnTo` path after
success. The API remains responsible for referential validation.

The shared create/update/status/delete actions stay in
`../_actions/supplier-actions.ts` because the list and detail features share
them. Do not duplicate those actions under `[id]/_actions`.

## Gallery Invariants

The Assets API is the source of truth for the image set; `PATH_IMAGEM` on
`tbl_fornecedor` is a denormalized pointer used by registry surfaces.

- Entity type: `SUPPLIERS`.
- Maximum gallery size: 7 images.
- Maximum file size: 2 MB.
- Accepted types: JPEG, PNG, GIF, and WebP.
- The last remaining image cannot be deleted.
- First upload, primary change, primary deletion, and the first-card manual
  "Atualizar" action must synchronize
  `PATH_IMAGEM` through `generalCallServiceApi.updateTableInlineField`.
- The manual action must re-read the supplier and gallery server-side, use the
  primary image's original URL, and skip an identical `PATH_IMAGEM` write.
- Preserve the 300-character guard and partial-success warning behavior.

`getSupplierGalleryInitialState()` uses React `cache()` to deduplicate the
gallery and image-list read within one server render. Do not use this as a
cross-user or cross-organization cache.

Gallery mutations and manual PATH synchronization stay in
`_actions/supplier-image-gallery-actions.ts`. They
must re-resolve authentication and supplier access, repeat file/count/ownership
validation on the server, and revalidate the list and detail routes.

## Server and Client Boundaries

Keep these server-side:

- `page.tsx`;
- `SupplierDetailLayout`;
- heading and overview cards outside an interactive coordinator;
- gallery server loaders.

Keep `"use client"` limited to:

- `SupplierPersonOverview` and the cards imported by that interactive subtree;
- `SupplierDetailTabs` and the tab components it imports;
- editing, status, and deletion tabs;
- interactive gallery components.

## Verification

- Run `pnpm lint` after TypeScript or React changes.
- Run `pnpm build` after route, Server Action, cache, or integration changes.
- Validate desktop and mobile layouts in the browser.
- Check valid/invalid IDs, the safe back link, edit errors/success, status
  confirmation, delete confirmation/redirect, and gallery flows separately.
- This project has no automated test command; do not invent one.
